
export interface Project {
  id: string | number;
  title: string;
  author: string;
  image: string;
  avatar: string;
  likes: number;
  views: string | number;
  height: string;
  category: string;
  description: string;
  date: string;
  client: string;
  tools: string;
}

export interface Comment {
  id: number;
  project_id: number;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export interface Experience {
  year: string;
  role: string;
  company: string;
  desc: string;
}

export type ViewType = 'home' | 'works' | 'projectDetail' | 'upload' | 'preview' | 'about' | 'login';

export type ThemeType = 'dark' | 'light';

export type AuthStatus = 'guest' | 'authenticated';

export interface UserInfo {
  name: string;
  codename: string;
  avatar: string;
  status: AuthStatus;
}

export interface TetrisPiece {
  shape: number[][];
  color: string;
}

export interface TetrisPosition {
  x: number;
  y: number;
}
