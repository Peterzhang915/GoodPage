// src/app/xuz/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Link as LinkIcon, FileText as FileIcon, Calendar, Users } from 'lucide-react';
import { notFound } from 'next/navigation';

// 【修改】导入获取 *所有* 论文的函数和类型
import { getAllPublicationsFormatted } from '@/lib/publications';
import type { PublicationInfo, AuthorInfo } from '@/lib/types';
import type { Member } from '@/lib/prisma'; // AuthorInfo 需要 Member['id']

import { themeColors } from '@/styles/theme';

// --- 单个论文条目组件 ---
// (保持不变，接收 PublicationInfo)
function PublicationItem({ pub }: { pub: PublicationInfo }) {
    const pdfHref = pub.pdf_url
        ? pub.pdf_url.startsWith('http') ? pub.pdf_url : `/pdfs/${pub.pdf_url}`
        : undefined;

    return (
        // Reduced bottom margin slightly if needed, but kept padding for internal spacing
        <li key={pub.id ?? pub.doi_url ?? pub.title} className={`rounded-lg border ${themeColors.borderLight ?? 'border-gray-200 dark:border-gray-700'} p-4 md:p-5 space-y-1.5 transition-shadow hover:shadow-md mb-3`}> {/* Reduced mb-4 to mb-3, adjusted space-y-2 to space-y-1.5 */}
            <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ''} mb-1 leading-normal flex items-start gap-x-2`}>
                <BookOpen className={`w-5 h-5 mt-0.5 ${themeColors.primary ?? 'text-blue-600'} flex-shrink-0`} />
                <span className="flex-grow">{pub.title}</span>
            </h3>
            {pub.authors && pub.authors.length > 0 && (
                <div className={`text-sm ${themeColors.textColorSecondary ?? ''} mb-1 pl-7 flex items-center flex-wrap gap-x-1.5 gap-y-1`}>
                    <Users className={`w-4 h-4 mr-1 ${themeColors.textColorTertiary ?? 'text-gray-500'} flex-shrink-0`} />
                    {pub.authors.map((author: AuthorInfo, index: number) => (
                        <span key={author.id} className="inline-block">
                            {/* 假设作者 ID 存在于 Member 表中 */}
                            <Link href={`/members/${author.id}`} className={`${themeColors.linkColor ?? 'text-blue-600'} hover:underline`}>
                                {author.name_zh || author.name_en}
                            </Link>
                            {author.is_corresponding && <span title="Corresponding Author" className="text-red-500">*</span>}
                            {index < pub.authors.length - 1 ? <span className="opacity-80">, </span> : ''}
                        </span>
                    ))}
                </div>
            )}
            <div className={`text-xs ${themeColors.textColorTertiary ?? 'text-gray-500'} pl-7 flex flex-wrap items-center gap-x-3 gap-y-1`}>
                {pub.venue && <span className="italic">{pub.venue}</span>}
                {pub.year && <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {pub.year}</span>}
            </div>
             {(pub.doi_url || pdfHref) && (
                <div className="mt-2 pl-7 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                    {pub.doi_url && <a href={`https://doi.org/${pub.doi_url}`} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor ?? 'text-blue-600'} hover:underline font-medium flex items-center gap-1`}><LinkIcon size={14}/>DOI</a>}
                    {pdfHref && pdfHref !== '#' && <a href={pdfHref} target="_blank" rel="noopener noreferrer" className={`${themeColors.primary ?? 'text-red-600'} hover:underline font-medium flex items-center gap-1`}><FileIcon size={14}/>PDF</a>}
                </div>
            )}
        </li>
    );
}


