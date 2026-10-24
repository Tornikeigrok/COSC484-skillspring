import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { buttonClass } from '../../../components/ui';
import styles from './MobileNav.module.css';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia?.('(min-width: 900px)');
    if (!desktop) return;
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={styles.trigger} aria-label="Open navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.panel}>
          <div className={styles.heading}>
            <Dialog.Title className={styles.title}>Explore SkillSpring</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className={styles.close} aria-label="Close navigation menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className={styles.description}>
            Small projects. Meaningful experience.
          </Dialog.Description>
          <nav aria-label="Mobile navigation" className={styles.links}>
            <Dialog.Close asChild>
              <Link to="/tasks">Explore tasks</Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <a href="#how-it-works">How it works</a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <a href="#safety">Safety</a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <a href="#faq">FAQ</a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link to="/login">Log in</Link>
            </Dialog.Close>
          </nav>
          <div className={styles.actions}>
            <Dialog.Close asChild>
              <Link to="/register?role=student" className={buttonClass('primary')}>
                Join as a student
              </Link>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link to="/register?role=company" className={buttonClass('secondary')}>
                Post a task
              </Link>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
