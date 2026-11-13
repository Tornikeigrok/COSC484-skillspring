import { useState } from 'react';
import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import { initials } from '@/utils/task-display';
import { logoSrc } from '../constants/discover';
import styles from '../DiscoverPage.module.css';

// brand logo for well-known companies, initials for everyone else (or if the logo fails to load)
export function CompanyLogo({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const src = logoSrc(name);
  const [failed, setFailed] = useState(false);
  const showLogo = src && !failed;

  return (
    <span className={cx(className, showLogo && styles.hasLogo)} style={style} aria-hidden="true">
      {showLogo ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </span>
  );
}
