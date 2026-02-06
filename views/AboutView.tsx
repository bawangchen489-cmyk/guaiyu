
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Briefcase, Layers, Camera, Mail, Phone, 
  GraduationCap, Languages, MessageSquare, MessageCircle, Aperture, ArrowRight, Edit3, Save, X, Plus, Trash2
} from 'lucide-react';
import { ThemeType, Experience, UserInfo } from '../types';
import { EXPERIENCE, SKILLS } from '../constants';

interface AboutViewProps {
  avatar: string;
  onAvatarUpload: (file: File) => void;
  userInfo: UserInfo;
  theme: ThemeType;
}

const AdminBadge: React.FC<{ label?: string }> = ({ label = "这个模块管理员可以编辑" }) => (
  <div className="absolute -top-3 -right-2 flex items-center gap-2 bg-[#00eaff] text-black text-[10px] font-black px-3 py-1 rounded-md shadow-lg z-30 pointer-events-none whitespace-nowrap">
    {label} <Edit3 className="w-3 h-3" />
  </div>
);

const AboutView: React.FC<AboutViewProps> = ({ avatar, onAvatarUpload, userInfo, theme }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isDark = theme === 'dark';
    const isAdmin = userInfo.status === 'authenticated';

    // 持久化主内容状态
    const [headline, setHeadline] = useState(() => localStorage.getItem('about_headline') || "我是一名设计和 AI 结合的 AI 设计师。");
    const [subHeadline, setSubHeadline] = useState(() => localStorage.getItem('about_subheadline') || "拥有超过 5 年的设计经验，我致力于将复杂的问题转化为直观、优雅的解决方案。我相信设计不仅仅是视觉的堆砌，更是逻辑与情感的桥梁。");
    const [experiences, setExperiences] = useState<Experience[]>(() => {
        const saved = localStorage.getItem('about_experiences');
        return saved ? JSON.parse(saved) : EXPERIENCE;
    });
    const [skills, setSkills] = useState<string[]>(() => {
        const saved = localStorage.getItem('about_skills');
        return saved ? JSON.parse(saved) : SKILLS;
    });
    const [education, setEducation] = useState(() => localStorage.getItem('about_edu') || "专科 / 视觉传达");
    const [language, setLanguage] = useState(() => localStorage.getItem('about_lang') || "中文");
    const [summary, setSummary] = useState(() => localStorage.getItem('about_summary') || "在过去的设计实践中，我不断探索设计与技术的边界。不仅关注视觉的极致呈现，更在意交互过程中的情感传递。每一个像素的挪动，都是为了更好地服务于用户的核心诉求。");

    // 左侧资料卡片持久化状态
    const [profileName, setProfileName] = useState(() => localStorage.getItem('about_profile_name') || "陈衍文");
    const [profileRole, setProfileRole] = useState(() => localStorage.getItem('about_profile_role') || "设计师 / DESIGNER");
    const [profilePhone, setProfilePhone] = useState(() => localStorage.getItem('about_profile_phone') || "19574829019");
    const [profileEmail, setProfileEmail] = useState(() => localStorage.getItem('about_profile_email') || "1715155940@qq.com");

    // 保存到 localStorage
    useEffect(() => {
        localStorage.setItem('about_headline', headline);
        localStorage.setItem('about_subheadline', subHeadline);
        localStorage.setItem('about_experiences', JSON.stringify(experiences));
        localStorage.setItem('about_skills', JSON.stringify(skills));
        localStorage.setItem('about_edu', education);
        localStorage.setItem('about_lang', language);
        localStorage.setItem('about_summary', summary);
        localStorage.setItem('about_profile_name', profileName);
        localStorage.setItem('about_profile_role', profileRole);
        localStorage.setItem('about_profile_phone', profilePhone);
        localStorage.setItem('about_profile_email', profileEmail);
    }, [headline, subHeadline, experiences, skills, education, language, summary, profileName, profileRole, profilePhone, profileEmail]);

    // 编辑模式状态
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [tempData, setTempData] = useState<any>(null);
    const [newSkill, setNewSkill] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (e.target.files && e.target.files[0]) onAvatarUpload(e.target.files[0]); 
    };

    const toggleEdit = (section: string, initialData: any) => {
        if (editingSection === section) {
            setEditingSection(null);
            setTempData(null);
        } else {
            setEditingSection(section);
            setTempData(initialData);
        }
    };

    const addExperience = () => {
        const newItem: Experience = { year: "2026", role: "新职位", company: "新公司", desc: "职责描述" };
        setExperiences([...experiences, newItem]);
    };

    const updateExperience = (index: number, field: keyof Experience, value: string) => {
        const updated = [...experiences];
        updated[index] = { ...updated[index], [field]: value };
        setExperiences(updated);
    };

    const removeExperience = (index: number) => {
        setExperiences(experiences.filter((_, i) => i !== index));
    };

    const addSkill = () => {
        if (newSkill.trim()) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const textColor = isDark ? 'text-white' : 'text-black';
    const cardBg = isDark ? 'bg-[#111]' : 'bg-white';
    const blueprintBorder = isAdmin ? "border-2 border-dashed border-[#00eaff]/40 rounded-xl" : "";

    return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'} ${textColor} pt-32 pb-20 px-4`}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12">
            {/* 侧边个人名片 */}
            <div className="md:col-span-4 lg:col-span-3">
                <div className="sticky top-32 group">
                    <div className={`w-full ${cardBg} rounded-3xl overflow-hidden border ${isAdmin ? 'border-[#00eaff]/40 border-2 border-dashed' : 'border-white/10'} p-6 flex flex-col items-center text-center shadow-2xl relative`}>
                         {isAdmin && <AdminBadge label="管理员可以修改个人信息" />}
                         
                         {isAdmin && (
                            <button 
                                onClick={() => toggleEdit('profile', { name: profileName, role: profileRole, phone: profilePhone, email: profileEmail })}
                                className="absolute top-4 left-4 p-2 bg-[#ff5e3a] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
                            >
                                <Edit3 className="w-4 h-4"/>
                            </button>
                         )}

                         <div className="relative w-32 h-32 mb-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                             <img src={avatar} className="w-full h-full object-cover rounded-full border-4 border-[#ff5e3a] relative z-10 shadow-[0_0_20px_rgba(255,94,58,0.3)]" />
                             <div className="absolute bottom-0 right-0 bg-[#ff5e3a] p-2 rounded-full z-20 shadow-lg"><Camera className="w-4 h-4 text-white"/></div>
                         </div>
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                         
                         {editingSection === 'profile' ? (
                            <div className="w-full space-y-4">
                                <input 
                                    value={tempData.name} 
                                    onChange={(e) => setTempData({...tempData, name: e.target.value})}
                                    placeholder="姓名"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-center text-xl font-black outline-none focus:border-[#ff5e3a]"
                                />
                                <input 
                                    value={tempData.role} 
                                    onChange={(e) => setTempData({...tempData, role: e.target.value})}
                                    placeholder="职位"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-center text-xs text-[#ff5e3a] font-bold outline-none focus:border-[#ff5e3a]"
                                />
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                        <input 
                                            value={tempData.phone} 
                                            onChange={(e) => setTempData({...tempData, phone: e.target.value})}
                                            className="w-full pl-8 pr-2 py-2 bg-black/20 border border-white/10 rounded-lg text-xs outline-none focus:border-[#ff5e3a]"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                        <input 
                                            value={tempData.email} 
                                            onChange={(e) => setTempData({...tempData, email: e.target.value})}
                                            className="w-full pl-8 pr-2 py-2 bg-black/20 border border-white/10 rounded-lg text-xs outline-none focus:border-[#ff5e3a]"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { 
                                        setProfileName(tempData.name); 
                                        setProfileRole(tempData.role); 
                                        setProfilePhone(tempData.phone);
                                        setProfileEmail(tempData.email);
                                        setEditingSection(null); 
                                    }} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3"/> 保存</button>
                                    <button onClick={() => setEditingSection(null)} className="flex-1 bg-gray-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><X className="w-3 h-3"/> 取消</button>
                                </div>
                            </div>
                         ) : (
                            <>
                                <h2 className="text-2xl font-black mb-1">{profileName}</h2>
                                <p className="text-[#ff5e3a] font-bold text-sm mb-6 uppercase tracking-widest">{profileRole}</p>
                                
                                <div className="w-full space-y-4 text-left">
                                    <div className={`p-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl border border-transparent hover:border-[#ff5e3a]/30 transition-colors`}>
                                        <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">电话号码</h3>
                                        <p className="flex items-center gap-2 text-sm font-medium"><Phone className="w-3 h-3 text-[#ff5e3a]"/> {profilePhone}</p>
                                    </div>
                                    <div className={`p-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl border border-transparent hover:border-[#ff5e3a]/30 transition-colors`}>
                                        <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-bold">邮箱</h3>
                                        <p className="flex items-center gap-2 text-sm font-medium"><Mail className="w-3 h-3 text-[#ff5e3a]"/> {profileEmail}</p>
                                    </div>
                                </div>
                            </>
                         )}
                         
                         <div className="flex gap-4 mt-8 justify-center">
                             <button className={`p-3 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} text-[#ff5e3a] transition-all hover:scale-110 active:scale-95`} title="WeChat">
                                 <MessageSquare className="w-5 h-5"/>
                             </button>
                             <button className={`p-3 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} text-[#ff5e3a] transition-all hover:scale-110 active:scale-95`} title="Zcool">
                                 <Aperture className="w-5 h-5"/>
                             </button>
                             <button className={`p-3 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} text-[#ff5e3a] transition-all hover:scale-110 active:scale-95`} title="QQ">
                                 <MessageCircle className="w-5 h-5"/>
                             </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* 右侧主内容 */}
            <div className="md:col-span-8 lg:col-span-9 space-y-16">
                {/* Headline Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative p-6 ${blueprintBorder}`}>
                    {isAdmin && <AdminBadge label="这个模块管理员可以编辑" />}
                    
                    {editingSection === 'headline' ? (
                        <div className="space-y-4">
                            <textarea 
                                value={tempData} 
                                onChange={(e) => setTempData(e.target.value)}
                                className="w-full text-4xl md:text-6xl font-black bg-transparent border-b-2 border-[#ff5e3a] outline-none text-[#ff5e3a] resize-none"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => { setHeadline(tempData); setEditingSection(null); }} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 font-bold text-sm"><Save className="w-4 h-4"/> 保存</button>
                                <button onClick={() => setEditingSection(null)} className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2 font-bold text-sm"><X className="w-4 h-4"/> 取消</button>
                            </div>
                        </div>
                    ) : (
                        <div className="group relative">
                            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter relative z-10 whitespace-pre-line">
                                {headline}
                            </h1>
                            {isAdmin && (
                                <button onClick={() => toggleEdit('headline', headline)} className="absolute -top-4 -left-4 p-2 bg-[#ff5e3a] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"><Edit3 className="w-4 h-4"/></button>
                            )}
                        </div>
                    )}
                    
                    <div className="absolute right-0 top-1/4 hidden lg:block">
                        <span className="text-[#00eaff] text-sm font-bold bg-[#00eaff]/10 px-4 py-2 rounded-full border border-[#00eaff]/30 animate-pulse">未来设计趋势探索者</span>
                    </div>

                    {/* Subheadline Section */}
                    <div className={`mt-12 relative p-6 ${blueprintBorder}`}>
                        {isAdmin && <AdminBadge label="这个模块管理员可以编辑" />}
                        {editingSection === 'subheadline' ? (
                            <div className="space-y-4">
                                <textarea 
                                    value={tempData} 
                                    onChange={(e) => setTempData(e.target.value)}
                                    className={`w-full text-xl ${isDark ? 'text-white' : 'text-black'} bg-transparent border-l-4 border-[#ff5e3a] pl-6 outline-none resize-none h-32`}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => { setSubHeadline(tempData); setEditingSection(null); }} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 font-bold text-sm"><Save className="w-4 h-4"/> 保存</button>
                                    <button onClick={() => setEditingSection(null)} className="px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2 font-bold text-sm"><X className="w-4 h-4"/> 取消</button>
                                </div>
                            </div>
                        ) : (
                            <div className="group relative">
                                <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed max-w-3xl border-l-4 border-[#ff5e3a] pl-6`}>
                                    {subHeadline}
                                </p>
                                {isAdmin && (
                                    <button onClick={() => toggleEdit('subheadline', subHeadline)} className="absolute -top-4 -left-4 p-2 bg-[#ff5e3a] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"><Edit3 className="w-4 h-4"/></button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Experience Section */}
                    <div className={`relative p-6 ${blueprintBorder}`}>
                        {isAdmin && <AdminBadge label="这个模块管理员可以编辑，可以添加工作经历" />}
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold flex items-center gap-3"><Briefcase className="text-[#ff5e3a]"/> 工作经历</h3>
                            {isAdmin && (
                                <button onClick={addExperience} className="p-2 bg-[#00eaff] text-black rounded-full hover:scale-110 transition-transform"><Plus className="w-4 h-4"/></button>
                            )}
                        </div>
                        <div className="space-y-10 border-l border-gray-500/30 ml-3 pl-8">
                            {experiences.map((exp: Experience, i: number) => (
                                <div key={i} className="relative group">
                                    <div className={`absolute -left-[37px] top-1 w-4 h-4 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'} border-2 border-[#ff5e3a] rounded-full`}></div>
                                    
                                    {isAdmin ? (
                                        <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="flex gap-2">
                                                <input value={exp.year} onChange={(e) => updateExperience(i, 'year', e.target.value)} className="bg-transparent border-b border-white/10 text-[#ff5e3a] text-xs font-bold outline-none w-20" />
                                                <button onClick={() => removeExperience(i)} className="ml-auto text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                            <input value={exp.role} onChange={(e) => updateExperience(i, 'role', e.target.value)} className="bg-transparent border-b border-white/10 font-bold text-lg outline-none w-full" />
                                            <input value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} className="bg-transparent border-b border-white/10 text-gray-400 text-sm outline-none w-full" />
                                            <textarea value={exp.desc} onChange={(e) => updateExperience(i, 'desc', e.target.value)} className="bg-transparent border-b border-white/10 text-gray-500 text-xs outline-none w-full resize-none" />
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-[#ff5e3a] font-mono text-xs mb-1 block font-bold">{exp.year}</span>
                                            <h4 className="font-bold text-xl mb-1">{exp.role}</h4>
                                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2 font-medium`}>{exp.company}</p>
                                            <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'} text-sm leading-relaxed`}>{exp.desc}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-12">
                        {/* Skills Section */}
                        <div className={`relative p-6 ${blueprintBorder}`}>
                            {isAdmin && <AdminBadge label="这个模块管理员可以编辑，删除或者添加" />}
                            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3"><Layers className="text-[#ff5e3a]"/> 技能栈</h3>
                            <div className="flex flex-wrap gap-3">
                                {skills.map((skill, index) => (
                                    <span key={index} className={`px-5 py-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/10 shadow-sm'} border rounded-full text-sm font-bold flex items-center gap-2 group transition-all`}>
                                        {skill}
                                        {isAdmin && (
                                            <button onClick={() => removeSkill(skill)} className="text-red-500 hover:scale-125 transition-transform"><X className="w-3 h-3"/></button>
                                        )}
                                    </span>
                                ))}
                                {isAdmin && (
                                    <div className="flex gap-2 w-full mt-4">
                                        <input 
                                            value={newSkill} 
                                            onChange={(e) => setNewSkill(e.target.value)} 
                                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                                            placeholder="新增技能..." 
                                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm outline-none focus:border-[#ff5e3a]"
                                        />
                                        <button onClick={addSkill} className="p-2 bg-[#ff5e3a] text-white rounded-full"><Plus className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Personal Info Section */}
                        <div className={`p-8 rounded-3xl border border-white/10 ${isDark ? 'bg-gradient-to-br from-[#111] to-[#1a1a1a]' : 'bg-white shadow-xl'} shadow-2xl relative group ${blueprintBorder}`}>
                            {isAdmin && <AdminBadge label="管理员可以修改" />}
                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2"><User className="w-5 h-5 text-[#ff5e3a]"/> 个人信息</h4>
                            
                            {editingSection === 'info' ? (
                                <div className="space-y-4 mb-8">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">修改学历</label>
                                        <input 
                                            type="text" 
                                            value={tempData.edu} 
                                            onChange={(e) => setTempData({...tempData, edu: e.target.value})}
                                            className="w-full bg-black/50 border border-[#ff5e3a]/30 rounded-xl p-2 text-sm text-white outline-none focus:border-[#ff5e3a]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 uppercase tracking-wider font-bold">修改语言</label>
                                        <input 
                                            type="text" 
                                            value={tempData.lang} 
                                            onChange={(e) => setTempData({...tempData, lang: e.target.value})}
                                            className="w-full bg-black/50 border border-[#ff5e3a]/30 rounded-xl p-2 text-sm text-white outline-none focus:border-[#ff5e3a]"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEducation(tempData.edu); setLanguage(tempData.lang); setEditingSection(null); }} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3 h-3"/> 保存</button>
                                        <button onClick={() => setEditingSection(null)} className="flex-1 bg-gray-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"><X className="w-3 h-3"/> 取消</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-8 mb-8 relative">
                                    {isAdmin && (
                                        <button 
                                            onClick={() => toggleEdit('info', { edu: education, lang: language })}
                                            className="absolute -top-2 -right-2 p-1.5 bg-[#ff5e3a] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <Edit3 className="w-3 h-3"/>
                                        </button>
                                    )}
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500 block uppercase tracking-wider font-bold">学历</span>
                                        <div className="flex items-center gap-2 text-sm font-black italic"><GraduationCap className="w-4 h-4 text-[#ff5e3a]"/> {education}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-gray-500 block uppercase tracking-wider font-bold">语言</span>
                                        <div className="flex items-center gap-2 text-sm font-black italic"><Languages className="w-4 h-4 text-[#ff5e3a]"/> {language}</div>
                                    </div>
                                </div>
                            )}

                            <button className="group bg-[#ff5e3a] text-white font-black px-6 py-4 rounded-2xl hover:bg-[#ff451a] shadow-[0_6px_0_#992d15] active:translate-y-1 active:shadow-none transition-all w-full flex items-center justify-center gap-2 text-lg">
                                你是我寻找的人吗 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Section */}
                <div className={`relative group ${blueprintBorder}`}>
                    {isAdmin && <AdminBadge label="管理员可以修改" />}
                    
                    <div className={`p-8 rounded-3xl border border-white/10 ${isDark ? 'bg-white/5' : 'bg-white shadow-sm'} italic text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'} border-dashed relative overflow-hidden`}>
                        {editingSection === 'summary' ? (
                            <div className="space-y-4">
                                <textarea 
                                    value={tempData}
                                    onChange={(e) => setTempData(e.target.value)}
                                    className="w-full h-32 bg-black/50 border border-[#ff5e3a]/30 rounded-xl p-4 text-sm text-white outline-none focus:border-[#ff5e3a] resize-none"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => { setSummary(tempData); setEditingSection(null); }} className="px-6 py-2 bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Save className="w-3 h-3"/> 保存</button>
                                    <button onClick={() => setEditingSection(null)} className="px-6 py-2 bg-gray-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"><X className="w-3 h-3"/> 取消</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {isAdmin && (
                                    <button 
                                        onClick={() => toggleEdit('summary', summary)}
                                        className="absolute top-4 right-4 p-1.5 bg-[#ff5e3a] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                    >
                                        <Edit3 className="w-3 h-3"/>
                                    </button>
                                )}
                                {summary}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default AboutView;
