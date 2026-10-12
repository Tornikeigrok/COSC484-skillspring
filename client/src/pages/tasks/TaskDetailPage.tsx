import { Link, useParams } from 'react-router-dom';
import { categories } from '../../lib/types';
import { Badge, Card, PageHeading, StatusBadge, buttonClass } from '../../components/ui';
import { sampleProposal, sampleTask } from '../../constants/sample';
import { useFetchProfile } from '../dashboard/hooks/use-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import notice from '../../styles/notice.module.css';
import text from '../../styles/text.module.css';
import styles from './TaskDetailPage.module.css';
export default function TaskDetailPage() {
  const { id } = useParams();
  const { data: user } = useFetchProfile();
  const task = sampleTask;
  const mine = [sampleProposal].find((p) => p.task.id === id);
  return (
    <>
      <Link className={links.backLink} to="/tasks">
        ← Explore tasks
      </Link>
      <PageHeading
        eyebrow={categories[task.category]}
        title={task.title}
        description={task.company.name}
        action={<StatusBadge status={task.status} />}
      />
      <div className={layout.split}>
        <div className={layout.stack}>
          <Card>
            <h2>The opportunity</h2>
            <p className={text.longText}>{task.description}</p>
            <h2 className={styles.sectionTitle}>What success looks like</h2>
            <p className={text.longText}>{task.acceptance_criteria}</p>
            <h2 className={styles.sectionTitle}>Skills you’ll use</h2>
            <div className={layout.tags}>
              {task.skills.length ? (
                task.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)
              ) : (
                <p className={text.muted}>No specific tools required.</p>
              )}
            </div>
          </Card>
          <Card>
            <div className={layout.headerRow}>
              <h2>
                {task.company.user ? (
                  <Link to={`/profiles/${task.company.user}`}>About {task.company.name}</Link>
                ) : (
                  `About ${task.company.name}`
                )}
              </h2>
              <StatusBadge status={task.company.verification_status} />
            </div>
            <p className={cx(text.longText, text.muted)}>
              {task.company.description || 'This company has not added a description yet.'}
            </p>
            {task.company.website && (
              <a
                className={links.textLink}
                href={task.company.website}
                target="_blank"
                rel="noreferrer"
              >
                Company website ↗
              </a>
            )}
          </Card>
        </div>
        <aside className={layout.stack}>
          <Card className={styles.facts}>
            <h2>At a glance</h2>
            <dl>
              <div>
                <dt>Estimated effort</dt>
                <dd>{task.estimated_hours} hours</dd>
              </div>
              <div>
                <dt>Difficulty</dt>
                <dd className={styles.capitalize}>{task.difficulty}</dd>
              </div>
              <div>
                <dt>Work format</dt>
                <dd>Remote · Project based</dd>
              </div>
              <div>
                <dt>Private file access</dt>
                <dd>
                  {task.agreement_required
                    ? 'Agreement required after selection'
                    : 'Available after selection'}
                </dd>
              </div>
            </dl>
            {user?.role === 'company' ? (
              <p className={text.mutedSmall}>Student accounts can submit proposals.</p>
            ) : mine ? (
              <div className={cx(notice.notice, notice.info)}>
                <p>
                  Your proposal is <strong>{mine.status}</strong>.
                </p>
                <Link
                  className={links.textLink}
                  to={mine.status === 'accepted' ? '/assignments' : '/student/proposals'}
                >
                  View your {mine.status === 'accepted' ? 'assignment' : 'proposals'} →
                </Link>
              </div>
            ) : task.status === 'open' ? (
              <Link
                className={buttonClass('primary', styles.fullButton)}
                to={
                  user
                    ? `/tasks/${id}/propose`
                    : `/login?next=${encodeURIComponent(`/tasks/${id}/propose`)}`
                }
              >
                Submit a proposal →
              </Link>
            ) : (
              <p className={cx(notice.notice, notice.info)}>
                This task is no longer accepting proposals.
              </p>
            )}
            <p className={cx(text.mutedSmall, styles.disclaimer)}>
              Completed work earns verified experience after business approval. Compensation is not
              handled by SkillSpring.
            </p>
          </Card>
          <Card className={layout.infoCard}>
            <h3>Start with an approach.</h3>
            <p className={text.mutedSmall}>
              Explain how you’ll solve the problem, what you’ll deliver, and how you’ll test your
              work.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
