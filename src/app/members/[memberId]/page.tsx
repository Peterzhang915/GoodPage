// src/app/members/[memberId]/page.tsx
import React from 'react';
// 数据获取和类型保持不变
import { getMemberProfileData } from '@/lib/members';
import type { MemberProfileData, PublicationInfo } from '@/lib/types'; // 使用 V2 的类型
import type { Member, Education, Award, ProjectMember, Project, Teaching, Presentation, SoftwareDataset, Patent, AcademicService, News } from '@/lib/prisma';
import { PublicationType, ArtefactType, MemberStatus } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MemberProfileImage } from '@/components/MemberProfileImage';
import Link from 'next/link';
import {
    Github, ExternalLink, Linkedin, Mail, BookOpen, Link as LinkIcon, FileText as FileIcon,
    Calendar, Users, Clock, GraduationCap, Award as AwardIcon, Briefcase, Code, Database,
    FileText as PatentIcon, Presentation as PresentationIcon, UserCheck, Building, BookCopy, Info, Star, BriefcaseBusiness, Lightbulb
} from 'lucide-react';
import Image from 'next/image';
import { themeColors } from '@/styles/theme'; // 导入 V2 提供的 themeColors

const placeholderAvatar = '/avatars/placeholder.png';

// --- Props 类型定义 ---
interface MemberPageProps {
    params: {
        memberId: string;
    }
}

