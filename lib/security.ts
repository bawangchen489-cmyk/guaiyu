// 安全配置 - 仅用于前端基本保护
// 注意: 真正的安全需要在后端实现

// 允许的文件类型
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 输入消毒 - 防止 XSS
export function sanitizeInput(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

// 验证文件类型
export function validateFileType(file: File): { valid: boolean; error?: string } {
    const allAllowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

    if (!allAllowed.includes(file.type)) {
        return {
            valid: false,
            error: `不支持的文件类型: ${file.type}。仅支持 JPEG, PNG, GIF, WebP 图片和 MP4, WebM 视频。`
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大支持 10MB。`
        };
    }

    return { valid: true };
}

// 生成安全的文件名
export function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .substring(0, 100);
}

// 检查是否为恶意内容
export function checkMaliciousContent(content: string): boolean {
    const maliciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
    ];

    return maliciousPatterns.some(pattern => pattern.test(content));
}
