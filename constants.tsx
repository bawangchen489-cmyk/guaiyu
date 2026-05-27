
import { Project, Experience } from './types';

export const DEFAULT_AVATAR_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ff5e3a'/%3E%3Ctext x='50' y='55' text-anchor='middle' dominant-baseline='middle' fill='white' font-size='40' font-family='Arial' font-weight='bold'%3EG%3C/text%3E%3C/svg%3E";

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 1,
    title: "未来城市控制台",
    author: "陈衍文",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    avatar: DEFAULT_AVATAR_URL,
    likes: 0,
    views: "5.2k",
    height: "h-64", 
    category: "电商设计",
    description: "这是一套为未来城市管理系统设计的 UI 组件库。",
    date: "2026-05-12",
    client: "Future City Lab",
    tools: "Figma, After Effects"
  },
  {
    id: 2,
    title: "极简主义品牌识别",
    author: "陈衍文",
    image: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800",
    avatar: DEFAULT_AVATAR_URL,
    likes: 0,
    views: "3.1k",
    height: "h-96",
    category: "品牌设计",
    description: "摒弃多余的装饰，回归品牌本质。",
    date: "2026-04-28",
    client: "Mono Studio",
    tools: "Illustrator, Photoshop"
  },
  {
    id: 3,
    title: "深海梦境渲染",
    author: "陈衍文",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800",
    avatar: DEFAULT_AVATAR_URL,
    likes: 0,
    views: "12k",
    height: "h-72",
    category: "AI作品/视频",
    description: "使用 Blender 和 AI 辅助生成的超现实主义场景。",
    date: "2026-04-15",
    client: "个人创作",
    tools: "Midjourney, Blender"
  },
  {
    id: 4,
    title: "可持续包装实验",
    author: "陈衍文",
    image: "https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?auto=format&fit=crop&q=80&w=800",
    avatar: DEFAULT_AVATAR_URL,
    likes: 0,
    views: "1.8k",
    height: "h-80",
    category: "包装设计",
    description: "完全使用可降解材料设计的概念包装。",
    date: "2026-03-30",
    client: "EcoLife",
    tools: "C4D, Photoshop"
  },
];

export const EXPERIENCE: Experience[] = [
  { 
    year: "2025至今", 
    role: "电商设计师", 
    company: "TechFlow Inc.", 
    desc: "主导了多次S级大促的视觉设计，提升了 40% 的点击转化率。" 
  },
  { 
    year: "2024-2025年", 
    role: "电商设计实习", 
    company: "Freelance", 
    desc: "为超过 20 个初创品牌提供从 0 到 1 的品牌识别设计服务。" 
  },
];

export const SKILLS = ["Photoshop", "Illustrator", "C4D", "Midjourney", "Stable Diffusion", "Figma", "After Effects"];

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 15;

export const TETROMINOS: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], color: 'bg-cyan-400' },
  J: { shape: [[0, 1, 0], [0, 1, 0], [1, 1, 0]], color: 'bg-blue-500' },
  L: { shape: [[0, 1, 0], [0, 1, 0], [0, 1, 1]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: 'bg-red-500' },
};
