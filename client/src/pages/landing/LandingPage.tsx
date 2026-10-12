import { Link } from 'react-router-dom';
import { LazyMotion, MotionConfig, domAnimation, m } from 'motion/react';
import { Brand, Badge, buttonClass } from '../../components/ui';
import links from '../../styles/links.module.css';
import { Reveal } from './components/Reveal';
import { StepsTabs } from './components/StepsTabs';
import { TASK_LIFECYCLE } from './constants/audience-steps';
import { FAQ } from './constants/faq';
import { FEATURED_TASKS } from './constants/featured-tasks';
import { HERO_HIGHLIGHTS } from './constants/hero-highlights';
import { PROOF_POINTS } from './constants/proof-points';
import { NEVER_SHARED, SAFETY_POINTS } from './constants/safety-points';
import { STATS } from './constants/stats';
import { DIFFICULTIES, TASK_TYPES } from './constants/task-types';
import styles from './LandingPage.module.css';

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
                <span className={styles.badge}>The micro-task marketplace</span>
                <h1 className={styles.heroTitle}>
                  Turn what you&rsquo;ve learned into{' '}
                  <span className={styles.accent}>experience you can prove.</span>
                </h1>
                <p className={styles.heroText}>
                  SkillSpring connects verified college students with companies that have small,
                  well-defined technical tasks. Send a proposal, build the work on your own machine,
                  get reviewed, and keep a record of work that was actually approved.
                </p>
                <div className={styles.actions}>
                  <Link className={buttonClass('dark', styles.btn)} to="/register?role=company">
                    Post a task
                  </Link>
                </div>
                <ul className={styles.highlights}>
                  {HERO_HIGHLIGHTS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </m.div>
              <m.div
                className={styles.preview}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.previewHead}>
                  <h2>Featured opportunities</h2>
                  <span>Illustrative tasks</span>
                </div>
                <ul className={styles.taskList}>
                  {FEATURED_TASKS.map((task) => (
                    <li className={styles.task} key={task.title}>
                      <div>
                        <h3>{task.title}</h3>
                        <p>
                          {task.company} · {task.type}
                        </p>
                        <div className={styles.tags}>
                          {task.skills.map((skill) => (
                            <span className={styles.tag} key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={styles.hours}>{task.hours} hrs</span>
                    </li>
                  ))}
                </ul>
                <Link to="/tasks" className={styles.previewLink}>
                  Browse live opportunities ↗
                </Link>
              </m.div>
            </div>
          </section>

          <section className={styles.stats} aria-label="At a glance">
            <div className={styles.statsInner}>
              {STATS.map(([value, label]) => (
                <Reveal key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </Reveal>
              ))}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="what-heading">
            <div className={styles.wrap}>
              <Reveal className={styles.split}>
                <div>
                  <span className={styles.eyebrow}>What is SkillSpring</span>
                  <h2 id="what-heading" className={styles.title}>
                    Real work for students. Fresh talent for teams.
                  </h2>
                </div>
                <div className={styles.prose}>
                  <p>
                    Companies pick small, bounded pieces of work from their backlog and post them as
                    tasks. Verified students browse those tasks and send proposals. The company
                    chooses one student, who completes the work locally and submits it for review.
                  </p>
                  <p>
                    Students get real, verifiable experience instead of another practice project.
                    Companies get focused help on work that would otherwise wait, without opening up
                    their systems.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          <section className={styles.sectionAlt} id="how-it-works" aria-labelledby="how-heading">
            <div className={styles.wrap}>
              <Reveal>
                <span className={styles.eyebrow}>How it works</span>
                <h2 id="how-heading" className={styles.title}>
                  From first proposal to proven experience.
                </h2>
                <p className={styles.lead}>
                  One clear path for every task, whichever side of the platform you are on.
                </p>
                <ol className={styles.lifecycle} aria-label="Task lifecycle">
                  {TASK_LIFECYCLE.map((stage) => (
                    <li key={stage}>{stage}</li>
                  ))}
                </ol>
              </Reveal>
              <Reveal delay={0.1}>
                <StepsTabs />
              </Reveal>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="types-heading">
            <div className={styles.wrap}>
              <Reveal>
                <span className={styles.eyebrow}>What you can work on</span>
                <h2 id="types-heading" className={styles.title}>
                  Six kinds of focused technical work.
                </h2>
                <p className={styles.lead}>
                  Every task has a type, a difficulty and an estimated number of hours, so you know
                  what you are signing up for.
                </p>
              </Reveal>
              <div className={styles.grid3}>
                {TASK_TYPES.map(([title, description], index) => (
                  <Reveal key={title} delay={(index % 3) * 0.06}>
                    <div className={styles.card}>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className={styles.difficulty}>
                <span>Difficulty levels</span>
                {DIFFICULTIES.map((level) => (
                  <Badge key={level}>{level}</Badge>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.safety} id="safety" aria-labelledby="safety-heading">
            <div className={styles.wrap}>
              <Reveal>
                <span className={styles.eyebrowLight}>Safe by design</span>
                <h2 id="safety-heading" className={styles.titleLight}>
                  Real work, without opening up your systems.
                </h2>
                <p className={styles.leadLight}>
                  SkillSpring is built around bounded technical work. Companies decide which tasks
                  to share and which files to provide, and nothing beyond that leaves the building.
                </p>
              </Reveal>
              <div className={styles.safetyGrid}>
                <div className={styles.safetyList}>
                  {SAFETY_POINTS.map(([title, description], index) => (
                    <Reveal key={title} delay={(index % 2) * 0.06}>
                      <div className={styles.cardDark}>
                        <h3>{title}</h3>
                        <p>{description}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <Reveal delay={0.1}>
                  <div className={styles.never}>
                    <h3>Students never get access to</h3>
                    <ul>
                      {NEVER_SHARED.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="proof-heading">
            <div className={styles.wrap}>
              <Reveal>
                <span className={styles.eyebrow}>Your track record</span>
                <h2 id="proof-heading" className={styles.title}>
                  Proof that holds up.
                </h2>
              </Reveal>
              <div className={styles.grid3}>
                {PROOF_POINTS.map(([title, description], index) => (
                  <Reveal key={title} delay={index * 0.06}>
                    <div className={styles.card}>
                      <span className={styles.num}>0{index + 1}</span>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.sectionAlt} id="faq" aria-labelledby="faq-heading">
            <div className={styles.wrapNarrow}>
              <Reveal>
                <span className={styles.eyebrow}>Questions</span>
                <h2 id="faq-heading" className={styles.title}>
                  Good to know before you start.
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

          <section className={styles.cta} aria-labelledby="cta-heading">
            <Reveal>
              <h2 id="cta-heading">Ready to start building experience?</h2>
              <p>
                Join as a student to find your first task, or as a company to get focused help on
                work from your backlog.
              </p>
              <div className={styles.ctaActions}>
                <Link className={buttonClass('lime', styles.btn)} to="/register?role=student">
                  Join as a student
                </Link>
                <Link className={buttonClass('dark', styles.btn)} to="/register?role=company">
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
