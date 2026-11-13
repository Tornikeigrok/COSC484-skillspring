import { Link, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Role } from '../lib/types';
import { Brand, Button, Loading, buttonClass } from '../components/ui';
import { cx } from '../utils/cx';
import { useCurrentUser } from '../pages/home/hooks/use-profile';
import { useAuthenticateUser } from '../auth/use-authenticate-user';
import { BUSINESS_LINKS, STUDENT_LINKS } from '../constants/navigation';
import { useLogout } from '../pages/auth/hooks/use-auth-hooks';
import * as Menu from '@radix-ui/react-dropdown-menu';
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
  const unverified =
    (student ? user.Student : user.Company).verification_status !== 'verified';
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cx(styles.navLink, isActive && styles.navLinkActive);

  const signOut = () =>
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        navigate('/');
      },
    });

  return (
    <div className={styles.shell}>
      <a className={linkStyles.skipLink} href="#main-content">
        Skip to content
      </a>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Brand className={styles.brand} role={user.role} />

          <nav
            aria-label="Workspace"
            className={cx(styles.nav, menu && styles.navOpen)}
          >
            {links.map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/student' || path === '/business'}
                onClick={() => setMenu(false)}
                className={navLinkClass}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.account}>
            <Menu.Root>
              <Menu.Trigger className={styles.accountTrigger}>
                <span className={styles.avatar}>
                  {user.first_name[0]}
                  {user.last_name[0]}
                </span>
                <span className={styles.userName}>{user.first_name}</span>
                <span aria-hidden="true" className={styles.chevron}>▾</span>
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Content align="end" sideOffset={8} className={styles.accountMenu}>
                  <Menu.Item className={styles.menuItem} onSelect={() => navigate('/profile')}>
                    View profile
                  </Menu.Item>
                  <Menu.Item className={styles.menuItem} onSelect={() => navigate('/settings')}>
                    Account settings
                  </Menu.Item>
                  {unverified && (
                    <Menu.Item className={styles.menuItem} onSelect={() => navigate('/verification')}>
                      Identity verification
                    </Menu.Item>
                  )}
                  <Menu.Separator className={styles.menuSeparator} />
                  <Menu.Item
                    className={styles.menuItem}
                    disabled={logout.isPending}
                    onSelect={signOut}
                  >
                    {logout.isPending ? 'Logging out…' : 'Log out'}
                  </Menu.Item>
                </Menu.Content>
              </Menu.Portal>
            </Menu.Root>

            <Button
              variant="ghost"
              className={styles.menuButton}
              aria-expanded={menu}
              aria-label="Toggle navigation"
              onClick={() => setMenu(!menu)}
            >
              ☰
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>SkillSpring · Real work. Real growth.</footer>
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
