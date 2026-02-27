
import React, { useState, useRef } from 'react';
import { ArrowLeft, Check, ImageIcon, Type, Plus, Video } from 'lucide-react';
import { Project, ThemeType } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';
import { uploadImage } from '../services/projectService';
import { validateFileType } from '../lib/security';

interface UploadViewProps {
  initialData?: Partial<Project> | null;
  onBack: () => void;
  onPreview: (draft: Partial<Project>) => void;
  onPublish: (project: Project) => void;
  theme: ThemeType;
}

// 正文中待上传的文件记录
interface ContentFileEntry {
  file: File;
  previewUrl: string; // URL.createObjectURL 生成的本地预览地址
  isVideo: boolean;
}

const UploadView: React.FC<UploadViewProps> = ({ initialData, onBack, onPreview, onPublish, theme }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "电商设计");
  const [description, setDescription] = useState(initialData?.description || "");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(initialData?.image || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverIsVideo, setCoverIsVideo] = useState(initialData?.image?.includes('video') || false);
  const [client, setClient] = useState(initialData?.client || "");
  const [tools, setTools] = useState(initialData?.tools || "");

  // 正文中插入的文件列表（Key: previewUrl → 用于后续替换）
  const [contentFiles, setContentFiles] = useState<ContentFileEntry[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const isDark = theme === 'dark';
  const cardBg = isDark ? 'bg-[#111] border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const inputBg = isDark ? 'bg-transparent text-white' : 'bg-transparent text-black';

  // 封面选择 — 保留 File 对象，用 URL.createObjectURL 做预览
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFileType(file);
      if (!validation.valid) { alert(validation.error); return; }
      const isVideo = file.type.startsWith('video/');
      setCoverIsVideo(isVideo);
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 正文图片/视频选择 — 保留 File 对象，用 URL.createObjectURL 做预览
  const handleContentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateFileType(file);
      if (!validation.valid) { alert(validation.error); return; }
      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);
      const prefix = isVideo ? 'video:' : '';
      setDescription(prev => prev + `\n![${prefix}${file.name}](${previewUrl})\n`);
      setContentFiles(prev => [...prev, { file, previewUrl, isVideo }]);
    }
  };

  const getDraftData = (): Partial<Project> => ({
    title,
    category,
    description,
    image: coverPreviewUrl || "",
    client,
    tools,
    date: initialData?.date || new Date().toISOString().split('T')[0]
  });

  const handlePublishClick = async () => {
    if ((!coverFile && !coverPreviewUrl) || !title) { alert("请填写标题并上传封面"); return; }
    setUploading(true);
    setUploadError(null);

    try {
      // 1. 上传封面到 Supabase Storage（前端直传）
      let finalCoverUrl = coverPreviewUrl || "";
      if (coverFile) {
        finalCoverUrl = await uploadImage(coverFile, 'covers');
      }

      // 2. 上传正文中插入的图片/视频到 Supabase Storage
      let finalDescription = description || "暂无描述";
      for (const entry of contentFiles) {
        const publicUrl = await uploadImage(entry.file, 'content');
        // 将正文中的本地 blob: 预览地址替换为远端 public URL
        finalDescription = finalDescription.replaceAll(entry.previewUrl, publicUrl);
      }

      // 3. 组装项目数据
      const heights = ["h-64", "h-72", "h-80", "h-96"];
      const randomHeight = heights[Math.floor(Math.random() * heights.length)];

      const newProject: Project = {
        ...getDraftData(),
        id: Date.now(),
        author: "陈衍文",
        avatar: DEFAULT_AVATAR_URL,
        likes: 0,
        views: 0,
        height: randomHeight,
        image: finalCoverUrl,
        title: title!,
        category: category!,
        description: finalDescription,
        date: new Date().toISOString().split('T')[0],
        client: client || "个人项目",
        tools: tools || "Figma"
      } as Project;

      onPublish(newProject);
      setShowSuccess(true);
    } catch (err) {
      console.error('上传失败:', err);
      setUploadError(err instanceof Error ? err.message : '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  if (showSuccess) return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'} pt-24 pb-20 px-4 flex items-center justify-center`}>
      <div className={`${cardBg} p-8 rounded-2xl border text-center`}>
        <Check className="w-16 h-16 text-[#ff5e3a] mx-auto mb-4" />
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>发布成功！</h2>
        <p className="text-gray-400">作品已收录到你的作品集中。</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'} pt-24 pb-20 px-4`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className={`p-2 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-200'}`}>
              <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>发布新作品</h1>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => onPreview(getDraftData())} className={`px-6 py-2 rounded-full border ${isDark ? 'border-white/10 text-gray-300 hover:text-white' : 'border-gray-300 text-gray-600 hover:text-black hover:bg-white'}`}>预览</button>
            <button type="button" onClick={handlePublishClick} disabled={uploading} className="px-6 py-2 rounded-full bg-[#ff5e3a] text-white font-bold">{uploading ? '上传中...' : '发布'}</button>
          </div>
        </div>
        {uploadError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            ❌ {uploadError}
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`${cardBg} p-6 rounded-2xl border`}>
              <input type="text" placeholder="作品标题" className={`w-full text-3xl font-bold outline-none ${inputBg}`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className={`${cardBg} rounded-2xl border min-h-[500px] flex flex-col`}>
              <div className="border-b border-gray-500/10 p-4 flex gap-4 text-gray-500">
                <button onClick={() => contentInputRef.current?.click()} className="hover:text-[#ff5e3a] transition-colors"><ImageIcon className="w-5 h-5" /></button>
                <button onClick={() => contentInputRef.current?.click()} className="hover:text-[#ff5e3a] transition-colors"><Video className="w-5 h-5" /></button>
                <Type className="w-5 h-5 cursor-default" />
              </div>
              <textarea
                className={`flex-1 p-6 text-lg outline-none resize-none ${inputBg} ${isDark ? 'placeholder-gray-700' : 'placeholder-gray-400'}`}
                placeholder="正文内容... 可点击上方图标插入图片或视频"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <input type="file" ref={contentInputRef} onChange={handleContentFileSelect} accept="image/*,video/*" className="hidden" />
              <div className="p-4 flex justify-center pb-8">
                <button type="button" onClick={() => contentInputRef.current?.click()} className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${isDark ? 'border-white/10 hover:border-[#ff5e3a]' : 'border-gray-300 hover:border-[#ff5e3a]'} rounded-xl text-gray-500 hover:text-[#ff5e3a] transition-all`}>
                  <Plus className="w-8 h-8" /><span className="text-sm font-medium">插入正文素材</span>
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className={`${cardBg} p-6 rounded-2xl border`}>
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase">封面预览</h3>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
              <div className={`aspect-[4/3] ${isDark ? 'bg-black' : 'bg-gray-100'} rounded-xl border-2 border-dashed ${isDark ? 'border-white/10' : 'border-gray-300'} flex items-center justify-center cursor-pointer hover:border-[#ff5e3a] relative overflow-hidden transition-all group`} onClick={() => fileInputRef.current?.click()}>
                {coverPreviewUrl ? (
                  coverIsVideo ? (
                    <video src={coverPreviewUrl} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                  ) : (
                    <img src={coverPreviewUrl} className="w-full h-full object-cover" alt="Cover preview" />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-6 h-6 text-gray-500 group-hover:text-[#ff5e3a]" />
                    <span className="text-xs text-gray-500">上传封面</span>
                  </div>
                )}
                {coverPreviewUrl && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-xs font-bold bg-[#ff5e3a] px-3 py-1.5 rounded-full">更换文件</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`${cardBg} p-6 rounded-2xl border space-y-6`}>
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">项目分类</h3>
                <div className="flex flex-wrap gap-2">
                  {["电商设计", "品牌设计", "包装设计", "AI作品/视频"].map(cat => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${category === cat ? 'bg-[#ff5e3a] border-[#ff5e3a] text-white' : 'bg-transparent border-gray-500/20 text-gray-500 hover:border-[#ff5e3a] hover:text-[#ff5e3a]'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">项目详情</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="客户名称 (可选)" className={`w-full ${isDark ? 'bg-black/50 border-white/10' : 'bg-gray-100 border-gray-200'} border rounded-lg p-3 text-sm outline-none ${inputBg} focus:border-[#ff5e3a]`} value={client} onChange={(e) => setClient(e.target.value)} />
                  <input type="text" placeholder="使用工具 (如: Photoshop, Blender)" className={`w-full ${isDark ? 'bg-black/50 border-white/10' : 'bg-gray-100 border-gray-200'} border rounded-lg p-3 text-sm outline-none ${inputBg} focus:border-[#ff5e3a]`} value={tools} onChange={(e) => setTools(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadView;
