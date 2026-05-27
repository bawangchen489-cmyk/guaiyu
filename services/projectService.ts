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
    return {
        title: project.title,
        author: project.author,
        image: project.image,
        avatar: project.avatar,
        likes: project.likes,
        views: String(project.views),
        height: project.height,
        category: project.category,
        description: project.description,
        project_date: project.date,
        client: project.client,
        tools: project.tools,
    }
}

// localStorage key 只存用户上传的作品，不存 INITIAL_PROJECTS（防止超出 5MB 限制）
const LOCAL_USER_PROJECTS_KEY = 'guaiyu_user_projects'

/** 从 localStorage 读取用户自己创建的作品 */
function getLocalUserProjects(): Project[] {
    try {
        const raw = localStorage.getItem(LOCAL_USER_PROJECTS_KEY)
        if (!raw) return []
        return JSON.parse(raw) as Project[]
    } catch {
        return []
    }
}

/** 保存用户自己创建的作品列表到 localStorage */
function saveLocalUserProjects(projects: Project[]): void {
    try {
        localStorage.setItem(LOCAL_USER_PROJECTS_KEY, JSON.stringify(projects))
    } catch (e) {
        console.error('⚠️ localStorage 写入失败，可能存储已满：', e)
    }
}

/**
 * 获取所有项目
 * - 如果 Supabase 已配置：从数据库读取，并合并本地用户作品
 * - 如果未配置：返回 INITIAL_PROJECTS + 本地用户作品
 */
export async function getProjects(): Promise<Project[]> {
    const localUserProjects = getLocalUserProjects()

    if (!isSupabaseConfigured) {
        // 未配置 Supabase：用本地用户作品 + 初始作品
        const initialIds = new Set(INITIAL_PROJECTS.map(p => String(p.id)))
        const userOnly = localUserProjects.filter(p => !initialIds.has(String(p.id)))
        return [...userOnly, ...INITIAL_PROJECTS]
    }

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching projects:', error)
        // Supabase 失败：返回本地用户作品 + 初始作品
        const initialIds = new Set(INITIAL_PROJECTS.map(p => String(p.id)))
        const userOnly = localUserProjects.filter(p => !initialIds.has(String(p.id)))
        return [...userOnly, ...INITIAL_PROJECTS]
    }

    const supabaseProjects = (data || []).map(rowToProject)
    // 将本地用户作品合并进去（避免重复）
    if (localUserProjects.length > 0) {
        const supabaseIds = new Set(supabaseProjects.map(p => String(p.id)))
        const localOnly = localUserProjects.filter(p => !supabaseIds.has(String(p.id)))
        return [...localOnly, ...supabaseProjects]
    }
    return supabaseProjects
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
        // 未配置 Supabase：只存用户作品到 guaiyu_user_projects
        const userProjects = getLocalUserProjects()
        userProjects.unshift(newProject)
        saveLocalUserProjects(userProjects)
        return newProject
    }

    const row = projectToRow(project)

    const { data, error } = await supabase
        .from('projects')
        .insert([row])
        .select()
        .single()

    if (error) {
        console.error('Error creating project:', error)
        // 回退：存入本地用户作品（下次加载时会自动合并）
        const userProjects = getLocalUserProjects()
        userProjects.unshift(newProject)
        saveLocalUserProjects(userProjects)
        return newProject
    }

    return rowToProject(data)
}

/**
 * 更新项目
 */
export async function updateProject(id: number | string, updates: Partial<Project>): Promise<Project> {
    if (!isSupabaseConfigured) {
        try {
            const projects = await getProjects()
            const updated = projects.map(p => String(p.id) === String(id) ? { ...p, ...updates } : p)
            localStorage.setItem('guaiyu_projects_list', JSON.stringify(updated))
        } catch (e) {
            console.error('Failed to update project in localStorage:', e)
        }
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
        // 尝试本地更新回退
        try {
            const projects = await getProjects()
            const updated = projects.map(p => String(p.id) === String(id) ? { ...p, ...updates } : p)
            localStorage.setItem('guaiyu_projects_list', JSON.stringify(updated))
        } catch (e) {
            console.error('Failed to update project in localStorage fallback:', e)
        }
        return { id, ...updates } as Project
    }

    return rowToProject(data)
}

/**
 * 删除项目
 */
