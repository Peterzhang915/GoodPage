import React from 'react';
import { themeColors } from '@/styles/theme';
import { Book, Video, FileText, Link as LucideLink } from 'lucide-react';

const StudentsPage: React.FC = () => {
  return (
    <div className={`${themeColors.backgroundWhite} pt-12 p-4 min-h-screen flex flex-col items-center shadow-lg rounded-lg bg-opacity-90`}>
      <h1 className={`text-4xl font-bold text-center ${themeColors.textColorPrimary} mb-16`}>For Students</h1>
      <ul className={`${themeColors.textColorSecondary} list-disc list-inside space-y-6`}>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <Book className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='/MUST_READ_IN_GOOD.pdf' className={`${themeColors.linkColor} hover:underline`}>GOOD Lab member MUST read</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Zichen Xu, NCU</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='http://www.cs.cmu.edu/~harchol/gradschooltalk.pdf' className={`${themeColors.linkColor} hover:underline`}>Do I really want a Ph.D.?</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Mor Harchol-Balter, CMU</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://cacm.acm.org/magazines/2017/7/218869-the-beginners-creed/fulltext' className={`${themeColors.linkColor} hover:underline`}>The Beginner&#39;s Creed</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Peter J. Denning, Naval Postgraduate School</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <Video className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://www.youtube.com/watch?v=a1zDuOPkMSw' className={`${themeColors.linkColor} hover:underline`}>You and Your Research [video]</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Dr. Richard Hamming</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='http://newslab.ece.ohio-state.edu/for students/resources/HighQualityPhDResearch.ppt' className={`${themeColors.linkColor} hover:underline`}>PhD Research: Elements of Excellence</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Ness B. Shroff, The Ohio State University</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <Video className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://www.youtube.com/watch?v=kBdfcR-8hEY&list=PL30C13C91CFFEFEA6' className={`${themeColors.linkColor} hover:underline`}>Justice: What&#39;s The Right Thing To Do?</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Sandel Michael J, Harvard University</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <Video className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://youtu.be/0lpwwOkSR-w' className={`${themeColors.linkColor} hover:underline`}>How to Succeed in Grad School</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Panel discussion at The Networking Channel</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://drive.google.com/file/d/0Bzis5MXW83vCdUdXYnFIVDVOSkE/view?resourcekey=0-z3gPdGk4ptNuguAM8e8liQ' className={`${themeColors.linkColor} hover:underline`}>How to Have a Bad Career In Research/Academia</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. David Patterson, UC Berkeley</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='http://www.comm.utoronto.ca/~dkundur/2010/04/managing-your-career-as-a-phd/' className={`${themeColors.linkColor} hover:underline`}>Managing Your Career as a PhD</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Deepa Kundur, University of Toronto</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://svr-sk818-web.cl.cam.ac.uk/keshav/wiki/index.php/HTRAP' className={`${themeColors.linkColor} hover:underline`}>How to Read a Paper</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Srinivasan Keshav, University of Cambridge</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://medium.com/digital-diplomacy/how-to-look-for-ideas-in-computer-science-research-7a3fa6f4696f' className={`${themeColors.linkColor} hover:underline`}>How to Look for Ideas in Computer Science Research</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Zhiyun Qian, University of California, Riverside</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='http://web.mit.edu/dimitrib/www/Ten_Rules.pdf' className={`${themeColors.linkColor} hover:underline`}>Ten Simple Rules for Mathematical Writing</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Dimitri Bertsekas, MIT</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='http://tex.loria.fr/typographie/mathwriting.pdf' className={`${themeColors.linkColor} hover:underline`}>Mathematical Writing</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Profs. Donald E. Knuth, Tracy Larrabee, and Paul M. Roberts</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://www.cs.cityu.edu.hk/~jia/research/the-art-of-presentation.pdf' className={`${themeColors.linkColor} hover:underline`}>The Art of Presentations</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Baochun Li, University of Toronto</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <Video className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://www.youtube.com/watch?v=ji5_MqicxSo' className={`${themeColors.linkColor} hover:underline`}>Last Lecture: Achieving Your Childhood Dreams</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Randy Pausch, CMU</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <Video className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://www.youtube.com/watch?v=oTugjssqOT0' className={`${themeColors.linkColor} hover:underline`}>Time Management</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Prof. Randy Pausch, CMU</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://mp.weixin.qq.com/s/Uh6K2eiUaSDZIGgNJkID5g' className={`${themeColors.linkColor} hover:underline`}>寒门子弟上名校之后</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - 郑雅君, 复旦大学</span>
        </li>
        <li className='hover:scale-105 transition-transform duration-200 bg-white p-6 rounded-md shadow-md flex items-center space-x-2'>
          <FileText className={`w-6 h-6 ${themeColors.accentColor}`} />
          <a href='https://www.brown.edu/academics/science-center/sites/brown.edu.academics.science-center/files/uploads/advancedLaTeX_0.pdf' className={`${themeColors.linkColor} hover:underline`}>Advanced LATEX</a>
          <span className={`${themeColors.textColorTertiary} text-sm ml-1`}> - Dan Parker and David Schwein</span>
        </li>
      </ul>
    </div>
  );
};

export default StudentsPage;