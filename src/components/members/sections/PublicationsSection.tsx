import React from 'react';
import Link from 'next/link';
import { BookOpen, Link as LinkIcon, FileText as FileIcon, Calendar, Users, Lightbulb } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import type { PublicationInfo } from '@/lib/types';

// --- Props 类型定义 ---
type PublicationsSectionProps = {
  publications: PublicationInfo[] | null | undefined;
};

// --- 单个论文条目组件 (移到 Section 内部) ---
// 【注意】需要重新导入 highlightedPaperTitles 或作为 prop 传入
// 暂时移除高亮逻辑以简化，后续可添加
function MemberPublicationItem({ pub }: { pub: PublicationInfo }) {
    const pdfHref = pub.pdf_url
        ? pub.pdf_url.startsWith('http') ? pub.pdf_url : `/pdfs/${pub.pdf_url}`
        : undefined;
    const itemKey = pub.id ?? pub.title;
    // const isHighlighted = pub.title && highlightedPaperTitles.has(pub.title.toLowerCase()); // 暂时移除

    return (
        <li className={`mb-4 pb-4 border-b ${themeColors.footerBorder} last:border-b-0`}>
            <h4 className={`text-md font-semibold ${themeColors.textColorPrimary} mb-1`}>{pub.title}</h4>
            {pub.displayAuthors && pub.displayAuthors.length > 0 && (
                <div className={`text-xs ${themeColors.textColorSecondary} mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-1`}>
                    <Users className={`w-3 h-3 mr-0.5 ${themeColors.textColorTertiary} flex-shrink-0`} />
                    {pub.displayAuthors.map((author, index) => (
                        <span key={`${itemKey}-author-${author.order}`} className="inline-block">
                            {author.type === 'internal' ? (
                                <Link href={`/members/${author.id}`} className={`${themeColors.linkColor} hover:underline`}>
                                    {author.name_zh || author.name_en}
                                    {author.is_corresponding && <span title="Corresponding Author" className="text-red-500 ml-0.5">*</span>}
                                </Link>
                            ) : (
                                <span className={themeColors.textColorSecondary}>{author.text}</span>
                            )}
                            {index < pub.displayAuthors.length - 1 ? <span className="opacity-80">, </span> : ''}
                        </span>
                    ))}
                </div>
            )}
            <div className={`text-xs ${themeColors.textColorTertiary} flex flex-wrap items-center gap-x-2 gap-y-1`}>
                {pub.venue && <span className="flex items-center"><i>{pub.venue}</i></span>}
                {pub.year && <span className="flex items-center"><Calendar className={`w-4 h-4 mr-1 flex-shrink-0`} /> {pub.year}</span>}
                {/* {isHighlighted && ( // 暂时移除
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium tracking-wide ${themeColors.highlightText ?? 'text-amber-900'} ${themeColors.highlightBg ?? 'bg-amber-100'} border border-amber-200`}>
                    🔥 Highly Cited
                  </span>
                )} */} 
                {pub.ccf_rank && pub.ccf_rank !== 'N/A' && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium tracking-wide ${
                        pub.ccf_rank === 'A' ? `${themeColors.ccfAText ?? 'text-blue-900'} ${themeColors.ccfABg ?? 'bg-blue-200'} border border-blue-300` :
                        pub.ccf_rank === 'B' ? `${themeColors.ccfBText ?? 'text-blue-700'} ${themeColors.ccfBBg ?? 'bg-blue-100'} border border-blue-200` :
                        pub.ccf_rank === 'C' ? `${themeColors.ccfCText ?? 'text-blue-600'} ${themeColors.ccfCBg ?? 'bg-blue-50'} border border-blue-100` :
                        'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                       CCF {pub.ccf_rank}
                    </span>
                )}
                {pub.type && !['CONFERENCE', 'JOURNAL'].includes(pub.type) && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${themeColors.ccfCBg ?? 'bg-gray-100'} ${themeColors.ccfCText ?? 'text-gray-600'} border ${themeColors.footerBorder ?? 'border-gray-200'}`}>
                        {pub.type.charAt(0) + pub.type.slice(1).toLowerCase()}
                    </span>
                )}
            </div>
             {pub.abstract && (
                <details className="mt-2 group">
                    <summary className={`cursor-pointer text-xs ${themeColors.linkColor} hover:underline font-medium list-none group-open:mb-1`}>Abstract</summary>
                    <p className={`italic text-xs ${themeColors.textColorTertiary} border-l-2 ${themeColors.footerBorder} pl-2 leading-relaxed`}>{pub.abstract}</p>
                </details>
             )}
            {pub.keywords && (<div className={`mt-1 text-xs ${themeColors.textColorTertiary}`}><span className="font-semibold mr-1">Keywords:</span> {pub.keywords}</div>)}
            {(pdfHref || pub.slides_url || pub.video_url || pub.code_repository_url || pub.project_page_url || pub.dblp_url) && (
                <div className="flex flex-wrap items-center space-x-3 text-xs mt-1">
                    {pdfHref && pdfHref !== '#' && <a href={pdfHref} target="_blank" rel="noopener noreferrer" className={`${themeColors.primary} hover:underline flex items-center gap-0.5`}><FileIcon size={12}/>PDF</a>}
                    {pub.dblp_url && <a href={pub.dblp_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline flex items-center gap-0.5`}><LinkIcon size={12}/>DBLP</a>}
                    {pub.slides_url && <a href={pub.slides_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Slides</a>}
                    {pub.video_url && <a href={pub.video_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Video</a>}
                    {pub.code_repository_url && <a href={pub.code_repository_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Code</a>}
                    {pub.project_page_url && <a href={pub.project_page_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>Project</a>}
                </div>
            )}
        </li>
    );
}

// --- 主 Section 组件 ---
const PublicationsSection: React.FC<PublicationsSectionProps> = ({ publications }) => {
  // Only render if there are publications
  if (!publications || publications.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b ${themeColors.footerBorder} pb-2 mb-3 flex items-center gap-1.5`}>
        <BookOpen size={18}/> 发表成果
      </h2>
      <ul className="list-none p-0 mt-2 space-y-2"> {/* V1 spacing */}
        {publications.map((pub) => (
          <MemberPublicationItem key={pub.id ?? pub.title} pub={pub} />
        ))}
      </ul>
    </section>
  );
};

export default PublicationsSection; 