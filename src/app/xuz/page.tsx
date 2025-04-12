import Link from 'next/link';
import Image from 'next/image';

export default function ProfessorPage() {
  return (
    <div className="bg-theme-page min-h-screen">
      {/* 标题栏 */}
      <div className="bg-theme-header text-theme-light py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="md:pr-10 mb-6 md:mb-0">
              <h1 className="text-4xl font-serif font-bold mb-3">Dr. Zichen Xu (徐子晨)</h1>
              <p className="text-xl text-theme-light font-serif mb-4">
                Vice Dean, School of Mathematics and Computer Science<br />
                The Nanchang University
              </p>
              <p className="text-theme-light space-y-1">
                <span className="block">Email: <a href="mailto:xuz@ncu.edu.cn" className="hover:underline">xuz@ncu.edu.cn</a></span>
                <span className="block">Office telephone: (0791) 8396 8516</span>
                <span className="block">999 Xuefu BLVD</span>
                <span className="block">Nanchang, Jiangxi, 330000</span>
              </p>
            </div>
            <div className="md:w-52 h-60 bg-theme-header-light md:ml-4 overflow-hidden flex-shrink-0 border-4 border-theme-header-light">
              <Image 
                src="/professor.jpg" 
                alt="Dr. Zichen Xu" 
                width={208} 
                height={240} 
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-5xl mx-auto px-4 py-10 font-serif">
        <div className="prose max-w-none">
          {/* 研究兴趣 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold border-b border-theme-dark pb-2 text-theme-primary">Research Interests</h2>
            <div className="mt-5 text-theme-secondary leading-relaxed">
              <p>
                My research interests are primarily in the area of computing system design in the development of providing sustainable data services in any system. A common thread in my research is in understanding and rebuilding the traditional computing systems to meet the new design goals, such as sustainability, and constraints, like resource limitation, reliability, and scalability. Broadly speaking, I am a system researcher with a focus on (the design and implementation of) generic optimal and operational data-oriented (GOOD) computing systems.
              </p>
            </div>
          </section>

          {/* 出版物 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold border-b border-theme-dark pb-2 text-theme-primary">Selected Publications</h2>
            <p className="mt-5 text-theme-secondary">
              Please refer to <Link href="/publications" className="text-theme-primary font-medium hover:underline">GOOD Publications</Link> for complete list.
            </p>
            <div className="mt-5 space-y-5">
              <div className="border-l-4 border-theme-dark pl-4 py-1">
                <p className="font-medium text-theme-primary">Data-oriented Computing: A New Paradigm for Sustainable Computing</p>
                <p className="text-theme-muted text-sm">Z. Xu, Y. Wang, J. Liu</p>
                <p className="text-theme-muted italic">ACM Computing Surveys, 2023</p>
              </div>
              <div className="border-l-4 border-theme-dark pl-4 py-1">
                <p className="font-medium text-theme-primary">Resource Optimization in Edge Systems: A Case Study</p>
                <p className="text-theme-muted text-sm">Z. Xu, H. Li, P. Zhang</p>
                <p className="text-theme-muted italic">IEEE Transactions on Sustainable Computing, 2022</p>
              </div>
              <div className="border-l-4 border-theme-dark pl-4 py-1">
                <p className="font-medium text-theme-primary">Efficient Data Management for IoT Applications</p>
                <p className="text-theme-muted text-sm">Z. Xu, L. Chen, W. Wu</p>
                <p className="text-theme-muted italic">ICDE, 2022</p>
              </div>
            </div>
          </section>

          {/* 学术服务 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold border-b border-theme-dark pb-2 text-theme-primary">Academic Services</h2>
            <div className="mt-5 grid md:grid-cols-2 gap-x-8 gap-y-2 text-theme-secondary">
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Artifact Chair</span>
                <span>APPT 2025</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Local Chair</span>
                <span>SiftDB 2025</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">PC</span>
                <span>SenSys 2024</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Publicity Chair</span>
                <span>CCFSys 2024</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Org. Committee</span>
                <span>CCF Computility 2024</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Org. Committee</span>
                <span>CCF Chips 2024</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Program Chair</span>
                <span>GreenCom 2022</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Guest Editor</span>
                <span>IEEE Trans. on Sustainable Computing</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">Local Chair/PC</span>
                <span>CCFsys 2022</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">PC</span>
                <span>CCFsys 2020, CCFChips 2021</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-medium w-36 text-theme-primary">评审专家</span>
                <span>教育部学位中心, 2020-2025</span>
              </div>
            </div>
            <div className="mt-4">
              <details className="text-theme-secondary">
                <summary className="cursor-pointer font-medium text-theme-primary hover:underline">View all academic services</summary>
                <div className="mt-3 grid md:grid-cols-2 gap-x-8 gap-y-2 pl-4 border-l-2 border-theme-primary">
                  <div>PC, SoCC, 2022</div>
                  <div>PC, SSDBM, 2022</div>
                  <div>PC, NDBC, 2021, 2022</div>
                  <div>PC, ICPADS, 2021, 2022</div>
                  <div>Track Chair, IEEE BigData, 2021</div>
                  <div>Publicity Chair, SSDBM, 2021</div>
                  <div>PC, HPCChina, 2021</div>
                  <div>PC, ACM SIGCSE 2020, 2021</div>
                  <div>Publicity Chair, ICAC 2019, 2020, 2021</div>
                  <div>PC, ICAC 2015, 2017, 2019, 2020, 2021</div>
                  <div>Chair, CTC China Workshop 2020</div>
                  <div>Workshop Chair, ACA 2020</div>
                  <div>PC, ACM TUR-C 2020</div>
                  <div>PC, HPBD&IS 2020</div>
                  <div>PC, NAS 2019</div>
                  <div>Publicity Chair, IWQoS 2016</div>
                  <div>Session Chair, INFOCOM 2016</div>
                  <div>Session Chair, ICDCS 2015</div>
                  <div>PC, ICDCS 2013, 2020</div>
                </div>
              </details>
            </div>
          </section>

          {/* 奖项与荣誉 */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold border-b border-theme-dark pb-2 text-theme-primary">Awards and Honors</h2>
            <div className="mt-5 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-theme-primary mb-3">Recent Highlights</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-theme-secondary">
                  <div className="flex items-baseline">
                    <span className="font-medium w-44 text-theme-primary">Provincial Tech. Award</span>
                    <span>First Awardee, JiangXi, 2024</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-medium w-44 text-theme-primary">National R/D Project</span>
                    <span>Co-PI, Ministry of Science, 2023-2025</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-theme-primary mb-3">Research Grants</h3>
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-theme-secondary">
                  <div className="flex items-baseline">
                    <span className="font-medium w-44 text-theme-primary">Provincial R/D Project</span>
                    <span>PI, Dept. of Tech JiangXi, 2022-2024</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-medium w-44 text-theme-primary">Cambodian Funding</span>
                    <span>Principal Investigator, 2021</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-medium w-44 text-theme-primary">National R/D Project</span>
                    <span>Co-PI, Min. of Science, 2019-2022</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="font-medium w-44 text-theme-primary">NSFC Youth Grant</span>
                    <span>PI, NSFC, 2018-2020</span>
                  </div>
                </div>
              </div>
              
              <div>
                <details className="text-theme-secondary">
                  <summary className="cursor-pointer font-medium text-theme-primary hover:underline">View all awards and honors</summary>
                  <div className="mt-3 grid md:grid-cols-2 gap-x-8 gap-y-2 pl-4 border-l-2 border-theme-primary">
                    <div>Education Major Grant, Dept. of Edu. JiangXi, 2019-2021</div>
                    <div>National KHF Key Project, Min. of Science, 2018-2020</div>
                    <div>Jiangxi Thousand Young Talents, 2018</div>
                    <div>Tencent Rhino Bird Grant, Tencent, 2017-2018</div>
                    <div>AWS Research Education Grant, Amazon, 2015-2017</div>
                    <div>Microsoft Azure Research Grant, Microsoft, 2017-2018</div>
                    <div>Finalist in Edward F. Hayes Forum, OSU, 2015</div>
                    <div>Student Travel Grant, USENIX Association, 2013</div>
                    <div>USF Student Challenge Grant, USF, 2010-2011</div>
                    <div>Best Paper Award, Florida Emerging Paradigms, 2010</div>
                    <div>Student Travel Grant, SIGMOD, 2010</div>
                    <div>Conference Presentation Grant, USF, 2010</div>
                    <div>Best Research Poster Award, USF, 2009</div>
                    <div>Best Undergraduate Thesis, BUPT, 2007</div>
                    <div>Finalist in WESC, Microsoft, 2006</div>
                    <div>Honored Graduate, BUPT, 2007 (Top 8%)</div>
                  </div>
                </details>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}