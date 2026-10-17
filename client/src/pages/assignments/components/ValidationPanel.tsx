import type { AssignmentDetail } from '../../../lib/types';
import { Card, EmptyState, StatusBadge } from '../../../components/ui';
import layout from '../../../styles/layout.module.css';
import notice from '../../../styles/notice.module.css';
import text from '../../../styles/text.module.css';
import { cx } from '../../../utils/cx';
import { formatKb } from '../utils/format-kb';
import styles from './ValidationPanel.module.css';

export function ValidationPanel({ detail }: { detail: AssignmentDetail }) {
  return (
    <div className={layout.stack}>
      <Card className={layout.infoCard}>
        <h2>What has been checked?</h2>
        <p>
          Archive checks validate file structure, integrity, size limits, and common credential
          patterns.
        </p>
        <p>
          <strong>Code execution is unavailable.</strong> No Docker container, test suite, or
          application code has been run. Passing these checks does not mean the solution works or
          that it is free of every possible secret.
        </p>
      </Card>
      {detail.validations.length ? (
        detail.submissions.map((submission) => {
          const run = detail.validations.find((v) => v.submission === submission.id);
          if (!run) return null;
          return (
            <Card key={run.id}>
              <div className={layout.headerRow}>
                <h2>Version {submission.version}</h2>
                <StatusBadge status={run.status} />
              </div>
              <p className={text.muted}>
                {run.file_count} files inspected · {formatKb(run.uncompressed_bytes)} KB expanded
              </p>
              {run.findings.length ? (
                <ul className={styles.findings}>
                  {run.findings.map((finding) => (
                    <li key={finding}>{finding}</li>
                  ))}
                </ul>
              ) : (
                <p className={cx(notice.notice, notice.success)}>
                  Archive checks passed. This version can be reviewed by the business.
                </p>
              )}
              <p className={text.mutedSmall}>Execution: not run</p>
            </Card>
          );
        })
      ) : (
        <EmptyState title="No validation runs yet.">
          Upload a solution ZIP to start archive checks.
        </EmptyState>
      )}
    </div>
  );
}
