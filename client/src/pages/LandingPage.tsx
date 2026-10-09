import { Link } from 'react-router-dom';
import { Brand, Badge } from '../components/ui';
const examples = [
  {
    title: 'Build a responsive analytics view',
    company: 'Northstar Labs',
    type: 'UI / UX',
    hours: '6–8',
    skills: ['React', 'Frontend'],
  },
  {
    title: 'Improve API error handling',
    company: 'Aperture Tech',
    type: 'API',
    hours: '4–6',
    skills: ['Node.js', 'Backend'],
  },
  {
    title: 'Clean and structure product data',
    company: 'Layerbase',
    type: 'Data',
    hours: '3–5',
    skills: ['Python', 'Data'],
  },
];
export default function LandingPage() {
  return (
    <div className="landing">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="landing-nav">
        <Brand />
        <nav aria-label="Main">
          <Link to="/tasks">Explore tasks</Link>
          <a href="#how-it-works">How it works</a>
          <Link to="/register?role=company">For companies</Link>
          <a href="#mission">Our mission</a>
          <Link to="/login">Log in</Link>
          <Link className="button button-primary" to="/register">
            Get started
          </Link>
        </nav>
      </header>
      <main id="main-content">
        <section className="landing-hero">
          <div className="hero-copy">
            <span className="platform-label">THE EXPERIENCE PLATFORM</span>
            <h1>
              Real work. Real skills.
              <br />A stronger start.
            </h1>
            <p>
              Complete real technical tasks for companies, build a portfolio of work that matters,
              and turn what you know into experience you can prove.
            </p>
            <div className="hero-actions">
              <Link className="button button-lime" to="/tasks">
                Explore tasks <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-dark" to="/register?role=company">
                Post a task
              </Link>
            </div>
            <p className="hero-caption">Built for ambitious students. Built for growing teams.</p>
          </div>
          <div className="featured-panel">
            <h2>Featured opportunities</h2>
            <p className="muted">A preview of the work you can build experience with.</p>
            <div className="featured-list">
              {examples.map((example) => (
                <div className="preview-task" key={example.title}>
                  <h3>{example.title}</h3>
                  <p>
                    {example.company} · {example.type} · {example.hours} hours
                  </p>
                  <div className="tags">
                    {example.skills.map((skill) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="example-label">
              Illustrative tasks · <Link to="/tasks">Browse live opportunities ↗</Link>
            </p>
          </div>
        </section>
        <section className="benefits-strip" aria-label="Your journey">
          {[
            ['01', 'Discover', 'Find work that fits your skills'],
            ['02', 'Build', 'Solve a real company problem'],
            ['03', 'Prove', 'Earn verified experience'],
          ].map(([n, title, text]) => (
            <div key={n}>
              <h2>
                {n} &nbsp;{title}
              </h2>
              <p>{text}</p>
            </div>
          ))}
        </section>
        <section className="how-section" id="how-it-works">
          <h2>From potential to proof.</h2>
          <p id="mission">A clear path from the classroom to meaningful contributions.</p>
          <div className="process-grid">
            {[
              [
                '01',
                'Find your fit',
                'Browse scoped technical tasks and check the company profile.',
              ],
              [
                '02',
                'Make it happen',
                'Propose your approach, get selected, and submit your solution.',
              ],
              [
                '03',
                'Show your impact',
                'Get feedback and add approved work to your verified profile.',
              ],
            ].map(([n, title, text]) => (
              <div className="process-card" key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} SkillSpring</span>
        <Link to="/register?role=company">Build with emerging talent ↗</Link>
      </footer>
    </div>
  );
}
