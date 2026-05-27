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

    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching comments:', error)
        return []
    }

    return data || []
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

    if (!isSupabaseConfigured) {
        const localComment: Comment = {
            ...comment,
            id: Date.now(),
            created_at: new Date().toISOString(),
        }
        const key = `guaiyu_comments_${projectId}`
        const saved = localStorage.getItem(key)
        const comments = saved ? JSON.parse(saved) : []
        comments.unshift(localComment)
        localStorage.setItem(key, JSON.stringify(comments))
        return localComment
    }

    const { data, error } = await supabase
        .from('comments')
        .insert([comment])
        .select()
        .single()

    if (error) {
        console.error('Error adding comment:', error)
        return null
    }

    return data
}

/**
 * 删除评论（管理员）
 */
export async function deleteComment(commentId: number): Promise<void> {
    if (!isSupabaseConfigured) {
        return
    }

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

    if (error) {
        console.error('Error deleting comment:', error)
    }
}

/**
 * 获取所有项目的评论数量
 */
export async function getCommentCounts(): Promise<Record<number, number>> {
    if (!isSupabaseConfigured) {
        return {}
    }

    const { data, error } = await supabase
        .from('comments')
        .select('project_id')

    if (error) {
        console.error('Error fetching comment counts:', error)
        return {}
    }

    const counts: Record<number, number> = {}
    ;(data || []).forEach((row: { project_id: number }) => {
        counts[row.project_id] = (counts[row.project_id] || 0) + 1
    })
    return counts
}
