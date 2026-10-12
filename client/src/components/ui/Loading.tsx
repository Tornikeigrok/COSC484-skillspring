import styles from './Loading.module.css';

export function Loading() {
  return (
    <div role="status" className={styles.loading}>
      <span className={styles.spinner} />
      Loading…
    </div>
  );
}
