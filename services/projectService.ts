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
        // 未配置 Supabase 时，返回本地存储或初始数据
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
        // 回退到本地数据
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
    if (!isSupabaseConfigured) {
        // 本地模式：返回带临时 ID 的项目
        return { ...project, id: Date.now() } as Project
    }

    const row = projectToRow(project)

    const { data, error } = await supabase
        .from('projects')
        .insert([row])
        .select()
        .single()

    if (error) {
        console.error('Error creating project:', error)
        // 回退：返回带临时 ID 的项目
        return { ...project, id: Date.now() } as Project
    }

    return rowToProject(data)
}

/**
 * 更新项目
 */
export async function updateProject(id: number | string, updates: Partial<Project>): Promise<Project> {
    if (!isSupabaseConfigured) {
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
 * 删除项目
 */
export async function deleteProject(id: number | string): Promise<void> {
    if (!isSupabaseConfigured) {
        return // 本地模式：App.tsx 已处理本地删除
    }

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
 * 上传图片到 Supabase Storage（前端直传，绕过 Vercel Serverless 限制）
 */
export async function uploadImage(file: File, folder: string = 'projects'): Promise<string> {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase 未配置，无法上传文件。请在 .env.local 中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。')
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
            console.error('Supabase upload error:', uploadError)
            throw new Error(`文件上传失败: ${uploadError.message}`)
        }
    } catch (err: unknown) {
        // 如果是我们自己抛出的错误，直接向上传递
        if (err instanceof Error && err.message.startsWith('文件上传失败')) {
            throw err
        }
        // 网络级别错误（Failed to fetch / CORS）
        console.error('Network error during upload:', err)
        throw new Error(
            '文件上传网络错误。请检查：\n' +
            '1. Supabase Storage 中是否已创建名为 "images" 的存储桶\n' +
            '2. 存储桶是否设置为 Public（公开）\n' +
            '3. 存储桶的 RLS 策略是否允许上传（INSERT）'
        )
    }

    const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

    return data.publicUrl
}

