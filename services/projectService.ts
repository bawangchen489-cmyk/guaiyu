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

/**
 * 获取所有项目
 */
export async function getProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) {
        // 未配置 Supabase 时，优先读本地存储，否则返回初始数据
        const saved = localStorage.getItem('guaiyu_projects_list')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {
                return INITIAL_PROJECTS
            }
        }
        return INITIAL_PROJECTS
    }

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching projects:', error)
        // 优先回退到本地缓存，其次才是初始数据
        const saved = localStorage.getItem('guaiyu_projects_list')
        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {}
        }
        return INITIAL_PROJECTS
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
        try {
            const projects = await getProjects()
            projects.unshift(newProject)
            localStorage.setItem('guaiyu_projects_list', JSON.stringify(projects))
        } catch (e) {
            console.error('Failed to save project to localStorage:', e)
        }
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
        // 回退：本地模式存储
        try {
            const projects = await getProjects()
            projects.unshift(newProject)
            localStorage.setItem('guaiyu_projects_list', JSON.stringify(projects))
        } catch (e) {
            console.error('Failed to save fallback project to localStorage:', e)
        }
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
    const deleteLocal = async () => {
        try {
            const projects = await getProjects()
            const filtered = projects.filter(p => String(p.id) !== String(id))
            localStorage.setItem('guaiyu_projects_list', JSON.stringify(filtered))
        } catch (e) {
            console.error('Failed to delete project from localStorage:', e)
        }
    }

    if (!isSupabaseConfigured) {
        await deleteLocal()
        return
    }

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting project:', error)
        // 尝试本地删除回退
        await deleteLocal()
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
 * 将 File 对象转换为 Base64 编码的 Data URL
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('文件转换为 Base64 失败'))
        reader.readAsDataURL(file)
    })
}

/**
 * 上传图片到 Supabase Storage（前端直传，绕过 Vercel Serverless 限制）
 * 如果上传失败，自动降级为 Base64 编码以保证作品和文件能正常发布/保存
 */
export async function uploadImage(file: File, folder: string = 'projects'): Promise<string> {
    if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase 未配置，文件上传自动降级为 Base64。')
        return fileToBase64(file)
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
            '⚠️ Supabase Storage 上传失败，正在降级为 Base64 本地编码存储。\n' +
            '建议在 Supabase 中创建一个名为 "images" 的 Public 存储桶以获得更好的加载性能。\n' +
            '错误详情:', err
        )
        return fileToBase64(file)
    }
}


