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
// 导入需要的图标
import { Github, ExternalLink, Linkedin } from 'lucide-react';
import { themeColors } from '@/styles/theme';

// Props 类型
interface MemberPageProps {
  params: {
    memberId: string;
  }
}

// 成员详情页论文条目 (简化)
function MemberPublicationItem({ pub }: { pub: Publication }) {
  return (
    <li className={`mb-4 pb-4 border-b ${themeColors.footerBorder} last:border-b-0`}>
      <h4 className={`text-md font-semibold ${themeColors.textColorPrimary} mb-1`}>{pub.title}</h4>
      <div className={`text-xs ${themeColors.textColorTertiary}`}>
        {pub.venue && <span className="mr-2">{pub.venue}</span>}
        {pub.year && <span className="mr-2">({pub.year})</span>}
        {pub.ccf_rank && <span className={`mr-2 ${pub.ccf_rank === 'A' ? themeColors.ccfAText : pub.ccf_rank === 'B' ? themeColors.ccfBText : pub.ccf_rank === 'C' ? themeColors.ccfCText : themeColors.textColorPrimary}`}>CCF: <span className="font-medium">{pub.ccf_rank}</span></span>}
      </div>
      <div className="flex space-x-3 text-xs mt-1">
        {pub.doi_url && (
          <a href={`https://doi.org/${pub.doi_url}`} target="_blank" rel="noopener noreferrer" className={`${themeColors.linkColor} hover:underline`}>DOI</a>
        )}
        {pub.pdf_url && (
          <a href={pub.pdf_url.startsWith('http') ? pub.pdf_url : pub.pdf_url} target="_blank" rel="noopener noreferrer" className={`${themeColors.primary} hover:underline`}>PDF</a>
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
    <div className={`max-w-4xl mx-auto ${themeColors.navBackground} shadow-lg rounded-lg overflow-hidden`}>
      <div className="md:flex">
        <div className={`md:w-1/3 p-6 bg-gradient-to-br ${themeColors.backgroundLight} to-${themeColors.ccfBBg} flex flex-col items-center justify-start text-center`}>
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${themeColors.footerBorder} shadow-md mb-4 flex-shrink-0`}>
            <MemberProfileImage
              src={member.avatar_url}
              alt={`${member.name_zh} 头像`}
              width={128}
              height={128}
            />
          </div>
          <h1 className={`text-2xl font-bold ${themeColors.textColorPrimary}`}>{member.name_zh}</h1>
          {member.name_en && <p className={`text-md ${themeColors.textColorSecondary} mb-1`}>{member.name_en}</p>}
          <p className={`text-sm font-semibold ${themeColors.textColorPrimary} mb-2`}>{displayStatus}</p>
          {member.email && (
            <a href={`mailto:${member.email}`} className={`text-sm ${themeColors.linkColor} hover:underline break-all mb-3 block`}>
              {member.email}
            </a>
          )}
          
          {/* 新增：显示社交链接图标 */}
          <div className="flex justify-center items-center space-x-4 mt-2">
            {member.github_url && (
              <a href={member.github_url} target="_blank" rel="noopener noreferrer" title="GitHub Profile" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}>
                <Github size={20} />
              </a>
            )}
            {member.blog_url && (
              <a href={member.blog_url} target="_blank" rel="noopener noreferrer" title="Personal Blog/Website" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}>
                <ExternalLink size={20} />
              </a>
            )}
            {member.linkedin_url && (
              <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn Profile" className={`${themeColors.textColorSecondary} hover:${themeColors.textColorPrimary} transition-colors`}>
                <Linkedin size={20} />
              </a>
            )}
          </div>
        </div>

        <div className="md:w-2/3 p-6">
          {(member.bio_zh || member.bio_en) && (
            <section className="mb-6">
              <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b pb-2 mb-3`}>个人简介</h2>
              {member.bio_zh && <p className={`${themeColors.textColorSecondary} mb-2 text-sm`}>{member.bio_zh}</p>}
              {member.bio_en && <p className={`${themeColors.textColorTertiary} italic text-sm`}>{member.bio_en}</p>}
            </section>
          )}

          {member.research_interests && (
            <section className="mb-6">
              <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b pb-2 mb-3`}>研究兴趣</h2>
              <div className="flex flex-wrap gap-2">
                {member.research_interests.split(',').map((interest: string) => interest.trim()).filter(Boolean).map((interest: string, index: number) => (
                  <span key={index} className={`${themeColors.ccfBBg} ${themeColors.ccfAText} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                    {interest}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* 只有当 publications 数组不为空时才渲染整个 section */}
          {publications.length > 0 && (
            <section>
              <h2 className={`text-xl font-semibold ${themeColors.textColorPrimary} border-b pb-2 mb-3`}>发表成果</h2>
              <ul className="list-none p-0 mt-2 space-y-2">
                {publications.map((pub) => (
                  <MemberPublicationItem key={pub.id} pub={pub} />
                ))}
              </ul>
            </section>
          )}
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