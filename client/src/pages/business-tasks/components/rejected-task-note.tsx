import { Link } from 'react-router-dom';
import { buttonClass } from '../../../components/ui';
import styles from '../BusinessTasksPage.module.css';
import { Icon } from './Icon';

const ALERT_ICON = 'M12 3 2 20h20zM12 10v4M12 17h.01';

// shown under a task that automated review refused to publish
function RejectionNotice({ reasons }: { reasons: string[] }) {
  return (
    <div className={styles.rejection} role="note" aria-label="Why this task was not published">
      <Icon d={ALERT_ICON} className={styles.rejectionIcon} />
      <div className={styles.rejectionBody}>
        <strong>This task wasn't published</strong>
        <p>Our automated review flagged the content below, so students can't see this task.</p>
        {reasons.length ? (
          <ul>
            {reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        ) : (
          <p>No specific reason was provided. Contact support if you're unsure what to change.</p>
        )}
        <div className={styles.rejectionFooter}>
          <p>
            Remove or rewrite the flagged content in the description and the ZIP, then post the
            task again.
          </p>
          <Link className={buttonClass('dark', styles.rejectionAction)} to="/business/tasks/new">
            Post revised task
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RejectionNotice;