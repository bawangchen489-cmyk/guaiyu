
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import Sticker from '../components/Sticker';
import TetrisGame from '../components/TetrisGame';
import { Project, ViewType, ThemeType } from '../types';

interface PersonalHomeViewProps {
  onNavigate: (view: ViewType) => void;
  projects: Project[];
  avatar: string;
  theme: ThemeType;
}

const PersonalHomeView: React.FC<PersonalHomeViewProps> = ({ onNavigate, projects, avatar, theme }) => {
    const [gameActive, setGameActive] = useState(false);
    const controlRef = useRef<any>(null);
    const isDark = theme === 'dark';
    
    // Parallax 视差交互：使用 transformZ(0) 优化性能
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 30, stiffness: 120 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        // 降低计算频率，只在非游戏状态下处理
        if (gameActive) return;
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 40; 
        const y = (clientY / window.innerHeight - 0.5) * 40;
        mouseX.set(x);
        mouseY.set(y);
    };

    const consoleX = useTransform(springX, val => val * 0.8);
    const consoleY = useTransform(springY, val => val * 0.8);

    const handleAPress = () => {
        if (gameActive) {
            controlRef.current?.rotate();
        } else {
            setGameActive(true);
        }
    };

    const handleBPress = () => {
        if (gameActive) setGameActive(false);
    };

    const handleDPad = (dir: 'left' | 'right' | 'down' | 'up') => {
        if (!gameActive) return;
        if (dir === 'left') controlRef.current?.moveLeft();
        if (dir === 'right') controlRef.current?.moveRight();
        if (dir === 'down') controlRef.current?.moveDown();
        if (dir === 'up') controlRef.current?.rotate();
    };

    const bgColor = isDark ? 'bg-black' : 'bg-white';
    const consoleBodyColor = isDark ? 'bg-[#2a0a4d]/90' : 'bg-[#f0f0f0]/95';
    const consoleBorderColor = isDark ? 'border-[#500a85]' : 'border-[#d0d0d0]';
    const consoleShadow = isDark 
        ? 'shadow-[0_30px_80px_rgba(106,13,173,0.5),inset_0_0_40px_rgba(255,255,255,0.1),0_0_100px_rgba(106,13,173,0.3)]'
        : 'shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_0_20px_rgba(255,255,255,0.8),0_0_80px_rgba(0,0,0,0.1)]';

    // 预定义 Sticker 数据，避免渲染时计算
    const stickersData = useMemo(() => [
      { x: "10%", y: "15%", rotate: -12, delay: 0.5, color: "bg-[#FF0055] text-white", shape: "rounded-full h-40 w-40 p-0 flex-col border-4", content: <><Star className="w-10 h-10 mb-1"/> 品牌<br/>策略</> },
      { x: "20%", y: "5%", rotate: 5, delay: 0.55, color: "bg-[#00E5FF] text-black", shape: "rounded-none skew-x-12 px-10 py-5 text-xl border-4", content: "视觉识别" },
      { x: "80%", y: "15%", rotate: 15, delay: 0.6, color: "bg-[#FFD300] text-black", shape: "rounded-xl border-4 border-white px-10 py-5", content: "电商设计" },
      { x: "70%", y: "25%", rotate: -5, delay: 0.65, color: "bg-[#7000FF] text-white", shape: "rounded-full px-8 py-3 border-4", content: "2026" },
      { x: "15%", y: "65%", rotate: -10, delay: 0.7, color: "bg-white text-black", shape: "rounded-lg border-4 border-dashed border-black px-8 py-4", content: "UI/UX" },
      { x: "5%", y: "50%", rotate: 20, delay: 0.75, color: "bg-[#FF4D00] text-white", shape: "rounded-3xl px-10 py-4 border-4", content: "C4D" },
      { x: "80%", y: "60%", rotate: 8, delay: 0.8, color: "bg-[#00FF99] text-black", shape: "rounded-[40px] px-12 py-4 border-4 shadow-[0_0_15px_#00ff99]", content: "AIGC" },
      { x: "70%", y: "75%", rotate: -2, delay: 0.85, color: "bg-pink-300 text-black", shape: "rounded-md px-8 py-3 border-4", content: "动态视觉" },
      { x: "30%", y: "80%", rotate: 25, delay: 0.9, color: "bg-blue-600 text-white", shape: "rounded-tr-3xl rounded-bl-3xl px-10 py-4 border-4", content: "包装设计" },
      { x: "45%", y: "10%", rotate: -3, delay: 1.0, color: "bg-lime-400 text-black", shape: "rounded-sm border-4 border-black px-8 py-3", content: "WEB 3.0" }
    ], []);

    return (
        <div className={`min-h-screen ${bgColor} ${isDark ? 'text-white' : 'text-black'} relative font-sans overflow-x-hidden`} onMouseMove={handleMouseMove}>
            
            {/* 背景层 */}
            <div className={`fixed inset-0 z-0 ${bgColor}`}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                {isDark ? (
                  <>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none"></div>
                  </>
                ) : (
                  <>
                      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-200/50 rounded-full blur-[100px] pointer-events-none"></div>
                  </>
                )}
            </div>

            {/* 标签层 - 优化为静态容器，减少重绘范围 */}
            <div className="absolute inset-0 z-10 pointer-events-none h-full overflow-hidden">
                {stickersData.map((s, i) => (
                  <Sticker key={i} x={s.x} y={s.y} rotate={s.rotate} delay={s.delay} color={s.color} shape={s.shape}>
                    {s.content}
                  </Sticker>
                ))}
            </div>

            {/* 控制台核心区域 */}
            <div className="relative w-full min-h-[100vh] flex items-center justify-center z-20 pt-16 px-4">
                <motion.div
                    style={{ x: consoleX, y: consoleY, transformZ: 0 }}
                    initial={{ y: 800, rotate: 10 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 45, damping: 18, delay: 0.2 }}
                    className={`relative w-full max-w-[340px] aspect-[34/60] sm:h-[600px] ${consoleBodyColor} backdrop-blur-md rounded-b-[50px] rounded-t-[20px] ${consoleShadow} flex flex-col items-center p-6 border-4 ${consoleBorderColor}`}
                >
                    <div className="w-full bg-[#111] rounded-t-[10px] rounded-b-[40px] p-6 pb-10 shadow-[inset_0_0_20px_black] relative border border-white/5 z-10">
                        <div className="flex justify-between items-center mb-2 px-2">
                             <div className="flex gap-1"><div className="w-1 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_red]"></div><span className="text-[6px] text-gray-500 self-center">BATTERY</span></div>
                        </div>
                        <div className="w-full aspect-[10/9] bg-[#9ca04b] shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] border-4 border-[#333512] rounded-md overflow-hidden relative">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:3px_3px] pointer-events-none opacity-40 z-20"></div>
                            <AnimatePresence mode="wait">
                                {!gameActive ? (
                                    <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 h-full flex flex-col items-center justify-center text-[#0f380f]">
                                        <h1 className="text-3xl font-black tracking-tighter leading-none mb-1 font-mono text-center">陈衍文</h1>
                                        <div className="bg-[#0f380f] text-[#9ca04b] px-2 py-0.5 text-xs font-bold mb-2 font-mono">设计师</div>
                                        <button onClick={(e) => { e.stopPropagation(); onNavigate('about'); }} className="text-[10px] border-2 border-[#0f380f] px-3 py-1 hover:bg-[#0f380f] hover:text-[#9ca04b] transition-colors font-bold cursor-pointer mb-2 pointer-events-auto">▶ 查看档案</button>
                                        <p className="text-[8px] font-mono animate-pulse">PRESS 'A' TO PLAY</p>
                                    </motion.div>
                                ) : (
                                    <motion.div key="game" className="z-10 w-full h-full"><TetrisGame active={gameActive} controlRef={controlRef}/></motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="text-center mt-3"><span className="text-white/40 text-[10px] font-black tracking-[0.3em] italic">GAME BOY COLOR</span></div>
                    </div>

                    <div className="w-full flex-1 flex flex-col justify-end pb-4 px-2 relative z-10">
                        <div className={`absolute top-2 left-4 ${isDark ? 'text-white/20' : 'text-black/20'} font-bold italic text-xs tracking-widest`}>Nintendo</div>
                        <div className="flex justify-between items-end mb-6">
                            <div className="w-24 h-24 relative scale-90 sm:scale-100">
                                <div className="absolute top-8 left-0 w-24 h-8 bg-[#111] rounded shadow-[0_4px_0_black]"></div> 
                                <div className="absolute top-0 left-9 w-9 h-28 bg-[#111] rounded shadow-[0_4px_0_black]"></div>
                                <div className="absolute top-0 left-9 w-9 h-10 cursor-pointer hover:bg-white/10 z-20" onClick={() => handleDPad('up')}></div>
                                <div className="absolute bottom-0 left-9 w-9 h-10 cursor-pointer hover:bg-white/10 z-20" onClick={() => handleDPad('down')}></div>
                                <div className="absolute top-8 left-0 w-9 h-9 cursor-pointer hover:bg-white/10 z-20" onClick={() => handleDPad('left')}></div>
                                <div className="absolute top-8 right-0 w-9 h-9 cursor-pointer hover:bg-white/10 z-20" onClick={() => handleDPad('right')}></div>
                            </div>
                            <div className="flex gap-3 transform rotate-[-15deg] mb-2 mr-2 scale-90 sm:scale-100">
                                <div className="flex flex-col items-center gap-1 group">
                                    <button className="w-10 h-10 bg-[#ff0055] rounded-full shadow-[0_4px_0_#990033] active:translate-y-1 active:shadow-none border-t border-white/30" onClick={handleBPress}></button>
                                    <span className={`${isDark ? 'text-white/30' : 'text-black/30'} font-bold text-[10px]`}>B</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 mt-[-15px] group">
                                    <button className="w-10 h-10 bg-[#00eaff] rounded-full shadow-[0_4px_0_#008c99] active:translate-y-1 active:shadow-none border-t border-white/30" onClick={handleAPress}></button>
                                    <span className={`${isDark ? 'text-white/30' : 'text-black/30'} font-bold text-[10px]`}>A</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center gap-3 mt-4"><div className="w-10 h-3 bg-gray-500 rounded-full transform rotate-[-25deg] shadow-[0_2px_0_black]"></div><div className="w-10 h-3 bg-gray-500 rounded-full transform rotate-[-25deg] shadow-[0_2px_0_black]"></div></div>
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-20 text-gray-500">
                <div className={`w-6 h-10 border-2 ${isDark ? 'border-white/20' : 'border-black/20'} rounded-full flex justify-center p-1`}><motion.div animate={{ y: [0, 12, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1 h-2 bg-[#ff5e3a] rounded-full" /></div>
            </motion.div>

            <div className={`py-20 max-w-7xl mx-auto px-6 relative z-20`}>
                <div className="flex justify-between items-end mb-12">
                     <div><span className="text-[#ff5e3a] font-bold tracking-wider text-sm mb-2 block uppercase">Latest Works</span><h2 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'} max-w-md leading-tight`}>近期项目</h2></div>
                     <button onClick={() => onNavigate('works')} className={`hidden md:flex items-center gap-2 ${isDark ? 'text-white/70 bg-white/5 hover:bg-white/10' : 'text-black/70 bg-black/5 hover:bg-black/10'} px-6 py-3 rounded-full transition-all border border-white/5 backdrop-blur-sm`}>查看全部 <ArrowRight className="w-4 h-4" /></button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {projects.slice(0, 3).map((project, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className={`group relative overflow-hidden rounded-2xl h-80 ${isDark ? 'bg-[#151515]' : 'bg-white'} border border-white/5 cursor-pointer shadow-lg`} onClick={() => onNavigate('works')}>
                            <img src={project.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <span className="text-[#ff5e3a] text-xs font-bold uppercase mb-1 block tracking-widest">{project.category}</span>
                                <h3 className="text-xl font-bold text-white tracking-tight">{project.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PersonalHomeView;
