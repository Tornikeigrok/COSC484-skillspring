import styles from './FieldError.module.css';

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p className={styles.error} id={id}>
      {message}
    </p>
  );
}
