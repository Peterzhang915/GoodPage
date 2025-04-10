import {
  getMemberById,
  getPublicationsByMemberId,
  Member,
  Publication,
  calculateMemberGradeStatus
} from '@/lib/db';
import { notFound } from 'next/navigation';
import { MemberProfileImage } from '@/components/MemberProfileImage';
import Link from 'next/link';

// Props 类型
interface MemberPageProps {
  params: {
    memberId: string;
  }
}

// 成员详情页论文条目 (简化)
function MemberPublicationItem({ pub }: { pub: Publication }) {
  return (
    <li className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
      <h4 className="text-md font-semibold text-gray-700 mb-1">{pub.title}</h4>
      <div className="text-xs text-gray-500">
        {pub.venue && <span className="mr-2">{pub.venue}</span>}
        {pub.year && <span className="mr-2">({pub.year})</span>}
        {pub.ccf_rank && <span className="mr-2">CCF: <span className="font-medium text-red-500">{pub.ccf_rank}</span></span>}
      </div>
      <div className="flex space-x-3 text-xs mt-1">
        {pub.doi_url && (
          <a href={`https://doi.org/${pub.doi_url}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">DOI</a>
        )}
        {pub.pdf_url && (
          <a href={pub.pdf_url.startsWith('http') ? pub.pdf_url : pub.pdf_url} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">[PDF]</a>
        )}
      </div>
    </li>
  );
}

export default async function MemberProfilePage({ params }: MemberPageProps) {
  const { memberId } = params;
  const [member, publications] = await Promise.all([
    getMemberById(memberId),
    getPublicationsByMemberId(memberId)
  ]);

  if (!member) {
    notFound();
  }

  const displayStatus = calculateMemberGradeStatus(member);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-start text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 flex-shrink-0">
            <MemberProfileImage
              src={member.avatar_url}
              alt={`${member.name_zh} 头像`}
              width={128}
              height={128}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{member.name_zh}</h1>
          {member.name_en && <p className="text-md text-gray-600 mb-1">{member.name_en}</p>}
          <p className="text-sm font-semibold text-indigo-600 mb-2">{displayStatus}</p>
          {member.email && (
            <a href={`mailto:${member.email}`} className="text-sm text-blue-600 hover:underline break-all">
              {member.email}
            </a>
          )}
        </div>

        <div className="md:w-2/3 p-6">
          {(member.bio_zh || member.bio_en) && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">个人简介</h2>
              {member.bio_zh && <p className="text-gray-600 mb-2 text-sm">{member.bio_zh}</p>}
              {member.bio_en && <p className="text-gray-500 italic text-sm">{member.bio_en}</p>}
            </section>
          )}

          {member.research_interests && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">研究兴趣</h2>
              <div className="flex flex-wrap gap-2">
                {member.research_interests.split(',').map((interest: string) => interest.trim()).filter(Boolean).map((interest: string, index: number) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-3">发表成果</h2>
            {publications.length > 0 ? (
              <ul className="list-none p-0 mt-2 space-y-2"> 
                {publications.map((pub) => (
                  <MemberPublicationItem key={pub.id} pub={pub} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 mt-2">暂无发表成果。</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// (可选) 预构建静态页面
// export async function generateStaticParams() {
//   const members = await getAllMembers(); // 从数据库获取所有成员 ID
//   return members.map(member => ({ memberId: member.id }));
// } 