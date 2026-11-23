import { Link, useParams } from 'react-router-dom';
import { fullName } from '../../lib/types';
import {
  Badge,
  Card,
  EmptyState,
  Loading,
  PageHeading,
  StatusBadge,
  buttonClass,
} from '../../components/ui';
import { useCurrentUser } from '../home/hooks/use-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import { toOwnProfile } from './utils/own-profile';
import styles from './ProfilePage.module.css';
import { CompanyProfileView } from './CompanyProfileView';
import { StudentProfileView } from './StudentProfileView';
import { useViewStudent, useViewedTasks } from './hooks';
import { ReviewedTasks } from './ReviewedTasks';

export default function ProfilePage() {
  const { id } = useParams(); // student_id when a company views a student
  const { data: me, isPending } = useCurrentUser();
  const own = !id;
  const { data: studentView, isPending: viewProfilePending } = useViewStudent(id);
  const reviewed = useViewedTasks(own && me?.role === 'student');

  if (own ? isPending : viewProfilePending) return <Loading />;
  if (!own && studentView) return <StudentProfileView student={studentView} />;

  const data = own && me ? toOwnProfile(me) : undefined;
  if (!data) return <EmptyState title="Profile not found.">This profile doesn’t exist or isn’t available.</EmptyState>;
  const { user, profile } = data;
  const student = user.role === 'student';
  if (!student) return <CompanyProfileView user={user} profile={profile} own={own} />;

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
            <ReviewedTasks
              reviews={reviewed.data}
              isPending={reviewed.isPending}
              error={reviewed.error}
              retry={reviewed.refetch}
            />
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
               {profile.verification_status === 'verified'
                 ? 'Your profile has been verified. You can go ahead and start gaining experience.'
                 : profile.verification_status === 'pending'
                   ? 'Your verification is under review.'
                   : 'Identity verification is reviewed separately from project approval. A completed project verifies the work, not the account holder’s identity. You must verify your account before starting the work.'}
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
