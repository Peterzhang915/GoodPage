import Link from 'next/link';
import Image from 'next/image';
import { themeColors } from '../../styles/theme'; // 确认 themeColors 提供有效的 Tailwind 类
import { getAllPublications, Publication } from '@/lib/db'; // 确认 Publication 类型
import { BookOpen } from 'lucide-react';

// 教授页面组件 - async 用于获取数据
export default async function ProfessorPage() {
  // 获取所有出版物数据
  const publications = await getAllPublications();
  // 筛选 CCF A 类出版物 (筛选逻辑保留，但不在界面显示)
  const ccfAPubs: Publication[] = publications.filter((pub: Publication) => pub.ccf_rank === 'A');

  // 定义服务和奖项的数据结构 (示例)
  const academicServices = [
    { label: 'Artifact Chair', value: 'APPT 2025' },
    { label: 'Local Chair', value: 'SiftDB 2025' },
    { label: 'PC', value: 'SenSys 2024' },
    { label: 'Publicity Chair', value: 'CCFSys 2024' },
    { label: 'Org. Committee', value: 'CCF Computility 2024, CCF Chips 2024' },
    { label: 'Program Chair', value: 'GreenCom 2022' },
    { label: 'Guest Editor', value: 'IEEE Trans. on Sustainable Computing' },
    { label: 'Local Chair/PC', value: 'CCFsys 2022' },
    { label: 'PC Member', value: 'CCFsys 2020, CCFChips 2021' },
    { label: '评审专家', value: '教育部学位中心, 2020-2025' },
  ];

  const detailedServices = [
    'PC, SoCC, 2022', 'PC, SSDBM, 2022', 'PC, NDBC, 2021, 2022',
    'PC, ICPADS, 2021, 2022', 'Track Chair, IEEE BigData, 2021', 'Publicity Chair, SSDBM, 2021',
    'PC, HPCChina, 2021', 'PC, ACM SIGCSE 2020, 2021', 'Publicity Chair, ICAC 2019, 2020, 2021',
    'PC, ICAC 2015, 2017, 2019, 2020, 2021', 'Chair, CTC China Workshop 2020', 'Workshop Chair, ACA 2020',
    'PC, ACM TUR-C 2020', 'PC, HPBD&IS 2020', 'PC, NAS 2019', 'Publicity Chair, IWQoS 2016',
    'Session Chair, INFOCOM 2016', 'Session Chair, ICDCS 2015', 'PC, ICDCS 2013, 2020',
  ];

  const recentHighlights = [
    { label: 'Provincial Tech. Award', value: 'First Awardee, JiangXi, 2024' },
    { label: 'National R/D Project', value: 'Co-PI, Ministry of Science, 2023-2025' },
  ];

  const researchGrants = [
    { label: 'Provincial R/D Project', value: 'PI, Dept. of Tech JiangXi, 2022-2024' },
    { label: 'Cambodian Funding', value: 'Principal Investigator, 2021' },
    { label: 'National R/D Project', value: 'Co-PI, Min. of Science, 2019-2022' },
    { label: 'NSFC Youth Grant', value: 'PI, NSFC, 2018-2020' },
  ];

  const detailedAwards = [
    'Education Major Grant, Dept. of Edu. JiangXi, 2019-2021', 'National KHF Key Project, Min. of Science, 2018-2020',
    'Jiangxi Thousand Young Talents, 2018', 'Tencent Rhino Bird Grant, Tencent, 2017-2018',
    'AWS Research Education Grant, Amazon, 2015-2017', 'Microsoft Azure Research Grant, Microsoft, 2017-2018',
    'Finalist in Edward F. Hayes Forum, OSU, 2015', 'Student Travel Grant, USENIX Association, 2013',
    'USF Student Challenge Grant, USF, 2010-2011', 'Best Paper Award, Florida Emerging Paradigms, 2010',
    'Student Travel Grant, SIGMOD, 2010', 'Conference Presentation Grant, USF, 2010',
    'Best Research Poster Award, USF, 2009', 'Best Undergraduate Thesis, BUPT, 2007',
    'Finalist in WESC, Microsoft, 2006', 'Honored Graduate, BUPT, 2007 (Top 8%)',
  ];


  return (
    // 页面最外层容器
    <div className={`${themeColors.themePageBg} min-h-screen`}>

      {/* 顶部标题栏区域 (保持不变) */}
      <div className={`${themeColors.primaryBg} ${themeColors.textGrayWhite} py-12 md:py-16 lg:py-20`}>
        {/* ... header content ... */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12">
            <div className="md:pr-10 mb-6 md:mb-0 flex-grow">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">Dr. Zichen Xu (徐子晨)</h1>
              <p className={`text-lg sm:text-xl lg:text-2xl mb-6`}>
                Vice Dean, School of Mathematics and Computer Science<br />
                The Nanchang University
              </p>
              <div className={`space-y-1 text-sm sm:text-base`}>
                <span className="block">Email: <a href="mailto:xuz@ncu.edu.cn" className="hover:underline">xuz@ncu.edu.cn</a></span>
                <span className="block">Office telephone: (0791) 8396 8516</span>
                <span className="block">999 Xuefu BLVD</span>
                <span className="block">Nanchang, Jiangxi, 330000</span>
              </div>
            </div>
            <div className={`w-48 h-56 md:w-52 md:h-60 ${themeColors.backgroundLight} overflow-hidden rounded-md flex-shrink-0 border-4 ${themeColors.primaryBorderColor ?? 'border-white'} shadow-lg`}>
              <Image
                src="/avatars/zichenxu.jpg"
                alt="Dr. Zichen Xu"
                width={208}
                height={240}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        {/* 各内容板块容器 */}
        <div className="flex flex-col space-y-16 md:space-y-20">

          {/* 研究兴趣 (Research Interests) 板块 (保持不变) */}
          <section id="interests">
             {/* ... interests content ... */}
             <h2 className={`text-2xl md:text-3xl font-bold border-b pb-3 mb-6 md:mb-8 ${themeColors.borderColor ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Research Interests</h2>
            <div className={`text-sm md:text-base leading-relaxed ${themeColors.textColorSecondary ?? ''}`}>
              <p>
                My research interests are primarily in the area of computing system design in the development of providing sustainable data services in any system. A common thread in my research is in understanding and rebuilding the traditional computing systems to meet the new design goals, such as sustainability, and constraints, like resource limitation, reliability, and scalability. Broadly speaking, I am a system researcher with a focus on (the design and implementation of) generic optimal and operational data-oriented (GOOD) computing systems.
              </p>
            </div>
          </section>

          {/* 出版物 (Publications) 板块 (保持不变) */}
          <section id="publications">
             {/* ... publications content ... */}
              <h2 className={`text-2xl md:text-3xl font-bold border-b pb-3 mb-6 md:mb-8 ${themeColors.borderColor ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Selected Publications</h2>
            {ccfAPubs.length > 0 ? (
              <ul className="list-none p-0 space-y-6">
                {ccfAPubs.map((pub: Publication) => (
                  <li key={pub.id} className={`rounded-lg border ${themeColors.borderColor ?? 'border-gray-200'} p-4 md:p-6 space-y-2 transition-shadow hover:shadow-md`}>
                    <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ''} mb-1 leading-normal flex items-start`}>
                      <BookOpen className={`w-5 h-5 mr-2 mt-0.5 ${themeColors.primary ?? 'text-blue-600'} flex-shrink-0`} />
                      <span className="flex-grow">{pub.title}</span>
                    </h3>
                    {pub.authors && pub.authors?.length > 0 && (
                      <div className={`text-xs sm:text-sm ${themeColors.textColorSecondary ?? ''} mb-1 pl-7 flex items-center flex-wrap gap-x-1`}>
                        {pub.authors?.map((author, index, authors) => (
                          <span key={author.id}>
                            <Link href={`/members/${author.id}`} className={`${themeColors.linkColor ?? 'text-blue-600'} hover:underline`}>
                              {author.name_zh}
                            </Link>
                            {index < authors.length - 1 ? <span className="mr-1">,</span> : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className={`text-xs sm:text-sm ${themeColors.textColorTertiary ?? 'text-gray-500'} pl-7 flex flex-wrap items-center gap-x-4 gap-y-1`}>
                      {pub.venue && <span>{pub.venue}</span>}
                      {pub.year && <span className="font-mono">{pub.year}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`text-sm md:text-base ${themeColors.textColorTertiary ?? 'text-gray-500'}`}>No selected publications found.</p>
            )}
          </section>

          {/* 学术服务 (Academic Services) 板块 */}
          <section id="services">
             <h2 className={`text-2xl md:text-3xl font-bold border-b pb-3 mb-6 md:mb-8 ${themeColors.borderColor ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Academic Services</h2>
             {/* 服务列表容器: 响应式网格布局 */}
             <div className={`mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm md:text-base ${themeColors.textColorSecondary ?? ''}`}> {/* 减小 gap-y */}
               {/* 循环渲染服务项 */}
               {academicServices.map((service, index) => (
                 // 修改: 每个服务项使用 div + flex 布局
                 // 在 md 及以上屏幕，给标签设置固定宽度以对齐值
                 <div key={index} className="flex flex-col md:flex-row md:items-baseline md:gap-x-2">
                   {/* 服务标签 (span): 在 md 及以上有固定宽度 (w-36)，允许换行 */}
                   <span className={`font-semibold ${themeColors.primary ?? 'text-blue-600'} md:w-36 flex-shrink-0 mb-1 md:mb-0 break-words`}>
                     {service.label}:
                   </span>
                   {/* 服务值 (span): 占据剩余空间 */}
                   <span className={`${themeColors.textColorSecondary ?? ''} flex-grow`}>
                     {service.value}
                   </span>
                 </div>
               ))}
             </div>
             {/* 查看更多部分 (保持不变) */}
             <div className="mt-6">
                {/* ... details/summary content ... */}
                <details className={`${themeColors.textColorSecondary ?? ''}`}>
                 <summary className={`cursor-pointer font-medium ${themeColors.linkColor ?? 'text-blue-600'} hover:underline text-sm md:text-base`}>View all academic services</summary>
                 <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pl-4 border-l-2 ${themeColors.borderColor ?? 'border-gray-300'} text-xs sm:text-sm`}>
                   {detailedServices.map((item, index) => <div key={index}>{item}</div>)}
                 </div>
               </details>
             </div>
          </section>

          {/* 奖项与荣誉 (Awards and Honors) 板块 */}
          <section id="awards">
            <h2 className={`text-2xl md:text-3xl font-bold border-b pb-3 mb-6 md:mb-8 ${themeColors.borderColor ?? 'border-gray-300'} ${themeColors.textColorPrimary ?? ''}`}>Awards and Honors</h2>
            {/* 使用 space-y 来分隔子区域 */}
            <div className={`mt-5 space-y-10 md:space-y-12 text-sm md:text-base ${themeColors.textColorSecondary ?? ''}`}>
              {/* 近期亮点子区域 */}
              <div>
                <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ''} mb-4`}>Recent Highlights</h3>
                {/* 奖项列表: 响应式网格布局 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"> {/* 减小 gap-y */}
                  {/* 循环渲染近期亮点 */}
                  {recentHighlights.map((highlight, index) => (
                    // 修改: 每个奖项使用 div + flex 布局
                    <div key={index} className="flex flex-col md:flex-row md:items-baseline md:gap-x-2">
                      {/* 奖项标签 (span): 在 md 及以上有固定宽度 (w-44) */}
                      <span className={`font-semibold ${themeColors.primary ?? 'text-blue-600'} md:w-44 flex-shrink-0 mb-1 md:mb-0 break-words`}>
                        {highlight.label}:
                      </span>
                      {/* 奖项值 (span) */}
                      <span className={`${themeColors.textColorSecondary ?? ''} flex-grow`}>
                        {highlight.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 科研经费子区域 */}
              <div>
                <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? ''} mb-4`}>Research Grants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3"> {/* 减小 gap-y */}
                  {/* 循环渲染科研经费 */}
                  {researchGrants.map((grant, index) => (
                     // 修改: 每个经费项使用 div + flex 布局
                     <div key={index} className="flex flex-col md:flex-row md:items-baseline md:gap-x-2">
                       {/* 经费标签 (span): 在 md 及以上有固定宽度 (w-44) */}
                       <span className={`font-semibold ${themeColors.primary ?? 'text-blue-600'} md:w-44 flex-shrink-0 mb-1 md:mb-0 break-words`}>
                         {grant.label}:
                       </span>
                       {/* 经费值 (span) */}
                       <span className={`${themeColors.textColorSecondary ?? ''} flex-grow`}>
                         {grant.value}
                       </span>
                     </div>
                  ))}
                </div>
              </div>

              {/* 查看所有奖项 (保持不变) */}
              <div className="mt-6">
                {/* ... details/summary content ... */}
                 <details className={`${themeColors.textColorSecondary ?? ''}`}>
                  <summary className={`cursor-pointer font-medium ${themeColors.linkColor ?? 'text-blue-600'} hover:underline text-sm md:text-base`}>View all awards and honors</summary>
                  <div className={`mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pl-4 border-l-2 ${themeColors.borderColor ?? 'border-gray-300'} text-xs sm:text-sm`}>
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