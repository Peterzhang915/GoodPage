import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Keep Image import if potentially used for author avatars later
import { BookOpen, Link as LinkIcon, FileText as FileIcon, Calendar, Users } from 'lucide-react';
import { themeColors } from '@/styles/theme';
import type { PublicationInfo, AuthorInfo } from '@/lib/types';
// Ensure Member type is available if AuthorInfo relies on it, or adjust AuthorInfo type if needed
// import type { Member } from '@/lib/prisma';

/**
 * Type definition for the props of the PublicationItem component.
 */
type PublicationItemProps = {
  /** The publication data object containing title, authors, venue, etc. */
  pub: PublicationInfo;
};

/**
 * PublicationItem Component
 *
 * Renders a single publication entry with its details, including title, authors,
 * venue, year, and links to DOI and PDF (if available).
 * Authors are linked to their member pages.
 */
const PublicationItem: React.FC<PublicationItemProps> = ({ pub }) => {
  const pdfHref = pub.pdf_url
    ? pub.pdf_url.startsWith('http') ? pub.pdf_url : `/pdfs/${pub.pdf_url}`
    : undefined;

  // Use pub.id, doi_url, or title as a fallback key
  const itemKey = pub.id ?? pub.doi_url ?? pub.title;

  return (
    <li key={itemKey} className={`rounded-lg border ${themeColors.borderLight ?? 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 shadow-md p-4 md:p-5 space-y-1.5 transition-shadow hover:shadow-lg mb-3`}>
      <h3 className={`text-base md:text-lg font-semibold ${themeColors.textColorPrimary ?? 'dark:text-gray-100'} mb-1 leading-normal flex items-start gap-x-2`}>
        <BookOpen className={`w-5 h-5 mt-0.5 ${themeColors.primary ?? 'text-blue-600'} flex-shrink-0`} />
        <span className="flex-grow">{pub.title}</span>
      </h3>
      {pub.authors && pub.authors.length > 0 && (
        <div className={`text-sm ${themeColors.textColorSecondary ?? ''} mb-1 pl-7 flex items-center flex-wrap gap-x-1.5 gap-y-1`}>
          <Users className={`w-4 h-4 mr-1 ${themeColors.textColorTertiary ?? 'text-gray-500'} flex-shrink-0`} />
          {pub.authors.map((author: AuthorInfo, index: number) => (
            // Use author.id or index as key if author.id might be missing
            <span key={author.id ?? index} className="inline-block">
              {/* Only link if author.id exists */}
              {author.id ? (
                 <Link href={`/members/${author.id}`} className={`${themeColors.linkColor ?? 'text-blue-600'} hover:underline`}>
                    {author.name_en || author.name_zh || 'Unknown Author'}
                 </Link>
               ) : (
                 <span>{author.name_en || author.name_zh || 'Unknown Author'}</span>
               )}
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
};

export default PublicationItem;
