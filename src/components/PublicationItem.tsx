import { PublicationInfo } from "@/lib/types";
import { themeColors } from "@/lib/constants";
import Link from "next/link";
import {
    Users,
    Calendar,
    Link as LinkIcon,
    FileText as FileIcon,
    BookOpen,  // Example: If you want a book icon for venues
    // Import other icons as needed
} from 'lucide-react';

// 【新增】定义需要高亮的论文标题集合 (小写)
const highlightedPaperTitles = new Set([
    "deep learning-based weather prediction: a survey",
    "exploring power-performance tradeoffs in database systems",
    "power attack: an increasing threat to data centers.",
    "blending on-demand and spot instances to lower costs for in-memory storage",
    "cadre: carbon-aware data replication for geo-diverse services",
    "pet: reducing database energy cost via query optimization",
    "{user-guided} device driver synthesis", // 注意特殊字符
    "when fpga meets cloud: a first look at performance"
]);

// --- 单个论文条目组件 (样式调整以接近 V1) ---
function PublicationItem({ pub }: { pub: PublicationInfo }) {
    const pdfHref = pub.pdf_url
        ? pub.pdf_url.startsWith('http') ? pub.pdf_url : `/pdfs/${pub.pdf_url}` // 假设本地 PDF 在 /public/pdfs
        : undefined;

    // 【新增】检查当前论文是否需要高亮
    const isHighlighted = pub.title && highlightedPaperTitles.has(pub.title.toLowerCase());

    return (
        // V1 边框和间距
        <li className={`mb-4 pb-4 border-b ${themeColors.footerBorder} last:border-b-0`}>
            {/* V1 标题样式 */}
            {/* 【修改】如果高亮，则添加 🔥 图标 */}
            <h3 className={`text-lg font-semibold ${themeColors.textColorPrimary} mb-1`}>
                {isHighlighted && <span className="mr-1">🔥</span>}
                {pub.title}
            </h3>

            {/* 作者信息 (保持 V2 内容, 调整样式) */}
            {pub.displayAuthors && pub.displayAuthors.length > 0 && (
                <div className={`text-sm ${themeColors.textColorSecondary} mb-1 flex flex-wrap items-center gap-x-2 gap-y-1`}>
                    <Users className={`w-3.5 h-3.5 mr-0.5 ${themeColors.textColorTertiary} flex-shrink-0`} />
                    {pub.displayAuthors.map((author, index) => (
                        <span key={author.order} className="inline-block">
                            {author.type === 'internal' ? (
                                <Link href={`/members/${author.id}`} className={`${themeColors.linkColor} hover:underline`}>
                                    {author.name_zh || author.name_en}
                                </Link>
                            ) : (
                                <span className={themeColors.textColorSecondary}>{author.text}</span>
                            )}
                            {author.type === 'internal' && author.is_corresponding && <span title="Corresponding Author" className="text-red-500 ml-0.5">*</span>}
                            {index < pub.displayAuthors.length - 1 ? <span className="opacity-80">, </span> : ''}
                        </span>
                    ))}
                </div>
            )}

            {/* V1 Venue/Year/CCF 行样式 */}
            <div className={`text-sm ${themeColors.textColorTertiary} flex flex-wrap items-center gap-x-4 gap-y-1`}> {/* Added flex-wrap, gap */}
                {pub.venue && <span className="flex items-center"><i>{pub.venue}</i></span>}
                {pub.year && <span className="flex items-center"><Calendar className={`w-4 h-4 mr-1 flex-shrink-0`} /> {pub.year}</span>}
                {/* 【新增】CCF Rank 标签样式 */}
                {pub.ccf_rank && pub.ccf_rank !== 'N/A' && (
                  <span 
                    className={`px-2 py-0.5 rounded-md text-xs font-medium tracking-wide ${ // Added tracking-wide
                      pub.ccf_rank === 'A' ? `${themeColors.ccfAText ?? 'text-blue-900'} ${themeColors.ccfABg ?? 'bg-blue-200'} border border-blue-300` :
                      pub.ccf_rank === 'B' ? `${themeColors.ccfBText ?? 'text-blue-700'} ${themeColors.ccfBBg ?? 'bg-blue-100'} border border-blue-200` :
                      pub.ccf_rank === 'C' ? `${themeColors.ccfCText ?? 'text-blue-600'} ${themeColors.ccfCBg ?? 'bg-blue-50'} border border-blue-100` :
                      'bg-gray-100 text-gray-600 border border-gray-200' // Fallback style
                    }`}
                  >
                     CCF {pub.ccf_rank}
                  </span>
                )}
                {pub.type && !['CONFERENCE', 'JOURNAL'].includes(pub.type) && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${themeColors.ccfCBg ?? 'bg-gray-100'} ${themeColors.ccfCText ?? 'text-gray-600'} border ${themeColors.footerBorder ?? 'border-gray-200'}`}> {/* Adjusted styling for other types */}
                        {pub.type.charAt(0) + pub.type.slice(1).toLowerCase()} {/* Format type e.g., 'Book' */}
                    </span>
                )}
            </div>

            {/* Abstract & Keywords (保持 V2 内容, 调整样式) */}
             {pub.abstract && (
                <details className="mt-2 group">
                    <summary className={`cursor-pointer text-sm ${themeColors.linkColor} hover:underline font-medium list-none group-open:mb-1`}>Abstract</summary>
                    <p className={`italic text-sm ${themeColors.textColorTertiary} border-l-2 ${themeColors.footerBorder} pl-2 leading-relaxed`}>{pub.abstract}</p>
                </details>
             )}
            {pub.keywords && (<div className={`mt-1 text-sm ${themeColors.textColorTertiary}`}><span className="font-semibold mr-1">Keywords:</span> {pub.keywords}</div>)}

            {/* V1 链接区域样式 */}
            {(pub.doi_url || pdfHref || pub.slides_url || pub.video_url || pub.code_repository_url || pub.project_page_url || pub.bibtex) && (
                <div className="flex flex-wrap items-center space-x-4 text-sm mt-1">
                    {pub.doi_url && <a href={`https://doi.org/${pub.doi_url}`} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline flex items-center gap-0.5`}><LinkIcon size={14}/>DOI</a>}
                    {pdfHref && pdfHref !== '#' && <a href={pdfHref} target="_blank" rel="noopener noreferrer" className={`${themeColors.primary /* V1 used primary for PDF */} hover:underline flex items-center gap-0.5`}><FileIcon size={14}/>PDF</a>}
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

export default PublicationItem; 