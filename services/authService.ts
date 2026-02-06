import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { UserInfo } from '../types'
import { DEFAULT_AVATAR_URL } from '../constants'

const GUEST_USER: UserInfo = {
    name: '游客',
    codename: 'GUEST',
    avatar: DEFAULT_AVATAR_URL,
    status: 'guest'
}

/**
 * 使用代号登录或创建用户
 */
export async function loginWithCodename(
    codename: string,
    name: string,
    avatar: string
): Promise<UserInfo> {
    const userInfo: UserInfo = {
        codename,
        name,
        avatar,
        status: 'authenticated'
    }

    // 如果 Supabase 未配置，直接返回本地用户
    if (!isSupabaseConfigured) {
        saveUserToLocal(userInfo)
        return userInfo
    }

    try {
        // 先查找是否存在该代号的用户
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('codename', codename)
            .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.warn('Error fetching user, using local mode:', fetchError)
            saveUserToLocal(userInfo)
            return userInfo
        }

        if (existingUser) {
            // 用户存在，更新名称和头像
            const { data, error } = await supabase
                .from('users')
                .update({ name, avatar })
                .eq('codename', codename)
                .select()
                .single()

            if (error) {
                console.warn('Error updating user, using local mode:', error)
                saveUserToLocal(userInfo)
                return userInfo
            }

            const result: UserInfo = {
                codename: data.codename,
                name: data.name,
                avatar: data.avatar,
                status: 'authenticated'
            }
            saveUserToLocal(result)
            return result
        } else {
            // 创建新用户
            const { data, error } = await supabase
                .from('users')
                .insert([{ codename, name, avatar }])
                .select()
                .single()

            if (error) {
                console.warn('Error creating user, using local mode:', error)
                saveUserToLocal(userInfo)
                return userInfo
            }

            const result: UserInfo = {
                codename: data.codename,
                name: data.name,
                avatar: data.avatar,
                status: 'authenticated'
            }
            saveUserToLocal(result)
            return result
        }
    } catch (error) {
        console.warn('Supabase error, using local mode:', error)
        saveUserToLocal(userInfo)
        return userInfo
    }
}

/**
 * 获取用户信息（从 localStorage 或创建游客）
 */
export function getCurrentUser(): UserInfo {
    const saved = localStorage.getItem('guaiyu_user_info')
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch {
            return GUEST_USER
        }
    }
    return GUEST_USER
}

/**
 * 保存用户信息到 localStorage
 */
export function saveUserToLocal(userInfo: UserInfo): void {
    localStorage.setItem('guaiyu_user_info', JSON.stringify(userInfo))
}

/**
 * 退出登录
 */
export function logout(): UserInfo {
    localStorage.removeItem('guaiyu_user_info')
    localStorage.removeItem('guaiyu_liked_projects')
    return GUEST_USER
}

/**
 * 更新用户头像
 */
export async function updateAvatar(codename: string, avatarUrl: string): Promise<void> {
    if (!isSupabaseConfigured) {
        // 本地模式：直接更新 localStorage
        const user = getCurrentUser()
        if (user.codename === codename) {
            saveUserToLocal({ ...user, avatar: avatarUrl })
        }
        return
    }

    const { error } = await supabase
        .from('users')
        .update({ avatar: avatarUrl })
        .eq('codename', codename)

    if (error) {
        console.error('Error updating avatar:', error)
    }
}

/**
 * 上传头像到 Supabase Storage
 */
export async function uploadAvatar(file: File): Promise<string> {
    if (!isSupabaseConfigured) {
        // 本地模式：使用 Base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        // 回退到 Base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

    return data.publicUrl
}
