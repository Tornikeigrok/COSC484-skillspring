import { cx } from '../../utils/cx';
import notice from '../../styles/notice.module.css';
import { Button } from './Button';
import styles from './ErrorMessage.module.css';

export function ErrorMessage({ error, retry }: { error: unknown; retry?: () => void }) {
  if (!error) return null;
  return (
    <div role="alert" className={cx(notice.notice, notice.error, styles.error)}>
      <p>{error instanceof Error ? error.message : 'Something went wrong. Please try again.'}</p>
      {retry && (
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
