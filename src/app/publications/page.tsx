import { getAllPublications, Publication } from '@/lib/db';
import Link from 'next/link';
// 恢复之前的图标导入或移除
import { BookOpen, Link as LinkIcon, FileText, Calendar, Users } from 'lucide-react';

// 恢复之前的单个论文条目组件
function PublicationItem({ pub }: { pub: Publication }) {
  return (
    // 恢复之前的样式
    <li id={`pub-${pub.id}`} className="mb-8 p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 scroll-mt-20"> 
      <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-tight flex items-start">
        <BookOpen className="w-5 h-5 mr-2 mt-0.5 text-indigo-500 flex-shrink-0" />
        <span>{pub.title}</span>
      </h3>
      {pub.authors && pub.authors.length > 0 && (
        <div className="text-sm text-gray-600 mb-2 flex items-center flex-wrap gap-x-1">
          <Users className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
          {pub.authors.map((author, index) => (
            <span key={author.id}>
              <Link href={`/members/${author.id}`} className="text-blue-600 hover:underline hover:text-blue-800 transition-colors">
                {author.name_zh}
              </Link>
              {index < pub.authors!.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>
      )}
      <div className="text-sm text-gray-500 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {pub.venue && (
          <span className="flex items-center">
            <span className="font-medium mr-1">Venue:</span> {pub.venue}
          </span>
        )}
        {pub.year && (
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" /> {pub.year}
          </span>
        )}
        {pub.ccf_rank && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pub.ccf_rank === 'A' ? 'bg-red-100 text-red-700' : pub.ccf_rank === 'B' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
            CCF {pub.ccf_rank}
          </span>
        )}
      </div>
      {pub.abstract && (
         <details className="text-sm text-gray-600 mt-3 group">
             <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium list-none group-open:mb-2">Show Abstract</summary>
             <p className="italic text-gray-500 border-l-2 border-indigo-100 pl-3">{pub.abstract}</p>
         </details>
      )}
      {pub.keywords && (
         <div className="mt-3 text-xs text-gray-500">
             <span className="font-medium mr-1">Keywords:</span> {pub.keywords}
         </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {pub.doi_url && (
          <a href={`https://doi.org/${pub.doi_url}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
            <LinkIcon className="w-4 h-4 mr-1" /> DOI
          </a>
        )}
        {pub.pdf_url && (
          <a href={pub.pdf_url.startsWith('http') ? pub.pdf_url : pub.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-green-600 hover:text-green-800 transition-colors font-medium">
            <FileText className="w-4 h-4 mr-1" /> PDF
          </a>
        )}
      </div>
    </li>
  );
}

// 恢复为服务器端组件
export default async function PublicationsPage() {
  const publications = await getAllPublications();

  // 恢复之前的按年份分组逻辑
  const groupedPublications: Record<string, Publication[]> = {};
  publications.forEach(pub => {
    const year = pub.year.toString();
    if (!groupedPublications[year]) {
      groupedPublications[year] = [];
    }
    groupedPublications[year].push(pub);
  });

  const sortedYears = Object.keys(groupedPublications).sort((a, b) => parseInt(b) - parseInt(a)); // 年份降序

  return (
    // 恢复之前的布局和样式
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-16">Publications</h1>
      
      {/* 移除搜索和排序控件 */} 

      {publications.length > 0 ? (
        sortedYears.map(year => (
          <section key={year} className="mb-16">
            {/* 恢复之前的年份标题样式 */}
            <h2 className="text-3xl font-semibold text-gray-700 border-b border-gray-300 pb-3 mb-8">{year}</h2>
            <ul className="list-none p-0">
              {groupedPublications[year].map((pub) => (
                <PublicationItem key={pub.id} pub={pub} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className="text-center text-gray-500 text-lg">No publications found.</p>
      )}
    </div>
  );
} 