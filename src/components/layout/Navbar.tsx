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
  //   const professorNavItems: NavItem[] = [
  //     { name: "Dr. Jiahui Hu", href: "/professor/JiahuiHu" },
  //   ];

  const navItems: NavItem[] = [
    { name: "Lab Chair", href: "/lab_chair" },
    // ... 其他教授
    // ...professorNavItems, // 列出其他教授
    { name: "Lab Members", href: "/members" },
    { name: "Publications", href: "/publications" },
    { name: "Lab Photo Gallery", href: "/gallery" },
    //{ name: 'Lab Blog', href: '/blog' },
    { name: "For Students", href: "/students" },
    { name: "Contact", href: "/contact" },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  // Check if the current path starts with /developer
  const isDeveloperPath = pathname.startsWith("/developer");

  // Determine background color based on path
  const navbarBgClass = isDeveloperPath
    ? themeColors.devCardBg // Use developer dark background
    : themeColors.navBackground; // Use default navbar background (bg-white)

  // Determine text color based on path (adjust if needed for contrast)
  const navbarTextClass = isDeveloperPath
    ? themeColors.devText // Use developer light text (text-gray-200)
    : themeColors.navTextColor; // Use default navbar text (text-gray-800)

  // Determine hover/active colors based on path
  const navHoverTextClass = isDeveloperPath
    ? "text-gray-100" // Lighter hover for dark background
    : themeColors.navHoverText;
  const navHoverBorderClass = isDeveloperPath
    ? "border-gray-500" // More visible border for dark background
    : themeColors.navHoverBorder;
  const navActiveTextClass = isDeveloperPath
    ? "text-white font-semibold" // White and bold for active on dark background
    : themeColors.navActiveText;
  const navActiveBorderClass = isDeveloperPath
    ? "border-green-400" // Use dev title color for active border on dark
    : themeColors.navActiveBorder;
  // Determine logo text color
  const logoTextClass = isDeveloperPath
    ? themeColors.devTitleText // Use dev title color (green-400) for logo on dark
    : themeColors.navTextColor;
  // Determine mobile menu button color
  const mobileMenuButtonClass = isDeveloperPath
    ? themeColors.devText // Light text for button on dark
    : themeColors.navTextColor;
  // Determine mobile menu background
  const mobileMenuBgClass = isDeveloperPath
    ? themeColors.devCardBg // Dark background for mobile menu
    : "bg-white";
  // Determine border for developer mode
  const devBorderClass = isDeveloperPath
    ? `border-b ${themeColors.devBorder}`
    : ""; // e.g., border-b border-gray-700

  return (
    <nav
      className={`${navbarBgClass} ${devBorderClass} shadow-sm sticky top-0 z-50 w-full transition-colors duration-300 ease-in-out`} // Apply dynamic background and transition
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className={`text-xl sm:text-2xl font-semibold ${logoTextClass} hover:[text-shadow:0_1px_2px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out`}
            >
              Good Home
            </Link>
          </div>

          {/* Desktop Nav Links */}
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
                        ? `${navActiveBorderClass} ${navActiveTextClass}`
                        : `border-transparent ${navbarTextClass} hover:${navHoverBorderClass} hover:${navHoverTextClass}`
                    }
                    hover:[text-shadow:0_1px_2px_rgba(0,0,0,0.15)] transition-all duration-200 ease-in-out
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md ${mobileMenuButtonClass} hover:${navHoverTextClass}`}
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div
              className={`sm:hidden absolute top-16 left-0 w-full ${mobileMenuBgClass} shadow-md`}
            >
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
                              ? `${navActiveTextClass}` // Use updated active class
                              : `${navbarTextClass} hover:${navHoverTextClass}` // Use updated base and hover text
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
