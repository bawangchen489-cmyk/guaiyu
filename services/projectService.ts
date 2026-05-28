import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Project } from '../types'
import { INITIAL_PROJECTS } from '../constants'

export interface ProjectRow {
    id: number
    title: string
    author: string
    image: string
    avatar: string
    likes: number
    views: string
    height: string
    category: string
    description: string
    project_date: string
    client: string
    tools: string
    created_at: string
    deleted_at: string | null
}

// 将数据库行转换为前端 Project 类型
function rowToProject(row: ProjectRow): Project {
    return {
        id: row.id,
        title: row.title,
        author: row.author,
        image: row.image,
        avatar: row.avatar,
        likes: row.likes,
        views: row.views,
        height: row.height,
        category: row.category,
        description: row.description,
        date: row.project_date,
        client: row.client,
        tools: row.tools,
    }
}

// 将前端 Project 转换为数据库行格式
function projectToRow(project: Partial<Project>): Partial<ProjectRow> {
    const row: any = {}
    if (project.title !== undefined) row.title = project.title
    if (project.author !== undefined) row.author = project.author
    if (project.image !== undefined) row.image = project.image
    if (project.avatar !== undefined) row.avatar = project.avatar
    if (project.likes !== undefined) row.likes = project.likes
    if (project.views !== undefined) row.views = String(project.views)
    if (project.height !== undefined) row.height = project.height
    if (project.category !== undefined) row.category = project.category
    if (project.description !== undefined) row.description = project.description
    if (project.date !== undefined) row.project_date = project.date
    if (project.client !== undefined) row.client = project.client
    if (project.tools !== undefined) row.tools = project.tools
    return row
}

// ============================================================
// LOCAL MODE: 仅当 Supabase 未配置时使用 localStorage
// ============================================================
const LOCAL_USER_PROJECTS_KEY = 'guaiyu_user_projects'
const LOCAL_DELETED_KEY = 'guaiyu_deleted_projects'

function getLocalUserProjects(): Project[] {
    try {
        const raw = localStorage.getItem(LOCAL_USER_PROJECTS_KEY)
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}

function saveLocalUserProjects(projects: Project[]): void {
    try { localStorage.setItem(LOCAL_USER_PROJECTS_KEY, JSON.stringify(projects)) }
    catch (e) { console.error('localStorage 写入失败:', e) }
}

function getLocalDeletedProjects(): Project[] {
    try {
        const raw = localStorage.getItem(LOCAL_DELETED_KEY)
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}

function saveLocalDeletedProjects(projects: Project[]): void {
    try { localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify(projects)) }
    catch (e) { console.error('localStorage 写入失败:', e) }
}

// ============================================================
// CRUD 操作
// ============================================================

/**
 * 获取所有活跃项目（未删除的）
 */
export async function getProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) {
        // 本地模式：INITIAL_PROJECTS + 用户作品，排除已删除的
        const userProjects = getLocalUserProjects()
        const deletedIds = new Set(getLocalDeletedProjects().map(p => String(p.id)))
        const initialIds = new Set(INITIAL_PROJECTS.map(p => String(p.id)))
        const userOnly = userProjects.filter(p => !initialIds.has(String(p.id)) && !deletedIds.has(String(p.id)))
        const initialActive = INITIAL_PROJECTS.filter(p => !deletedIds.has(String(p.id)))
        return [...userOnly, ...initialActive]
    }

    // Supabase 模式：100% 信任数据库，只读 deleted_at IS NULL 的记录
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching projects:', error)
        throw new Error('加载作品失败: ' + error.message)
    }

    return (data || []).map(rowToProject)
}

/**
 * 获取单个项目
 */
export async function getProject(id: number | string): Promise<Project | null> {
    if (!isSupabaseConfigured) {
        const projects = await getProjects()
        return projects.find(p => String(p.id) === String(id)) || null
    }

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        console.error('Error fetching project:', error)
        return null
    }

    return data ? rowToProject(data) : null
}

/**
 * 创建新项目
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const newProject = { ...project, id: Date.now() } as Project

    if (!isSupabaseConfigured) {
        const userProjects = getLocalUserProjects()
        userProjects.unshift(newProject)
        saveLocalUserProjects(userProjects)
        return newProject
    }

    // Supabase 模式：直接插入数据库
    const row = projectToRow(project)

    const { data, error } = await supabase
        .from('projects')
        .insert([row])
        .select()
        .single()

    if (error) {
        console.error('Error creating project:', error)
        throw new Error('发布作品失败: ' + error.message)
    }

    return rowToProject(data)
}

/**
 * 更新项目
 */
export async function updateProject(id: number | string, updates: Partial<Project>): Promise<Project> {
    if (!isSupabaseConfigured) {
        const userProjects = getLocalUserProjects()
        const updated = userProjects.map(p => String(p.id) === String(id) ? { ...p, ...updates } : p)
        saveLocalUserProjects(updated)
        return { id, ...updates } as Project
    }

    const row = projectToRow(updates)

    const { data, error } = await supabase
        .from('projects')
        .update(row)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating project:', error)
        return { id, ...updates } as Project
    }

    return rowToProject(data)
}

/**
 * 软删除项目（移入回收站）
 */
