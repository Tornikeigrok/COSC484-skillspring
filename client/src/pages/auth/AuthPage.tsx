import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Role } from '../../lib/types';
import { Brand, Button, Field, FieldError, Input } from '../../components/ui';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import { AUTH_POINTS } from './constants/auth-points';
import { ROLES, ROLE_LABELS } from './constants/roles';
import { useCompanyRegister, useRegister } from './hooks/use-auth-hooks';
import {
  loginSchema,
  registerCompanySchema,
  registerStudentSchema,
} from './utils/auth-validations';
import type { RegisterCompanyFormData, RegisterStudentFormData } from './utils/auth-validations';
import { useForm } from 'react-hook-form';
import type { FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import styles from './AuthPage.module.css';

export default function AuthPage({ register = false }: { register?: boolean }) {
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(params.get('role') === 'company' ? 'company' : 'student');
  const navigate = useNavigate();

  // Company registration part
  const companyMutation = useCompanyRegister();

  const { register: companyRegister, handleSubmit: companyRegisterHandle, formState: { errors: companyRegErrors }} = useForm({
     resolver: zodResolver(registerCompanySchema),
  });

  const handleCompanyReg = (data: RegisterCompanyFormData) => {
    companyMutation.mutate(
      {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        password: data.password,
        companyName: data.companyName,
      },
      { onSuccess: () => navigate('/business') },
    );
  }

  // Student registration part
  const studentMutation = useRegister();

  const { register: studentRegister, handleSubmit: studentRegisterHandle, formState: { errors: studentRegErrors }} = useForm({
     resolver: zodResolver(registerStudentSchema),
  });

  const handleStudentReg = (data: RegisterStudentFormData) => {
    studentMutation.mutate(
      {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        password: data.password,
      },
      { onSuccess: () => navigate('/student') },
    );
  }

  const { register: loginRegister, handleSubmit: loginHandle, formState: { errors: loginErrors }} = useForm({
     resolver: zodResolver(loginSchema),
  });

  const company = register && role === 'company';
  const onSubmit = !register
    ? loginHandle(() => {})
    : company
      ? companyRegisterHandle(handleCompanyReg)
      : studentRegisterHandle(handleStudentReg);
  const field = (name: 'first_name' | 'last_name' | 'email' | 'password') =>
    !register
      ? loginRegister(name as 'email' | 'password')
      : company
        ? companyRegister(name)
        : studentRegister(name);
  // company errors are a superset of the other two, so one type covers every field
  const errors = (!register ? loginErrors : company ? companyRegErrors : studentRegErrors) as FieldErrors<RegisterCompanyFormData>;
  const mutation = company ? companyMutation : studentMutation;

  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <Brand className={styles.brand} />
        <div className={styles.hideOnMobile}>
          <h1 className={styles.title}>
            Turn potential
            <br />
            into proof.
          </h1>
          <p className={styles.lead}>
            Real tasks from real companies. Build locally, get reviewed, and keep a verified record
            of your work.
          </p>
          <ol className={styles.points}>
            {AUTH_POINTS.map(([title, description]) => (
              <li key={title}>
                <strong>{title}</strong>
                <span>{description}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className={cx(styles.asideFooter, styles.hideOnMobile)}>
          © {new Date().getFullYear()} SkillSpring
        </p>
      </aside>
      <main className={styles.main}>
        <div className={styles.panel}>
          <Link to="/" className={cx(links.textLink, styles.back)}>
            ← Back to SkillSpring
          </Link>
          <h1 className={styles.heading}>{register ? 'A stronger start.' : 'Welcome back.'}</h1>
          <p className={text.muted}>
            {register
              ? 'Create your account and take the next step.'
              : 'Log in to keep your work moving.'}
          </p>
          {register && (
            <fieldset className={styles.roles}>
              <legend className={styles.srOnly}>Account type</legend>
              {ROLES.map((r) => (
                <label key={r} className={cx(styles.role, role === r && styles.roleActive)}>
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                  />
                  {ROLE_LABELS[r]}
                </label>
              ))}
            </fieldset>
          )}
          {!register && (
            <>
              <a className={styles.github} href={`${import.meta.env.VITE_API_URL ?? ''}/api/auth/github`}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
                </svg>
                Continue with GitHub
              </a>
              <div className={styles.divider}>
                <span>or log in with email</span>
              </div>
            </>
          )}
          <form
            onSubmit={onSubmit}
            // a new keystroke clears the last server error
            onChange={() => mutation.reset()}
            noValidate
            className={layout.formStack}
          >
            {register && (
              <div className={styles.nameFields}>
                <Field label="First name" id="first_name" error={errors.first_name?.message}>
                  <Input {...field('first_name')} id="first_name" autoComplete="given-name" />
                </Field>
                <Field label="Last name" id="last_name" error={errors.last_name?.message}>
                  <Input {...field('last_name')} id="last_name" autoComplete="family-name" />
                </Field>
              </div>
            )}
            {company && (
              <Field label="Company name" id="company_name" error={errors.companyName?.message}>
                <Input {...companyRegister('companyName')} id="company_name" autoComplete="organization" />
              </Field>
            )}
            <Field label="Email address" id="email" error={errors.email?.message}>
              <Input {...field('email')} id="email" type="email" autoComplete="email" />
            </Field>
            <Field
              label="Password"
              id="password"
              error={errors.password?.message}
            >
              <Input
                {...field('password')}
                id="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
              />
            </Field>
            <FieldError message={register ? mutation.error?.message : undefined} />
            <Button type="submit" busy={mutation.isPending}>
              {mutation.isPending ? 'Creating account...' : register ? 'Create account' : 'Log in'} <span aria-hidden="true">→</span>
            </Button>
          </form>
          <p className={styles.switch}>
            {register ? 'Already have an account?' : 'New to SkillSpring?'}{' '}
            <Link
              to={`${register ? '/login' : '/register'}${params.get('next') ? `?next=${encodeURIComponent(params.get('next')!)}` : ''}`}
              className={styles.switchLink}
            >
              {register ? 'Log in' : 'Get started'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
