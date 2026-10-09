import { Link, useParams } from 'react-router-dom';
import { useApiQuery } from '../lib/queries';
import { useAuth } from '../lib/auth';
import type { ProfileResponse } from '../lib/types';
import { fullName } from '../lib/types';
import {
  Badge,
  Card,
  DateLabel,
  EmptyState,
  ErrorMessage,
  Loading,
  PageHeading,
  StatusBadge,
} from '../components/ui';
export default function ProfilePage() {
  const { id } = useParams();
  const { user: current } = useAuth();
  const query = useApiQuery<ProfileResponse>(
    ['profile', id || 'me'],
    id ? `/profiles/${id}` : '/profiles/me',
  );
  if (query.isPending) return <Loading />;
  if (query.error) return <ErrorMessage error={query.error} retry={() => query.refetch()} />;
  const { user, profile, experiences } = query.data!;
  const own = user.id === current?.id;
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
            <Link className="button button-secondary" to="/settings">
              Edit profile
            </Link>
          )
        }
      />
      <div className="detail-grid">
        <div className="list-stack">
          <Card>
            <div className="row between">
              <h2>About</h2>
              <StatusBadge status={profile.verification_status} />
            </div>
            <p className="preserve-text muted">
              {(student ? profile.bio : profile.description) || 'No introduction added yet.'}
            </p>
            {student && !!profile.skills?.length && (
              <div className="tags">
                {profile.skills.map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
            )}
            {student && profile.github_url && (
              <a href={profile.github_url} className="text-link" target="_blank" rel="noreferrer">
                GitHub profile ↗
              </a>
            )}
            {!student && profile.website && (
              <a href={profile.website} className="text-link" target="_blank" rel="noreferrer">
                Company website ↗
              </a>
            )}
          </Card>
          {student && (
            <>
              <div className="section-heading">
                <h2>Verified experience</h2>
                <span className="muted">{experiences.length} completed</span>
              </div>
              {experiences.length ? (
                experiences.map((experience) => (
                  <Card className="experience-card" key={experience.id}>
                    <div className="row between">
                      <Badge tone="success">✓ Business approved</Badge>
                      <span className="rating" aria-label={`${experience.rating} out of 5 stars`}>
                        {'★'.repeat(experience.rating)}
                        <span aria-hidden="true">{'☆'.repeat(5 - experience.rating)}</span>
                      </span>
                    </div>
                    <h2>{experience.title}</h2>
                    <p className="muted">
                      {experience.company.name} · <DateLabel value={experience.completed_at} />
                    </p>
                    <p className="preserve-text">{experience.summary}</p>
                    <div className="tags">
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
          <Card className="profile-summary">
            <div className="large-avatar">
              {(student ? user.first_name : profile.name || user.first_name)[0]}
            </div>
            <h2>{student ? fullName(user) : profile.name}</h2>
            <p className="muted">{student ? 'Student contributor' : 'Business partner'}</p>
            {student && profile.graduation_year && <p>Class of {profile.graduation_year}</p>}
            <hr />
            <p className="text-sm muted">
              Identity verification is reviewed separately from project approval. A completed
              project verifies the work, not the account holder’s identity.
            </p>
            {own && (
              <Link className="text-link" to="/verification">
                Manage verification →
              </Link>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
