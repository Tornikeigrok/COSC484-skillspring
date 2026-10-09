import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Role, User } from '../lib/types';
import { Brand, Button, ErrorMessage, Field, Input } from '../components/ui';
export default function AuthPage({ register = false }: { register?: boolean }) {
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(params.get('role') === 'company' ? 'company' : 'student');
  const cache = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const target = (current: User) => {
    const next = params.get('next');
    return next?.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
      ? next
      : current.role === 'student'
        ? '/student'
        : '/business';
  };
  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<{ user: User }>(register ? '/auth/register' : '/auth/login', { method: 'POST', body }),
    onSuccess: ({ user: current }) => {
      cache.clear();
      cache.setQueryData(['session'], current);
      navigate(target(current), { replace: true });
    },
  });
  if (user) return <Navigate to={target(user)} replace />;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    mutation.mutate(register ? { ...data, role } : data);
  }
  return (
    <div className="auth-page">
      <div className="auth-story">
        <Brand />
        <div>
          <span className="platform-label">YOUR NEXT CHAPTER</span>
          <h1>
            Turn potential
            <br />
            into proof.
          </h1>
          <p>
            Build something real. Learn from the process. Leave with experience you can point to.
          </p>
          <div className="story-steps">
            <span>01 &nbsp; Find your fit</span>
            <span>02 &nbsp; Make it happen</span>
            <span>03 &nbsp; Show your impact</span>
          </div>
        </div>
        <p className="text-sm">SkillSpring · The experience platform</p>
      </div>
      <main className="auth-main">
        <div className="auth-form">
          <Link to="/" className="text-link">
            ← Back to SkillSpring
          </Link>
          <h1>{register ? 'A stronger start.' : 'Welcome back.'}</h1>
          <p className="muted">
            {register
              ? 'Create your account and take the next step.'
              : 'Log in to keep your work moving.'}
          </p>
          {register && (
            <fieldset className="role-picker">
              <legend className="sr-only">Account type</legend>
              {(['student', 'company'] as const).map((r) => (
                <label key={r} className={role === r ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  {r === 'student' ? 'I’m a student' : 'I’m a business'}
                </label>
              ))}
            </fieldset>
          )}
          <form onSubmit={submit} className="form-stack">
            <ErrorMessage error={mutation.error} />
            {register && (
              <div className="form-grid">
                <Field label="First name" id="first_name">
                  <Input
                    id="first_name"
                    name="first_name"
                    autoComplete="given-name"
                    required
                    maxLength={80}
                  />
                </Field>
                <Field label="Last name" id="last_name">
                  <Input
                    id="last_name"
                    name="last_name"
                    autoComplete="family-name"
                    required
                    maxLength={80}
                  />
                </Field>
              </div>
            )}
            {register && role === 'company' && (
              <Field label="Company name" id="company_name">
                <Input
                  id="company_name"
                  name="company_name"
                  autoComplete="organization"
                  required
                  maxLength={160}
                />
              </Field>
            )}
            <Field label="Email address" id="email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            </Field>
            <Field
              label="Password"
              id="password"
              hint={register ? 'Use 10–72 characters. Choose a unique password.' : undefined}
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
                minLength={register ? 10 : undefined}
                maxLength={72}
                required
              />
            </Field>
            <Button type="submit" busy={mutation.isPending}>
              {register ? 'Create account' : 'Log in'} <span aria-hidden="true">→</span>
            </Button>
          </form>
          <p className="auth-switch">
            {register ? 'Already have an account?' : 'New to SkillSpring?'}{' '}
            <Link
              to={`${register ? '/login' : '/register'}${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`}
            >
              {register ? 'Log in' : 'Get started'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
