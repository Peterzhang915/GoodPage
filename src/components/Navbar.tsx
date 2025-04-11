import PublicationsPage from '@/app/publications/page';
import React from 'react';
import { themeColors } from '@/styles/theme';

// 定义导航项类型 (可选，但推荐)
interface NavItem {
  name: string;
  href: string;
}

const Navbar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: 'Professor Zichen Xu', href: '/xuz' },
    { name: 'Lab Members', href: '/members' },
    { name: 'Publications', href: '/publications' },
    { name: 'Lab Photo Gallery', href: '/gallery' },
    { name: 'Lab Blog', href: '/blog' },
    { name: 'For Students', href: '/students' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={`${themeColors.navBackground} shadow-sm sticky top-0 z-50 w-full`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧 Logo 或标题 - 修改链接 */}
          <div className="flex-shrink-0">
            <a href="/" className={`${themeColors.navTextColor} text-xl font-semibold`}>
              Good HomePage
            </a>
          </div>

          {/* 右侧导航链接 - 桌面 */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium ${themeColors.navTextColor} hover:${themeColors.navHoverBorder} hover:${themeColors.navHoverText}`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* 移动端菜单按钮等可以后续在此添加 */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 