export async function deleteProject(id: number | string): Promise<void> {
    if (!isSupabaseConfigured) {
        // 本地模式：移入已删除列表
        const allProjects = [...getLocalUserProjects(), ...INITIAL_PROJECTS]
        const target = allProjects.find(p => String(p.id) === String(id))
        if (target) {
            const deleted = getLocalDeletedProjects()
            deleted.unshift(target)
            saveLocalDeletedProjects(deleted)
        }
        // 从用户作品中移除
        const userProjects = getLocalUserProjects()
        saveLocalUserProjects(userProjects.filter(p => String(p.id) !== String(id)))
        return
    }

    // Supabase 模式：设置 deleted_at 为当前时间（软删除）
    const { error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        console.error('Error soft-deleting project:', error)
        throw new Error('删除作品失败: ' + error.message)
    }
}

/**
 * 获取回收站中的项目
 */
export async function getDeletedProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) {
        return getLocalDeletedProjects()
    }

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })

    if (error) {
        console.error('Error fetching deleted projects:', error)
        return []
    }

    return (data || []).map(rowToProject)
}

/**
 * 恢复回收站中的项目
 */
export async function restoreProject(id: number | string): Promise<void> {
    if (!isSupabaseConfigured) {
        const deleted = getLocalDeletedProjects()
        const target = deleted.find(p => String(p.id) === String(id))
        if (target) {
            // 移回用户作品
            const initialIds = new Set(INITIAL_PROJECTS.map(p => String(p.id)))
            if (!initialIds.has(String(id))) {
                const userProjects = getLocalUserProjects()
                userProjects.unshift(target)
                saveLocalUserProjects(userProjects)
            }
        }
        saveLocalDeletedProjects(deleted.filter(p => String(p.id) !== String(id)))
        return
    }

    const { error } = await supabase
        .from('projects')
        .update({ deleted_at: null })
        .eq('id', id)

    if (error) {
        console.error('Error restoring project:', error)
        throw new Error('恢复作品失败: ' + error.message)
    }
}

/**
 * 永久删除项目
 */
export async function permanentDeleteProject(id: number | string): Promise<void> {
    if (!isSupabaseConfigured) {
        const deleted = getLocalDeletedProjects()
        saveLocalDeletedProjects(deleted.filter(p => String(p.id) !== String(id)))
        return
    }

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error permanently deleting project:', error)
        throw new Error('永久删除失败: ' + error.message)
    }
}

// ============================================================
// 点赞 & 浏览量
// ============================================================

export async function incrementLikes(id: number | string): Promise<number> {
    if (!isSupabaseConfigured) return 0
    const { data, error } = await supabase.rpc('increment_likes', { project_id: id })
    if (error) { console.error('Error incrementing likes:', error); return 0 }
    return data
}

export async function decrementLikes(id: number | string): Promise<number> {
    if (!isSupabaseConfigured) return 0
    const { data, error } = await supabase.rpc('decrement_likes', { project_id: id })
    if (error) { console.error('Error decrementing likes:', error); return 0 }
    return data
}

export async function getUserLikedProjectIds(userId: string): Promise<number[]> {
    if (!isSupabaseConfigured) {
        const saved = localStorage.getItem('guaiyu_liked_projects')
        return saved ? JSON.parse(saved) : []
    }
    const { data, error } = await supabase.from('user_likes').select('project_id').eq('user_id', userId)
    if (error) { console.error('Error fetching liked projects:', error); return [] }
    return (data || []).map(row => row.project_id)
}

export async function addUserLike(userId: string, projectId: number): Promise<void> {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('user_likes').insert([{ user_id: userId, project_id: projectId }])
    if (error) console.error('Error adding like:', error)
}

export async function removeUserLike(userId: string, projectId: number): Promise<void> {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.from('user_likes').delete().eq('user_id', userId).eq('project_id', projectId)
    if (error) console.error('Error removing like:', error)
}

export async function incrementViews(id: number | string): Promise<void> {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.rpc('increment_views', { project_id: id })
    if (error) console.error('Error incrementing views:', error)
}

// ============================================================
// 图片上传
// ============================================================

function compressImageToBase64(file: File, maxPx = 1200, quality = 0.72): Promise<string> {
    if (!file.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = () => reject(new Error('文件读取失败'))
            reader.readAsDataURL(file)
        })
    }
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            URL.revokeObjectURL(url)
            let { width, height } = img
            if (width > maxPx || height > maxPx) {
                if (width >= height) { height = Math.round(height * maxPx / width); width = maxPx }
                else { width = Math.round(width * maxPx / height); height = maxPx }
            }
            const canvas = document.createElement('canvas')
            canvas.width = width; canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) { resolve(img.src); return }
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality))
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')) }
        img.src = url
    })
}

export async function uploadImage(file: File, folder: string = 'projects'): Promise<string> {
    if (!isSupabaseConfigured) {
        return compressImageToBase64(file)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    try {
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file, { cacheControl: '3600', contentType: file.type, upsert: false })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('images').getPublicUrl(filePath)
        return data.publicUrl
    } catch (err: any) {
        console.warn('⚠️ Storage 上传失败，降级为压缩 Base64:', err)
        return compressImageToBase64(file)
    }
}
