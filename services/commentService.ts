import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Comment } from '../types'

/**
 * 获取某个项目的所有评论
 */
export async function getComments(projectId: number | string): Promise<Comment[]> {
    if (!isSupabaseConfigured) {
        const saved = localStorage.getItem(`guaiyu_comments_${projectId}`)
        return saved ? JSON.parse(saved) : []
    }

    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }
        return data || []
    } catch (err) {
        console.warn('⚠️ Supabase 获取评论失败，使用本地 localStorage 缓存。错误:', err)
        const saved = localStorage.getItem(`guaiyu_comments_${projectId}`)
        return saved ? JSON.parse(saved) : []
    }
}

/**
 * 发表评论
 */
export async function addComment(
    projectId: number | string,
    userName: string,
    userAvatar: string,
    content: string
): Promise<Comment | null> {
    const comment = {
        project_id: Number(projectId),
        user_name: userName,
        user_avatar: userAvatar,
        content: content.trim(),
    }

    const localComment: Comment = {
        ...comment,
        id: Date.now(),
        created_at: new Date().toISOString(),
    }

    const saveLocal = () => {
        const key = `guaiyu_comments_${projectId}`
        const saved = localStorage.getItem(key)
        const comments = saved ? JSON.parse(saved) : []
        comments.unshift(localComment)
        localStorage.setItem(key, JSON.stringify(comments))
    }

    if (!isSupabaseConfigured) {
        saveLocal()
        return localComment
    }

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([comment])
            .select()
            .single()

        if (error) {
            throw error
        }
        return data
    } catch (err) {
        console.warn('⚠️ Supabase 发表评论失败，自动降级存入本地 localStorage。错误:', err)
        saveLocal()
        return localComment
    }
}

/**
 * 删除评论（管理员）
 */
export async function deleteComment(commentId: number): Promise<void> {
    const deleteLocal = () => {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('guaiyu_comments_')) {
                try {
                    const comments: Comment[] = JSON.parse(localStorage.getItem(key) || '[]')
                    const filtered = comments.filter(c => c.id !== commentId)
                    if (filtered.length !== comments.length) {
                        localStorage.setItem(key, JSON.stringify(filtered))
                    }
                } catch {}
            }
        }
    }

    if (!isSupabaseConfigured) {
        deleteLocal()
        return
    }

    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)

        if (error) {
            throw error
        }
    } catch (err) {
        console.warn('⚠️ Supabase 删除评论失败，尝试在本地删除。错误:', err)
        deleteLocal()
    }
}

/**
 * 获取所有项目的评论数量
 */
export async function getCommentCounts(): Promise<Record<number, number>> {
    const getLocalCounts = () => {
        const counts: Record<number, number> = {}
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('guaiyu_comments_')) {
                const projectId = Number(key.replace('guaiyu_comments_', ''))
                try {
                    const comments = JSON.parse(localStorage.getItem(key) || '[]')
                    counts[projectId] = comments.length
                } catch {}
            }
        }
        return counts
    }

    if (!isSupabaseConfigured) {
        return getLocalCounts()
    }

    try {
        const { data, error } = await supabase
            .from('comments')
            .select('project_id')

        if (error) {
            throw error
        }

        const counts: Record<number, number> = {}
        ;(data || []).forEach((row: { project_id: number }) => {
            counts[row.project_id] = (counts[row.project_id] || 0) + 1
        })
        return counts
    } catch (err) {
        console.warn('⚠️ Supabase 获取评论数失败，回退计算本地评论数。错误:', err)
        return getLocalCounts()
    }
}