// --- 单个论文条目组件 (样式调整以接近 V1) ---
function MemberPublicationItem({ pub }: { pub: PublicationInfo }) {
    const pdfHref = pub.pdf_url
        ? pub.pdf_url.startsWith('http') ? pub.pdf_url : `/pdfs/${pub.pdf_url}` // 假设本地 PDF 在 /public/pdfs
        : undefined;

    return (
        // V1 边框和间距
        <li className={`mb-4 pb-4 border-b ${themeColors.footerBorder} last:border-b-0`}>
            {/* V1 标题样式 */}
            <h4 className={`text-md font-semibold ${themeColors.textColorPrimary} mb-1`}>{pub.title}</h4>

            {/* 作者信息 (保持 V2 内容, 调整样式) */}
            {pub.authors && pub.authors.length > 0 && (
                <div className={`text-xs ${themeColors.textColorSecondary} mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1`}>
                    <Users className={`w-3 h-3 mr-0.5 ${themeColors.textColorTertiary} flex-shrink-0`} />
                    {pub.authors.map((author, index) => (
                        <span key={author.id} className="inline-block">
                            <Link href={`/members/${author.id}`} className={`${themeColors.linkColor} hover:underline`}>
                                {author.name_zh || author.name_en}
                            </Link>
                            {author.is_corresponding && <span title="Corresponding Author" className="text-red-500 ml-0.5">*</span>}
                            {index < pub.authors.length - 1 ? <span className="opacity-80">, </span> : ''}
                        </span>
                    ))}
                </div>
            )}

            {/* V1 Venue/Year/CCF 行样式 */}
            <div className={`text-xs ${themeColors.textColorTertiary}`}>
                {pub.venue && <span className="mr-2 italic">{pub.venue}</span>}
                {pub.year && <span className="mr-2">({pub.year})</span>}
                {/* V1 CCF Rank 样式 */}
                {pub.ccf_rank && (
                    <span className={`mr-2 ${pub.ccf_rank === 'A' ? themeColors.ccfAText : pub.ccf_rank === 'B' ? themeColors.ccfBText : pub.ccf_rank === 'C' ? themeColors.ccfCText : themeColors.textColorPrimary}`}>
                        CCF: <span className="font-medium">{pub.ccf_rank}</span>
                    </span>
                )}
                {pub.type && !['CONFERENCE', 'JOURNAL'].includes(pub.type) && (
                    <span className={`mr-2 px-1 py-0.5 rounded text-xs font-medium ${themeColors.ccfCBg} ${themeColors.ccfCText}`}> {/* Use Ccf C style for other types */}
                        {pub.type}
                    </span>
                )}
            </div>

            {/* Abstract & Keywords (保持 V2 内容, 调整样式) */}
             {pub.abstract && (
                <details className="mt-2 group">
                    <summary className={`cursor-pointer text-xs ${themeColors.linkColor} hover:underline font-medium list-none group-open:mb-1`}>Abstract</summary>
                    <p className={`italic text-xs ${themeColors.textColorTertiary} border-l-2 ${themeColors.footerBorder} pl-2 leading-relaxed`}>{pub.abstract}</p>
                </details>
             )}
            {pub.keywords && (<div className={`mt-1 text-xs ${themeColors.textColorTertiary}`}><span className="font-semibold mr-1">Keywords:</span> {pub.keywords}</div>)}

            {/* V1 链接区域样式 */}
            {(pub.doi_url || pdfHref || pub.slides_url || pub.video_url || pub.code_repository_url || pub.project_page_url || pub.bibtex) && (
                <div className="flex flex-wrap items-center space-x-3 text-xs mt-1">
                    {pub.doi_url && <a href={`https://doi.org/${pub.doi_url}`} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline flex items-center gap-0.5`}><LinkIcon size={12}/>DOI</a>}
                    {pdfHref && pdfHref !== '#' && <a href={pdfHref} target="_blank" rel="noopener noreferrer" className={`${themeColors.primary /* V1 used primary for PDF */} hover:underline flex items-center gap-0.5`}><FileIcon size={12}/>PDF</a>}
                    {/* 简化其他链接显示，可按需添加图标和样式 */}
                    {pub.slides_url && <a href={pub.slides_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Slides</a>}
                    {pub.video_url && <a href={pub.video_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Video</a>}
                    {pub.code_repository_url && <a href={pub.code_repository_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Code</a>}
                    {pub.project_page_url && <a href={pub.project_page_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Project</a>}
                    {pub.bibtex && <span className={`${themeColors.textColorTertiary} cursor-pointer`} title={pub.bibtex}>BibTeX</span> /* 或实现复制功能 */}
                </div>
            )}
        </li>
    );
}


// --- 主页面组件 (Server Component) ---
export default async function MemberProfilePage({ params }: MemberPageProps) {
    const { memberId } = params;
    let memberProfileData: MemberProfileData | null = null;
    let error: string | null = null;

    try {
        memberProfileData = await getMemberProfileData(memberId);
    } catch (err) {
        console.error(`Failed to load profile for ${memberId}:`, err);
        error = err instanceof Error ? err.message : "加载成员档案失败";
    }

    if (!memberProfileData && !error) {
        notFound();
    }

    if (error) {
        return ( <div className="container mx-auto px-4 py-12 text-center text-red-600"><p>Error: {error}</p></div> );
    }

    const {
        displayStatus, educationHistory, awards, projects, teachingRoles, presentations,
        softwareAndDatasets, patents, academicServices, publications, newsMentions,
        supervisor, supervisees, ...member
    } = memberProfileData!;

    return (
        // V1 Container Style
        <div className={`max-w-4xl mx-auto my-8 sm:my-12 ${themeColors.navBackground} shadow-lg rounded-lg overflow-hidden`}>
            {/* V1 Layout Style */}
            <div className="md:flex">

                {/* --- 左侧边栏 (V1 Style) --- */}
                {/* V1 Width, Gradient, Padding, Alignment */}
                <aside className={`md:w-1/3 p-6 bg-gradient-to-br from-${themeColors.ccfCBg} to-${themeColors.ccfBBg} flex flex-col items-center justify-start text-center`}>
                    {/* V1 Avatar Style */}
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${themeColors.footerBorder} shadow-md mb-4 flex-shrink-0`}>
                        <MemberProfileImage src={member.avatar_url || placeholderAvatar} alt={`${member.name_zh || member.name_en} 头像`} width={128} height={128} />
                    </div>
                    {/* V1 Text Styles */}
                    <h1 className={`text-2xl font-bold ${themeColors.textColorPrimary}`}>{member.name_zh || member.name_en}</h1>
                    {member.name_en && member.name_zh && <p className={`text-md ${themeColors.textColorSecondary} mb-1`}>{member.name_en}</p>}
                    {/* 使用 V1 的 displayStatus 样式 */}
                    <p className={`text-sm font-semibold ${themeColors.textColorPrimary} mb-2`}>{displayStatus}</p>
                    {/* V1 Email Style */}
                    {member.email && (
                        <a href={`mailto:${member.email}`} className={`text-sm ${themeColors.linkColor} hover:underline break-all mb-3 block flex items-center justify-center gap-x-1`}>
                           <Mail size={14} /> {member.email}
                        </a>
                    )}

                    {/* V1 Social Icons Style (at the bottom of primary info) */}
                    <div className="flex justify-center items-center space-x-4 mt-2 mb-4 flex-wrap gap-y-2">
                         {member.github_url && <a href={member.github_url} target="_blank" rel="noopener noreferrer" title="GitHub" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}><Github size={20} /></a>}
                         {member.personal_website && <a href={member.personal_website} target="_blank" rel="noopener noreferrer" title="Website" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}><ExternalLink size={20} /></a>}
                         {member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}><Linkedin size={20} /></a>}
                         {member.google_scholar_id && <a href={`https://scholar.google.com/citations?user=${member.google_scholar_id}`} target="_blank" rel="noopener noreferrer" title="Google Scholar" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}><GraduationCap size={20} /></a>}
                         {member.dblp_id && <a href={`https://dblp.org/pid/${member.dblp_id}.html`} target="_blank" rel="noopener noreferrer" title="DBLP" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}><BookCopy size={20} /></a>}
                         {member.cv_url && <a href={member.cv_url} target="_blank" rel="noopener noreferrer" title="CV" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}><FileIcon size={20} /></a>}
                    </div>

                    {/* Additional Sidebar Info (Styled concisely) */}
                    <div className="w-full space-y-3 text-xs border-t ${themeColors.footerBorder} pt-4 mt-auto"> {/* Pushes to bottom if sidebar grows */}
                         {member.office_location && (<p className={`${themeColors.textColorTertiary} flex items-center justify-center gap-x-1`}><Building size={12} /> {member.office_location}</p>)}
                         {member.office_hours && (<p className={`${themeColors.textColorTertiary} flex items-center justify-center gap-x-1`}><Clock size={12} /> {member.office_hours}</p>)}
                         {member.recruiting_status && (<div className={`p-1.5 rounded ${themeColors.ccfCBg} ${themeColors.ccfBText} font-medium flex items-center justify-center gap-x-1`}><UserCheck size={12} /> {member.recruiting_status}</div>)}
                         {member.skills && (
                             <div className="text-center">
                                 <h3 className={`text-xs font-semibold ${themeColors.textColorPrimary} mb-1`}>Skills</h3>
                                 <div className="flex flex-wrap justify-center gap-1">
                                     {member.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                                         <span key={i} className={`font-medium px-1.5 py-0.5 rounded ${themeColors.ccfCBg} ${themeColors.textColorSecondary}`}>{skill}</span>
                                     ))}
                                 </div>
                             </div>
                          )}
                         {supervisor && (
                             <div className="text-center">
                                 <h3 className={`text-xs font-semibold ${themeColors.textColorPrimary} mb-0.5`}>Supervisor</h3>
                                 <Link href={`/members/${supervisor.id}`} className={`${themeColors.linkColor} hover:underline`}>
                                     {supervisor.name_zh || supervisor.name_en}
                                 </Link>
                             </div>
                         )}
                    </div>
                </aside>

                {/* --- 右侧主内容区 (V1 Style) --- */}
                {/* V1 Width and Padding */}
                <div className="md:w-2/3 p-6">
                    {/* V1 Section Spacing */}
                    <div className="space-y-6 md:space-y-8">
                        {/* 个人简介 */}
                        {(member.bio_zh || member.bio_en) && (
                            <section>
                                {/* V1 Heading Style */}
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><Info size={18}/>个人简介</h2>
                                {member.bio_zh && <p className={`${themeColors.textColorSecondary} text-sm leading-relaxed mb-2`}>{member.bio_zh}</p>}
                                {member.bio_en && <p className={`${themeColors.textColorTertiary} italic text-sm leading-relaxed`}>{member.bio_en}</p>}
                            </section>
                        )}

                        {/* 教育背景 */}
                        {educationHistory && educationHistory.length > 0 && (
                             <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><GraduationCap size={18}/> 教育背景</h2>
                                <ul className="space-y-3 list-none p-0 mt-3">
                                    {educationHistory.map(edu => (
                                        <li key={edu.id} className="flex items-start gap-x-2.5 text-sm">
                                            <div className={`w-1.5 h-1.5 mt-[7px] rounded-full ${themeColors.primaryBg} flex-shrink-0`}></div>
                                            <div className="flex-grow">
                                                <p className={`font-semibold ${themeColors.textColorPrimary}`}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                                                <p className={`${themeColors.textColorSecondary}`}>{edu.school}</p>
                                                <p className={`text-xs ${themeColors.textColorTertiary}`}>{edu.start_year} - {edu.end_year ?? 'Present'}</p>
                                                {edu.thesis_title && <p className={`text-xs italic ${themeColors.textColorTertiary} mt-0.5`}>Thesis: {edu.thesis_title}</p>}
                                                {edu.description && <p className={`text-xs ${themeColors.textColorTertiary} mt-0.5`}>{edu.description}</p>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                         {/* 研究兴趣 */}
                        {member.research_interests && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><Lightbulb size={18}/> 研究兴趣</h2>
                                {/* V1 Tag Style */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {member.research_interests.split(',').map(s => s.trim()).filter(Boolean).map((interest, index) => (
                                        <span key={index} className={`${themeColors.ccfBBg} ${themeColors.ccfAText} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                                            {interest}
                                        </span>
                                     ))}
                                </div>
                            </section>
                        )}

                        {/* 发表成果 */}
                        {publications && publications.length > 0 && (
                             <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><BookOpen size={18}/> 发表成果</h2>
                                <ul className="list-none p-0 mt-2 space-y-2"> {/* V1 spacing */}
                                    {publications.map((pub) => (
                                        <MemberPublicationItem key={pub.id ?? pub.doi_url ?? pub.title} pub={pub} />
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 所获荣誉 */}
                        {awards && awards.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><AwardIcon size={18}/> 所获荣誉</h2>
                                <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
                                    {awards.map(award => (
                                        <li key={award.id} className={`${themeColors.textColorSecondary}`}>
                                            {award.link_url ? <a href={award.link_url} target='_blank' rel='noopener noreferrer' className='hover:underline'>{award.title}</a> : award.title}
                                            {award.organization ? `, ${award.organization}` : ''}
                                            {award.year ? ` (${award.year})` : ''}
                                            {award.description && <span className={`text-xs italic ${themeColors.textColorTertiary} block`}>{award.description}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                         {/* 研究项目 */}
                         {projects && projects.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><Briefcase size={18}/> 研究项目</h2>
                                <ul className="space-y-4 list-none p-0 mt-3">
                                    {projects.map(({ project, role }) => (
                                         <li key={project.id} className={`border-l-3 ${themeColors.ccfBText} pl-3 py-1`}> {/* Slightly thinner border */}
                                            <h4 className={`font-semibold ${themeColors.textColorPrimary} text-sm`}>
                                                {project.url ? <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{project.title}</a> : project.title}
                                                {role && <span className={`ml-1.5 text-xs font-normal px-1 py-0.5 rounded ${themeColors.ccfCBg} ${themeColors.textColorSecondary}`}>({role})</span>}
                                            </h4>
                                            {project.description && <p className={`text-xs mt-0.5 ${themeColors.textColorSecondary}`}>{project.description}</p>}
                                            <p className={`text-xs mt-0.5 ${themeColors.textColorTertiary}`}>
                                                {project.status && <span className="mr-1.5 font-medium">{project.status}</span>}
                                                ({project.start_year ?? '?'} - {project.end_year ?? 'Present'})
                                                {project.funding_source && <span className="ml-1.5">(Funded by {project.funding_source})</span>}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 教学经历 */}
                        {teachingRoles && teachingRoles.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><Building size={18}/> 教学经历</h2>
                                <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
                                    {teachingRoles.map(teach => (
                                        <li key={teach.id} className={`${themeColors.textColorSecondary}`}>
                                            {teach.course_title} {teach.course_code ? `(${teach.course_code})` : ''}
                                            {teach.semester && `, ${teach.semester}`}
                                            {teach.role && teach.role !== 'Instructor' ? <span className="ml-1 text-xs">({teach.role})</span> : ''}
                                            {teach.description_url && <a href={teach.description_url} target="_blank" rel="noopener noreferrer" className={`ml-1.5 text-xs ${themeColors.linkColor} hover:underline`}>[Details]</a>}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                         )}

                        {/* 学术报告 */}
                        {presentations && presentations.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><PresentationIcon size={18}/> 学术报告</h2>
                                <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
                                    {presentations.map(pres => (
                                        <li key={pres.id} className={`${themeColors.textColorSecondary}`}>
                                            "{pres.title}"
                                            {pres.is_invited && <span className={`ml-1 text-xs font-medium ${themeColors.accentColor}`}>(Invited)</span>}
                                            {pres.event_name ? `, ${pres.event_name}` : ''}
                                            {pres.location ? `, ${pres.location}` : ''}
                                            {pres.year ? ` (${pres.year})` : ''}
                                            {pres.url && <a href={pres.url} target="_blank" rel="noopener noreferrer" className={`ml-1.5 text-xs ${themeColors.linkColor} hover:underline`}>[Slides/Video]</a>}
                                        </li>
                                     ))}
                                </ul>
                            </section>
                         )}

                         {/* 软件与数据集 */}
                         {softwareAndDatasets && softwareAndDatasets.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}>
                                    <Code size={18}/>/<Database size={18}/> 软件与数据集
                                </h2>
                                <ul className="space-y-4 list-none p-0 mt-3">
                                    {softwareAndDatasets.map(item => (
                                        <li key={item.id} className="flex items-start gap-x-2.5">
                                             {item.type === ArtefactType.SOFTWARE
                                                 ? <Code className={`w-4 h-4 mt-1 ${themeColors.primary} flex-shrink-0`} />
                                                 : <Database className={`w-4 h-4 mt-1 ${themeColors.primary} flex-shrink-0`} />
                                             }
                                            <div className='flex-grow text-sm'>
                                                <h4 className={`font-semibold ${themeColors.textColorPrimary}`}>{item.title}</h4>
                                                {item.description && <p className={`text-xs mt-0.5 ${themeColors.textColorSecondary}`}>{item.description}</p>}
                                                <div className={`flex flex-wrap items-center gap-x-2.5 text-xs mt-0.5 ${themeColors.textColorTertiary}`}>
                                                    {item.version && <span>v{item.version}</span>}
                                                    {item.license && <span>{item.license}</span>}
                                                    {item.status && <span>{item.status}</span>}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-2.5 text-xs mt-0.5">
                                                    {item.repository_url && <a href={item.repository_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Repository</a>}
                                                    {item.project_url && <a href={item.project_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Project/Demo</a>}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* 专利 */}
                        {patents && patents.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><PatentIcon size={18}/> 专利</h2>
                                <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
                                    {patents.map(patent => (
                                        <li key={patent.id} className={`${themeColors.textColorSecondary}`}>
                                            {patent.title}
                                            {patent.patent_number ? ` (No. ${patent.patent_number})` : ''}
                                            {patent.status ? ` [${patent.status}]` : ''}
                                            {patent.issue_date ? `, Issued: ${patent.issue_date}` : ''}
                                            {patent.url && <a href={patent.url} target="_blank" rel="noopener noreferrer" className={`ml-1.5 text-xs ${themeColors.linkColor} hover:underline`}>[Link]</a>}
                                            {patent.inventors_string && <span className="block text-xs italic">Inventors: {patent.inventors_string}</span>}
                                        </li>
                                     ))}
                                </ul>
                            </section>
                        )}

                        {/* 学术服务 */}
                        {academicServices && academicServices.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><BriefcaseBusiness size={18}/> 学术服务</h2>
                                <ul className="space-y-2 list-disc pl-5 text-sm mt-3">
                                    {academicServices.map(service => (
                                        <li key={service.id} className={`${themeColors.textColorSecondary}`}>
                                            {service.role}, {service.event}
                                            {service.year ? ` (${service.year})` : ''}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                         )}

                         {/* "更多关于我" */}
                        {member.more_about_me && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><Info size={18}/> 更多关于我</h2>
                                <div className={`text-sm leading-relaxed ${themeColors.textColorSecondary} whitespace-pre-wrap mt-3`}>
                                    {member.more_about_me}
                                </div>
                            </section>
                        )}

                         {/* 指导学生列表 */}
                        {supervisees && supervisees.length > 0 && (
                            <section>
                                <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}><Users size={18}/> 指导学生</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                                    {supervisees.map(student => (
                                        <Link href={`/members/${student.id}`} key={student.id} className={`flex items-center space-x-2 p-1.5 rounded hover:${themeColors.ccfCBg} transition-colors`}>
                                             <Image src={student.avatar_url || placeholderAvatar} alt={student.name_zh || student.name_en || 'Avatar'} width={28} height={28} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                            <div className='text-sm'>
                                                <p className={`font-medium ${themeColors.linkColor}`}>{student.name_zh || student.name_en}</p>
                                                <p className={`text-xs capitalize ${themeColors.textColorTertiary}`}>
                                                    {student.status === MemberStatus.ALUMNI ? 'Alumni' : student.status.toLowerCase().replace('_', ' ')}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}