// src/components/layout/Navbar.tsx
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { themeColors } from "@/styles/theme";

// 定义导航项类型 (可选，但推荐)
interface NavItem {
  name: string;
  href: string;
}

const Navbar: React.FC = () => {
  const navItems: NavItem[] = [
    { name: "Lab Leader", href: "/lab_leader" },
    { name: "Lab Members", href: "/members" },
    { name: "Publications", href: "/publications" },
    { name: "Lab Photo Gallery", href: "/gallery" },
    //{ name: 'Lab Blog', href: '/blog' },
    { name: "For Students", href: "/students" },
    { name: "Contact", href: "/contact" },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      className={`${themeColors.navBackground} shadow-sm sticky top-0 z-50 w-full`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧 Logo - 使用 Link 组件 */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className={`text-xl sm:text-2xl font-semibold ${themeColors.navTextColor} hover:[text-shadow:0_1px_2px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out`}
            >
              Good Home
            </Link>
          </div>

          {/* 右侧导航链接 - 桌面 - 使用 Link 组件并应用激活样式 */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium 
                    ${
                      isActive
                        ? `${themeColors.navActiveBorder} ${themeColors.navActiveText}`
                        : `border-transparent ${themeColors.navTextColor} hover:${themeColors.navHoverBorder} hover:${themeColors.navHoverText}`
                    }
                    hover:[text-shadow:0_1px_2px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* 移动端汉堡菜单按钮 */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${themeColors.navTextColor} hover:${themeColors.navHoverText}`}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>

          {/* 移动端菜单 - 展开时显示 - 使用 Link 组件并应用激活样式 (简化版，只改变文字颜色) */}
          {isMenuOpen && (
            <div className="sm:hidden absolute top-16 left-0 w-full bg-white shadow-md">
              <ul className="flex flex-col space-y-2 p-4">
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          block px-3 py-2 text-sm 
                          ${
                            isActive
                              ? `${themeColors.navActiveText} font-semibold`
                              : `${themeColors.navTextColor} hover:${themeColors.navHoverText}`
                          }
                          hover:[text-shadow:0_1px_2px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out
                        `}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