// --- 教授页面组件 (Server Component) ---
export default async function ProfessorPage() {

  // --- 【修改】动态获取 *所有* 出版物数据 ---
  let allPublications: PublicationInfo[] = [];
  let error: string | null = null;

  try {
      // 调用获取所有论文的函数
      allPublications = await getAllPublicationsFormatted();
  } catch (err) {
      console.error(`Failed to load all publications:`, err);
      error = err instanceof Error ? err.message : "加载出版物列表失败";
  }

  // --- 在代码中筛选 CCF A 类出版物 ---
  const ccfAPubs = allPublications.filter((pub: PublicationInfo) => pub.ccf_rank === 'A');


  // --- 静态/硬编码数据 (保持不变) ---
  const academicServices = [ /* ... */
    { label: 'Artifact Chair', value: 'APPT 2025' }, { label: 'Local Chair', value: 'SiftDB 2025' },
    { label: 'PC', value: 'SenSys 2024' }, { label: 'Publicity Chair', value: 'CCFSys 2024' },
    { label: 'Org. Committee', value: 'CCF Computility 2024, CCF Chips 2024' },
    { label: 'Program Chair', value: 'GreenCom 2022' }, { label: 'Guest Editor', value: 'IEEE Trans. on Sustainable Computing' },
    { label: 'Local Chair/PC', value: 'CCFsys 2022' }, { label: 'PC Member', value: 'CCFsys 2020, CCFChips 2021' },
    { label: '评审专家', value: '教育部学位中心, 2020-2025' },
   ];
  const detailedServices = [ /* ... */
    'PC, SoCC, 2022', 'PC, SSDBM, 2022', 'PC, NDBC, 2021, 2022','PC, ICPADS, 2021, 2022', 'Track Chair, IEEE BigData, 2021', 'Publicity Chair, SSDBM, 2021','PC, HPCChina, 2021', 'PC, ACM SIGCSE 2020, 2021', 'Publicity Chair, ICAC 2019, 2020, 2021','PC, ICAC 2015, 2017, 2019, 2020, 2021', 'Chair, CTC China Workshop 2020', 'Workshop Chair, ACA 2020','PC, ACM TUR-C 2020', 'PC, HPBD&IS 2020', 'PC, NAS 2019', 'Publicity Chair, IWQoS 2016','Session Chair, INFOCOM 2016', 'Session Chair, ICDCS 2015', 'PC, ICDCS 2013, 2020',
  ];
  const recentHighlights = [ /* ... */
    { label: 'Provincial Tech. Award', value: 'First Awardee, JiangXi, 2024' },
    { label: 'National R/D Project', value: 'Co-PI, Ministry of Science, 2023-2025' },
  ];
  const researchGrants = [ /* ... */
    { label: 'Provincial R/D Project', value: 'PI, Dept. of Tech JiangXi, 2022-2024' },
    { label: 'Cambodian Funding', value: 'Principal Investigator, 2021' },
    { label: 'National R/D Project', value: 'Co-PI, Min. of Science, 2019-2022' },
    { label: 'NSFC Youth Grant', value: 'PI, NSFC, 2018-2020' },
   ];
  const detailedAwards = [ /* ... */
    'Education Major Grant, Dept. of Edu. JiangXi, 2019-2021', 'National KHF Key Project, Min. of Science, 2018-2020',
    'Jiangxi Thousand Young Talents, 2018', 'Tencent Rhino Bird Grant, Tencent, 2017-2018',
    'AWS Research Education Grant, Amazon, 2015-2017', 'Microsoft Azure Research Grant, Microsoft, 2017-2018',
    'Finalist in Edward F. Hayes Forum, OSU, 2015', 'Student Travel Grant, USENIX Association, 2013',
    'USF Student Challenge Grant, USF, 2010-2011', 'Best Paper Award, Florida Emerging Paradigms, 2010',
    'Student Travel Grant, SIGMOD, 2010', 'Conference Presentation Grant, USF, 2010',
    'Best Research Poster Award, USF, 2009', 'Best Undergraduate Thesis, BUPT, 2007',
    'Finalist in WESC, Microsoft, 2006', 'Honored Graduate, BUPT, 2007 (Top 8%)',
   ];
  // -----------------------------------

  return (
    <div className={`${themeColors.themePageBg ?? 'bg-gray-50'} min-h-screen`}>

      {/* 顶部标题栏区域: 使用硬编码信息 - Reduced Padding */}
      <div className={`${themeColors.primaryBg ?? 'bg-slate-800'} ${themeColors.textGrayWhite ?? 'text-gray-100'} py-10 md:py-12 lg:py-16`}> {/* Reduced py-12/16/20 */}
         {/* ... Header content 使用硬编码 ... */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-10"> {/* Reduced gap-8/12 */}
            <div className="md:pr-8 text-center md:text-left mb-5 md:mb-0 flex-grow"> {/* Reduced pr-10, mb-6 */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-1">Dr. Zichen Xu</h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-2">Zichen Xu</p> {/* Reduced mb-3 */}
              <p className={`text-base sm:text-lg lg:text-xl mb-4`}> {/* Reduced mb-5 */}
                  Professor, Vice Dean<br />
                  School of Mathematics and Computer Science<br />
                  The Nanchang University
              </p>
              <div className={`space-y-1 text-sm sm:text-base ${themeColors.textGrayWhite ?? 'text-gray-100'}`}>
                  <span className="block">Email: <a href="mailto:xuz@ncu.edu.cn" className="hover:underline">xuz@ncu.edu.cn</a></span>
                  <span className="block">Office telephone: (0791) 8396 8516</span>
                  <span className="block">999 Xuefu BLVD</span>
                  <span className="block">Nanchang, Jiangxi, 330000</span>
                  {/* 可选: 添加办公室地点 */}
                  {/* <span className="block">Office: Room XXX</span> */}
              </div>
            </div>
            <div className={`w-40 h-48 md:w-48 md:h-56 lg:w-52 lg:h-60 ${themeColors.backgroundLight ?? 'bg-gray-200'} overflow-hidden rounded-lg flex-shrink-0 border-4 ${themeColors.borderLight ?? 'border-gray-300'} shadow-lg`}>
               <Image src="/avatars/zichenxu.jpg" alt="Dr. Zichen Xu" width={208} height={240} priority unoptimized />
            </div>
          </div>
         </div>
      </div>

      {/* 主要内容区域 - Reduced Padding and Spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12"> {/* Reduced py-16/20 */}
        <div className="flex flex-col space-y-2 md:space-y-4"> {/* Reduced space-y-16/20 */}

          {/* 研究兴趣板块: 使用静态文本 - Reduced Margin */}
          <section id="interests">
             <h2 className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Research Interests</h2> {/* Reduced pb-3, mb-6/8 */}
             <div className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary ?? ''}`}>
                 <p>My research interests are primarily in the area of computing system design...</p> {/* 保持静态 */}
             </div>
          </section>

          {/* 出版物板块: 显示动态获取并筛选后的 ccfAPubs - Reduced Margin */}
          <section id="publications">
             <h2 className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Selected Publications</h2> {/* Reduced pb-3, mb-6/8 */}
             {error && (<p className={`text-red-600 dark:text-red-400 ${themeColors.backgroundWhite ?? 'bg-red-50'} p-3 rounded-md mb-4`}>Error loading publications: {error}</p>)}
             {!error && ccfAPubs.length > 0 ? (
                // Kept space-y-4 for clear separation between papers, adjusted li margin above
               <ul className="list-none p-0 space-y-4">
                 {ccfAPubs.map((pub) => (
                   <PublicationItem key={pub.id ?? pub.doi_url ?? pub.title} pub={pub} />
                 ))}
               </ul>
             ) : (
               !error && <p className={`text-sm md:text-base ${themeColors.textColorTertiary ?? 'text-gray-500'}`}>No selected publications found.</p>
             )}
             {/* (可选) 查看所有链接 */}
             {/* <div className="mt-4 text-right"> <Link href="/publications" className="...">View All Publications</Link> </div> */} {/* Reduced mt-6 if uncommented */}
          </section>

          {/* 学术服务板块: 使用硬编码数据 - Reduced Margin and Gap */}
          <section id="services">
              <h2 className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Academic Services</h2> {/* Reduced pb-3, mb-6/8 */}
              <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm md:text-base ${themeColors.textColorSecondary ?? ''}`}> {/* Reduced mt-5, gap-y-3 */}
                   {academicServices.map((service, index) => (
                      <div key={index} className="flex flex-col md:flex-row md:items-baseline md:gap-x-2">
                          <span className={`font-semibold ${themeColors.primary ?? 'text-blue-600'} md:w-40 lg:w-44 flex-shrink-0 mb-0.5 md:mb-0 break-words`}>{service.label}:</span> {/* Reduced mb-1 */}
                          <span className={`${themeColors.textColorSecondary ?? ''} flex-grow`}>{service.value}</span>
                      </div>
                  ))}
              </div>
              <div className="mt-4"> {/* Reduced mt-6 */}
                  <details className={`${themeColors.textColorSecondary ?? ''}`}>
                      <summary className={`cursor-pointer font-medium ${themeColors.linkColor ?? 'text-blue-600'} hover:underline text-sm md:text-base`}>View all academic services</summary>
                      {/* Reduced internal gap */}
                      <div className={`mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-4 border-l-2 ${themeColors.borderLight ?? 'border-gray-300'} text-xs sm:text-sm`}> {/* Reduced mt-4, gap-x-8, gap-y-3 */}
                          {detailedServices.map((item, index) => <div key={index}>{item}</div>)}
                      </div>
                  </details>
              </div>
          </section>

          {/* 奖项与荣誉板块: 使用硬编码数据 - Reduced Margins and Spacing */}
          <section id="awards">
              <h2 className={`text-2xl md:text-3xl font-bold border-b pb-2 mb-4 md:mb-5 ${themeColors.borderLight ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Awards and Honors</h2> {/* Reduced pb-3, mb-6/8 */}
              <div className={`mt-4 space-y-6 md:space-y-8 text-sm md:text-base ${themeColors.textColorSecondary ?? ''}`}> {/* Reduced mt-5, space-y-10/12 */}
                   <div>
                      <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ''} mb-3`}>Recent Highlights</h3> {/* Reduced mb-4 */}
                      {/* Reduced internal gap */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"> {/* Reduced gap-y-3 */}
                          {recentHighlights.map((highlight, index) => (
                              <div key={index} className="flex flex-col md:flex-row md:items-baseline md:gap-x-2">
                                  <span className={`font-semibold ${themeColors.primary ?? 'text-blue-600'} md:w-44 flex-shrink-0 mb-0.5 md:mb-0 break-words`}>{highlight.label}:</span> {/* Reduced mb-1 */}
                                  <span className={`${themeColors.textColorSecondary ?? ''} flex-grow`}>{highlight.value}</span>
                              </div>
                          ))}
                      </div>
                   </div>
                   <div>
                      <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ''} mb-3`}>Research Grants</h3> {/* Reduced mb-4 */}
                      {/* Reduced internal gap */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"> {/* Reduced gap-y-3 */}
                          {researchGrants.map((grant, index) => (
                              <div key={index} className="flex flex-col md:flex-row md:items-baseline md:gap-x-2">
                                  <span className={`font-semibold ${themeColors.primary ?? 'text-blue-600'} md:w-44 flex-shrink-0 mb-0.5 md:mb-0 break-words`}>{grant.label}:</span> {/* Reduced mb-1 */}
                                  <span className={`${themeColors.textColorSecondary ?? ''} flex-grow`}>{grant.value}</span>
                              </div>
                          ))}
                      </div>
                   </div>
                   <div className="mt-4"> {/* Reduced mt-6 */}
                      <details className={`${themeColors.textColorSecondary ?? ''}`}>
                          <summary className={`cursor-pointer font-medium ${themeColors.linkColor ?? 'text-blue-600'} hover:underline text-sm md:text-base`}>View all awards and honors</summary>
                          {/* Reduced internal gap */}
                           <div className={`mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-4 border-l-2 ${themeColors.borderLight ?? 'border-gray-300'} text-xs sm:text-sm`}> {/* Reduced mt-4, gap-x-8, gap-y-3 */}
                              {detailedAwards.map((item, index) => <div key={index}>{item}</div>)}
                           </div>
                      </details>
                   </div>
              </div>
          </section>

        </div> {/* 内容板块容器结束 */}
      </div> {/* 主要内容区域结束 */}
    </div> // 页面最外层容器结束
  );
}