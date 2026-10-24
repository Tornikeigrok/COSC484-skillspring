import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { LazyMotion, MotionConfig, domAnimation, m } from 'motion/react';
import { Brand, buttonClass } from '../../components/ui';
import { categories } from '../../lib/types';
import { initials } from '../../utils/task-display';
import links from '../../styles/links.module.css';
import { Reveal } from './components/Reveal';
import { StepsTabs } from './components/StepsTabs';
import { HeroAnimation } from './components/HeroAnimation';
import { MobileNav } from './components/MobileNav';
import { FAQ } from './constants/faq';
import { FEATURED_TASKS } from './constants/featured-tasks';
import { HERO_HIGHLIGHTS } from './constants/hero-highlights';
import { TASK_TYPE_BLURBS } from './constants/task-types';
import { NEVER_SHARED, TRUST_POINTS } from './constants/trust-points';
import styles from './LandingPage.module.css';

const ICON = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const tint = (category: string) =>
  ({
    '--tint-bg': `var(--category-${category}-bg, var(--color-brand-soft))`,
    '--tint-fg': `var(--category-${category}-fg, var(--color-brand))`,
  }) as CSSProperties;

export default function LandingPage() {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a className={links.skipLink} href="#main-content">
          Skip to content
        </a>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Brand className={styles.brand} />
            <nav aria-label="Main" className={styles.navLinks}>
              <Link to="/tasks">Explore tasks</Link>
              <a href="#how-it-works">How it works</a>
              <a href="#safety">Safety</a>
              <a href="#faq">FAQ</a>
            </nav>
            <div className={styles.headerActions}>
              <Link to="/login" className={styles.login}>
                Log in
              </Link>
              <Link className={buttonClass('primary', styles.btnSm)} to="/register">
                Get started
              </Link>
              <MobileNav />
            </div>
          </div>
        </header>
        <main id="main-content">
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <m.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={styles.eyebrow}>Real projects. Real experience.</span>
                <h1 className={styles.heroTitle}>
                  Turn what you&rsquo;ve learned into{' '}
                  <span className={styles.accent}>experience you can prove.</span>
                </h1>
                <p className={styles.heroText}>
                  Small, real tasks from verified companies. Build them, get reviewed, and keep the
                  proof.
                </p>
                <div className={styles.actions}>
                  <Link className={buttonClass('primary', styles.btn)} to="/register?role=student">
                    Join as a student
                  </Link>
                  <Link className={styles.outlineBtn} to="/register?role=company">
                    Post a task
                  </Link>
                </div>
                <ul className={styles.highlights}>
                  {HERO_HIGHLIGHTS.map((item) => (
                    <li key={item}>
                      <svg {...ICON} className={styles.check}>
                        <path d="m5 12 4 4 10-10" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </m.div>
              <m.div
                className={styles.heroAside}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <HeroAnimation />
                <div className={styles.preview}>
                  <div className={styles.previewHead}>
                    <h2>Featured opportunities</h2>
                    <span>Illustrative tasks</span>
                  </div>
                  <ul className={styles.taskList}>
                    {FEATURED_TASKS.map((task) => (
                      <li key={task.title} className={styles.task}>
                        <span
                          className={styles.taskLogo}
                          style={tint(task.category)}
                          aria-hidden="true"
                        >
                          {initials(task.company)}
                        </span>
                        <span className={styles.taskText}>
                          <strong>{task.title}</strong>
                          <small>
                            {task.company} · {categories[task.category]}
                          </small>
                        </span>
                        <span className={styles.hours}>{task.hours}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/tasks" className={styles.previewLink}>
                    Browse live opportunities
                    <svg {...ICON} className={styles.arrow}>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </m.div>
            </div>
          </section>


          <section className={styles.section} id="how-it-works" aria-labelledby="how-heading">
            <div className={styles.wrap}>
              <Reveal className={styles.sectionHead}>
                <span className={styles.eyebrow}>How it works</span>
                <h2 id="how-heading" className={styles.title}>
                  From first proposal to proven experience.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <StepsTabs />
              </Reveal>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="types-heading">
            <div className={styles.wrap}>
              <Reveal className={styles.sectionHead}>
                <span className={styles.eyebrow}>What you can work on</span>
                <h2 id="types-heading" className={styles.title}>
                  Six kinds of focused work.
                </h2>
                <p className={styles.lead}>Every task lists its difficulty and estimated hours.</p>
              </Reveal>
              <div className={styles.types}>
                {Object.entries(categories).map(([category, label], index) => (
                  <Reveal key={category} delay={(index % 3) * 0.06}>
                    <div className={styles.type} style={tint(category)}>
                      <span className={styles.typeTag}>{label}</span>
                      <p>{TASK_TYPE_BLURBS[category]}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section} id="safety" aria-labelledby="safety-heading">
            <div className={styles.wrap}>
              <Reveal className={styles.sectionHead}>
                <span className={styles.eyebrow}>Safe by design</span>
                <h2 id="safety-heading" className={styles.title}>
                  Real work, without opening up your systems.
                </h2>
              </Reveal>
              <div className={styles.trust}>
                {TRUST_POINTS.map((point, index) => (
                  <Reveal key={point.title} delay={index * 0.06}>
                    <div className={styles.card}>
                      <span className={styles.cardIcon}>
                        <svg {...ICON}>
                          <path d={point.icon} />
                        </svg>
                      </span>
                      <h3>{point.title}</h3>
                      <p>{point.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={0.1}>
                <div className={styles.never}>
                  <span>Students never get access to</span>
                  <ul>
                    {NEVER_SHARED.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>

          <section className={styles.section} id="faq" aria-labelledby="faq-heading">
            <div className={styles.wrapNarrow}>
              <Reveal>
                <h2 id="faq-heading" className={styles.title}>
                  Questions
                </h2>
                <div className={styles.faq}>
                  {FAQ.map(([question, answer]) => (
                    <details key={question}>
                      <summary>{question}</summary>
                      <p>{answer}</p>
                    </details>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          <section className={styles.ctaSection} aria-labelledby="cta-heading">
            <Reveal className={styles.cta}>
              <h2 id="cta-heading">Ready to start building experience?</h2>
              <p>Find your first task, or get focused help on work from your backlog.</p>
              <div className={styles.actions}>
                <Link className={buttonClass('primary', styles.btn)} to="/register?role=student">
                  Join as a student
                </Link>
                <Link className={styles.outlineBtn} to="/register?role=company">
                  Post a task
                </Link>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span>© {new Date().getFullYear()} SkillSpring</span>
            <nav aria-label="Footer">
              <Link to="/tasks">Explore tasks</Link>
              <a href="#how-it-works">How it works</a>
              <a href="#safety">Safety</a>
              <Link to="/login">Log in</Link>
              <Link to="/register?role=company">For companies</Link>
            </nav>
          </div>
        </footer>
      </MotionConfig>
    </LazyMotion>
  );
}