export async function deleteProject(id: number | string): Promise<void> {
    // 总是先删本地用户作品列表中对应的条目
    const userProjects = getLocalUserProjects()
    const filtered = userProjects.filter(p => String(p.id) !== String(id))
    if (filtered.length !== userProjects.length) {
        saveLocalUserProjects(filtered)
    }

    if (!isSupabaseConfigured) return

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting project:', error)
    }
}



/**
 * 增加项目点赞数
 */
export async function incrementLikes(id: number | string): Promise<number> {
    if (!isSupabaseConfigured) {
        return 0 // 本地模式：App.tsx 已处理本地更新
    }

    const { data, error } = await supabase.rpc('increment_likes', { project_id: id })

    if (error) {
        console.error('Error incrementing likes:', error)
        return 0
    }

    return data
}

/**
 * 减少项目点赞数
 */
export async function decrementLikes(id: number | string): Promise<number> {
    if (!isSupabaseConfigured) {
        return 0
    }

    const { data, error } = await supabase.rpc('decrement_likes', { project_id: id })

    if (error) {
        console.error('Error decrementing likes:', error)
        return 0
    }

    return data
}

/**
 * 获取用户点赞的项目 ID 列表
 */
export async function getUserLikedProjectIds(userId: string): Promise<number[]> {
    if (!isSupabaseConfigured) {
        const saved = localStorage.getItem('guaiyu_liked_projects')
        return saved ? JSON.parse(saved) : []
    }

    const { data, error } = await supabase
        .from('user_likes')
        .select('project_id')
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching liked projects:', error)
        return []
    }

    return (data || []).map(row => row.project_id)
}

/**
 * 添加用户点赞
 */
export async function addUserLike(userId: string, projectId: number): Promise<void> {
    if (!isSupabaseConfigured) return

    const { error } = await supabase
        .from('user_likes')
        .insert([{ user_id: userId, project_id: projectId }])

    if (error) {
        console.error('Error adding like:', error)
    }
}

/**
 * 移除用户点赞
 */
export async function removeUserLike(userId: string, projectId: number): Promise<void> {
    if (!isSupabaseConfigured) return

    const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId)

    if (error) {
        console.error('Error removing like:', error)
    }
}

/**
 * 增加项目浏览量
 */
export async function incrementViews(id: number | string): Promise<void> {
    if (!isSupabaseConfigured) return

    const { error } = await supabase.rpc('increment_views', { project_id: id })

    if (error) {
        console.error('Error incrementing views:', error)
    }
}

/**
 * 压缩图片并转为 Base64（防止巨大文件把 localStorage 兡満）
 * - 图片：经过 Canvas 缩放 + 压缩，最大宽/高 1200px，输出体积控制在 ~200KB 以内
 * - 视频 / 其他文件：直接读取原始数据（不压缩）
 */
function compressImageToBase64(file: File, maxPx = 1200, quality = 0.72): Promise<string> {
    // 非图片直接返回原始 base64
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
                if (width >= height) {
                    height = Math.round(height * maxPx / width)
                    width = maxPx
                } else {
                    width = Math.round(width * maxPx / height)
                    height = maxPx
                }
            }
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) { resolve(img.src); return }
            ctx.drawImage(img, 0, 0, width, height)
            const compressed = canvas.toDataURL(
                file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                quality
            )
            resolve(compressed)
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')) }
        img.src = url
    })
}

/**
 * 上传图片到 Supabase Storage（前端直传，绕过 Vercel Serverless 限制）
 * 如果上传失败，自动降级为压缩版 Base64 以保证作品能正常发布/保存
 */
export async function uploadImage(file: File, folder: string = 'projects'): Promise<string> {
    if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase 未配置，文件上传自动降级为压缩 Base64。')
        return compressImageToBase64(file)
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    try {
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file, {
                cacheControl: '3600',
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            throw uploadError
        }

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)

        return data.publicUrl
    } catch (err: any) {
        console.warn(
            '⚠️ Supabase Storage 上传失败，正在降级为压缩 Base64 本地编码存储。\n' +
            '建议在 Supabase 中创建一个名为 "images" 的 Public 存储桶以获得更好的加载性能。\n' +
            '错误详情:', err
        )
        return compressImageToBase64(file)
    }
}


