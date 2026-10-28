import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Role } from '../lib/types';
import { Brand, Button, Loading, buttonClass } from '../components/ui';
import { cx } from '../utils/cx';
import { useCurrentUser } from '../pages/dashboard/hooks/use-profile';
import { useAuthenticateUser } from '../auth/use-authenticate-user';
import { BUSINESS_LINKS, STUDENT_LINKS } from '../constants/navigation';
import { useLogout } from '../pages/auth/hooks/use-auth-hooks';
import linkStyles from '../styles/links.module.css';
import styles from './AppLayout.module.css';
export function RequireAuth({ role }: { role?: Role }) {
  // role comes from authenticate-user, so this works for both students and companies
  const { data: auth, isPending } = useAuthenticateUser();
  if (isPending) return <Loading />;
  if (!auth) return <Navigate to="/" replace />;
  if (role && auth.role !== role)
    return <Navigate to={auth.role === 'student' ? '/student' : '/business'} replace />;
  return <Outlet />;
}
export function AppLayout() {
  const { data: user, isPending } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const [menu, setMenu] = useState(false);
  if (isPending) return <Loading />;
  if (!user) return <Navigate to="/" replace />;
  const student = user.role === 'student';
  const links = student ? STUDENT_LINKS : BUSINESS_LINKS;
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cx(styles.navLink, isActive ? styles.navLinkActive : styles.navLinkIdle);
  return (
    <div className={styles.shell}>
      <a className={linkStyles.skipLink} href="#main-content">
        Skip to content
      </a>
      <aside className={cx(styles.sidebar, menu ? styles.sidebarOpen : styles.sidebarClosed)}>
        <Brand className={styles.sidebarBrand} role={user?.role} />
        <p className={styles.workspaceLabel}>
          {student ? 'Student workspace' : 'Business workspace'}
        </p>
        <nav aria-label="Workspace" className={styles.nav}>
          {links.map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              end
              onClick={() => setMenu(false)}
              className={navLinkClass}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          {(user.role === 'student' ? user.Student : user.Company).verification_status !== 'verified' && (
            <NavLink to="/verification" onClick={() => setMenu(false)} className={navLinkClass}>
              Identity verification
            </NavLink>
          )}
          {student && (
            <NavLink to="/settings" onClick={() => setMenu(false)} className={navLinkClass}>
              Account settings
            </NavLink>
          )}
          <p className={styles.tagline}>
            Small projects.
            <br />
            Meaningful experience.
          </p>
        </div>
      </aside>
      <div className={styles.content}>
        <header className={styles.header}>
          <Button
            variant="ghost"
            className={styles.menuButton}
            aria-expanded={menu}
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            ☰
          </Button>
          <span className={styles.greeting}>Your next step starts here.</span>
          <div className={styles.account}>
            <Link to="/profile" className={styles.avatar} aria-label="View profile">
              {user.first_name[0]}
              {user.last_name[0]}
            </Link>
            <span className={styles.userName}>{user.first_name}</span>
            <Button
              variant="ghost"
              busy={logout.isPending}
              onClick={() =>
                logout.mutate(undefined, {
                  onSuccess: () => {
                    queryClient.clear();
                    navigate('/');
                  },
                })
              }
            >
              Log out
            </Button>
          </div>
        </header>
        <main id="main-content" className={styles.main}>
          <Outlet />
        </main>
        <footer className={styles.footer}>SkillSpring · Real work. Real growth.</footer>
      </div>
    </div>
  );
}
export function PublicLayout() {
  return (
    <>
      <header className={styles.publicHeader}>
        <Brand className={styles.publicBrand} />
        <nav aria-label="Main" className={styles.publicNav}>
          <Link to="/tasks" className={styles.hideOnMobile}>
            Explore tasks
          </Link>
          <Link to="/login">Log in</Link>
          <Link className={buttonClass('primary', styles.publicCta)} to="/register">
            Get started
          </Link>
        </nav>
      </header>
      <main id="main-content" className={styles.publicMain}>
        <Outlet />
      </main>
    </>
  );
}
export function TaskLayout() {
  return <AppLayout />;
}
