import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Role } from '../lib/types';
import { Brand, Button, ErrorMessage, Loading } from '../components/ui';
export function RequireAuth({ role }: { role?: Role }) {
  const { user, isPending, error, refetch } = useAuth();
  const location = useLocation();
  if (isPending) return <Loading />;
  if (error)
    return (
      <div className="container py-12">
        <ErrorMessage error={error} retry={() => refetch()} />
      </div>
    );
  if (!user)
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === 'student' ? '/student' : '/business'} replace />;
  return <Outlet />;
}
export function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [menu, setMenu] = useState(false);
  const logout = useMutation({
    mutationFn: () => api('/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      cache.clear();
      cache.setQueryData(['session'], null);
      navigate('/');
    },
  });
  if (!user) return <Loading />;
  const student = user.role === 'student';
  const links = student
    ? [
        ['/student', 'Overview'],
        ['/tasks', 'Discover tasks'],
        ['/student/proposals', 'My proposals'],
        ['/assignments', 'My work'],
        ['/profile', 'Verified experience'],
      ]
    : [
        ['/business', 'Overview'],
        ['/business/tasks', 'My tasks'],
        ['/business/tasks/new', 'Post a task'],
        ['/assignments', 'Assignments'],
        ['/profile', 'Company profile'],
      ];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className={`sidebar ${menu ? 'is-open' : ''}`}>
        <Brand />
        <p className="workspace-label">{student ? 'Student workspace' : 'Business workspace'}</p>
        <nav aria-label="Workspace">
          {links.map(([path, label]) => (
            <NavLink key={path} to={path} end onClick={() => setMenu(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/verification" onClick={() => setMenu(false)}>
            Identity verification
          </NavLink>
          <NavLink to="/settings" onClick={() => setMenu(false)}>
            Account settings
          </NavLink>
          <p>
            Small projects.
            <br />
            Meaningful experience.
          </p>
        </div>
      </aside>
      <div className="app-body">
        <header className="app-header">
          <Button
            variant="ghost"
            className="menu-toggle"
            aria-expanded={menu}
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            ☰
          </Button>
          <span className="muted text-sm">Your next step starts here.</span>
          <div className="row">
            <Link to="/profile" className="avatar" aria-label="View profile">
              {user.first_name[0]}
              {user.last_name[0]}
            </Link>
            <span className="header-name">{user.first_name}</span>
            <Button variant="ghost" busy={logout.isPending} onClick={() => logout.mutate()}>
              Log out
            </Button>
          </div>
        </header>
        <main id="main-content" className="workspace">
          <ErrorMessage error={logout.error} />
          <Outlet />
        </main>
        <footer className="app-footer">SkillSpring · Real work. Real growth.</footer>
      </div>
    </div>
  );
}
export function PublicLayout() {
  return (
    <>
      <header className="public-header">
        <Brand />
        <nav aria-label="Main">
          <Link to="/tasks">Explore tasks</Link>
          <Link to="/login">Log in</Link>
          <Link className="button button-primary" to="/register">
            Get started
          </Link>
        </nav>
      </header>
      <main id="main-content" className="container py-10">
        <Outlet />
      </main>
    </>
  );
}
export function TaskLayout() {
  const { user, isPending } = useAuth();
  if (isPending) return <Loading />;
  return user ? <AppLayout /> : <PublicLayout />;
}
