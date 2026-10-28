import { Link, useParams } from 'react-router-dom';
import { fullName } from '../../lib/types';
import {
  Badge,
  Card,
  DateLabel,
  EmptyState,
  Loading,
  PageHeading,
  StatusBadge,
  buttonClass,
} from '../../components/ui';
import { useCurrentUser } from '../dashboard/hooks/use-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import { sampleProfile } from './constants/sample-profile';
import { toOwnProfile } from './utils/own-profile';
import styles from './ProfilePage.module.css';
export default function ProfilePage() {
  const { id } = useParams();
  const { data: me, isPending } = useCurrentUser();
  const own = !id;
  if (own && isPending) return <Loading />;
  const { user, profile, experiences } = own && me ? toOwnProfile(me) : sampleProfile;
  const student = user.role === 'student';
  return (
    <>
      <PageHeading
        eyebrow={student ? 'POTENTIAL, WITH PROOF' : 'BUSINESS PROFILE'}
        title={student ? fullName(user) : profile.name || fullName(user)}
        description={
          student ? profile.university || 'Student on SkillSpring' : 'Building with emerging talent'
        }
        action={
          own && (
            <Link className={buttonClass('secondary')} to="/settings">
              Edit profile
            </Link>
          )
        }
      />
      <div className={layout.split}>
        <div className={layout.stack}>
          <Card>
            <div className={layout.headerRow}>
              <h2>About</h2>
              <StatusBadge status={profile.verification_status} />
            </div>
            <p className={cx(text.longText, text.muted)}>
              {(student ? profile.bio : profile.description) || 'No introduction added yet.'}
            </p>
            {student && !!profile.skills?.length && (
              <div className={layout.tags}>
                {profile.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            )}
            {student && profile.github_url && (
              <a
                href={profile.github_url}
                className={links.textLink}
                target="_blank"
                rel="noreferrer"
              >
                GitHub profile ↗
              </a>
            )}
            {!student && profile.website && (
              <a href={profile.website} className={links.textLink} target="_blank" rel="noreferrer">
                Company website ↗
              </a>
            )}
          </Card>
          {student && (
            <>
              <div className={layout.sectionBar}>
                <h2>Verified experience</h2>
                <span className={text.muted}>{experiences.length} completed</span>
              </div>
              {experiences.length ? (
                experiences.map((experience) => (
                  <Card className={styles.experience} key={experience.id}>
                    <div className={layout.headerRow}>
                      <Badge tone="success">✓ Business approved</Badge>
                      <span
                        className={styles.stars}
                        aria-label={`${experience.rating} out of 5 stars`}
                      >
                        {'★'.repeat(experience.rating)}
                        <span aria-hidden="true">{'☆'.repeat(5 - experience.rating)}</span>
                      </span>
                    </div>
                    <h2>{experience.title}</h2>
                    <p className={text.muted}>
                      {experience.company.name} · <DateLabel value={experience.completed_at} />
                    </p>
                    <p className={text.longText}>{experience.summary}</p>
                    <div className={layout.tags}>
                      {experience.skills.map((skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <EmptyState title="The first proof point is ahead.">
                  Approved work appears here automatically after business review.
                </EmptyState>
              )}
            </>
          )}
        </div>
        <aside>
          <Card className={styles.summaryCard}>
            <div className={styles.avatar}>
              {(student ? user.first_name : profile.name || user.first_name)[0]}
            </div>
            <h2>{student ? fullName(user) : profile.name}</h2>
            <p className={text.muted}>{student ? 'Student contributor' : 'Business partner'}</p>
            {student && profile.graduation_year && <p>Class of {profile.graduation_year}</p>}
            <hr />
             <p className={text.mutedSmall}>
               {profile.verification_status === 'unverified' ? `
               Identity verification is reviewed separately from project approval. A completed
               project verifies the work, not the account holder’s identity. You must verify yur account before starting the work.
               ` : 'Your profile hass been successfuly verified. You can go ahead and start gaining experience.'}
             </p>
            {own && me?.role === 'student' && profile.verification_status !== 'verified' && (
              <Link className={links.textLink} to="/verification">
                Manage verification →
              </Link>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
