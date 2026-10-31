import { Link } from 'react-router-dom';
import { fullName } from '../../lib/types';
import type { Profile, User } from '../../lib/types';
import { Badge, Card, PageHeading, buttonClass } from '../../components/ui';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import styles from './ProfilePage.module.css';

// "https://www.acme.com/about" -> "acme.com", for display only
const displayHost = (url: string) =>
  URL.canParse(url) ? new URL(url).hostname.replace(/^www\./, '') : url;

export function CompanyProfileView({ user, profile, own }: { user: User; profile: Profile; own: boolean }) {
  const name = profile.name || fullName(user);
  const verified = profile.verification_status === 'verified';

  return (
    <>
      <PageHeading
        eyebrow="COMPANY PROFILE"
        title={name}
        description="Building with emerging talent on SkillSpring."
        action={
          own && (
            <Link className={buttonClass('secondary')} to="/settings">
              Edit profile
            </Link>
          )
        }
      />
      <div className={layout.split}>
        <Card>
          <div className={layout.headerRow}>
            <h2>About {name}</h2>
            <Badge tone={verified ? 'success' : 'neutral'}>{verified ? '✓ Verified company' : 'Not verified yet'}</Badge>
          </div>
          {profile.description ? (
            <p className={cx(text.longText, styles.about)}>{profile.description}</p>
          ) : (
            <div className={styles.emptyAbout}>
              <p className={styles.emptyTitle}>No description yet</p>
              <p className={text.mutedSmall}>
                {own
                  ? 'Tell students what your company does and what working with you looks like.'
                  : 'This company hasn’t added a description yet.'}
              </p>
              {own && (
                <Link className={links.textLink} to="/settings">
                  Add a description →
                </Link>
              )}
            </div>
          )}
        </Card>

        <aside>
          <Card className={styles.summaryCard}>
            <div className={styles.avatar}>{name[0]}</div>
            <h2>{name}</h2>
            <p className={text.muted}>Business partner</p>

            <dl className={styles.facts}>
              <div>
                <dt>Contact</dt>
                <dd>{fullName(user)}</dd>
              </div>
              {own && user.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
              )}
              <div>
                <dt>Website</dt>
                <dd>
                  {profile.website ? (
                    <a href={profile.website} className={links.textLink} target="_blank" rel="noreferrer">
                      {displayHost(profile.website)} ↗
                    </a>
                  ) : (
                    <span className={text.muted}>Not added</span>
                  )}
                </dd>
              </div>
            </dl>

            <p className={cx(text.mutedSmall, styles.note)}>
              {verified
                ? 'Your company is verified. Students can see that your business has been confirmed.'
                : 'Verify your company with a work email on your website’s domain before posting tasks.'}
            </p>
            {own && !verified && (
              <Link className={links.textLink} to="/verification">
                Verify company →
              </Link>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
