import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Role } from '../../lib/types';
import { Brand, Button, Field, FieldError, Input } from '../../components/ui';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { AUTH_POINTS } from './constants/auth-points';
import { ROLES, ROLE_LABELS } from './constants/roles';
import { useRegister } from './hooks/use-auth-hooks';
import {
  loginSchema,
  registerCompanySchema,
  registerStudentSchema,
} from './utils/auth-validations';
import type { RegisterStudentFormData } from './utils/auth-validations';
import styles from './AuthPage.module.css';
export default function AuthPage({ register = false }: { register?: boolean }) {
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(params.get('role') === 'company' ? 'company' : 'student');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const registerStudent = useRegister();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const schema = !register
      ? loginSchema
      : role === 'company'
        ? registerCompanySchema
        : registerStudentSchema;
    const result = schema.safeParse(data);
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
    setServerError('');
    if (register && role === 'student') {
      const { first_name, last_name, email, password } = result.data as RegisterStudentFormData;
      registerStudent.mutate(
        { firstName: first_name, lastName: last_name, email, password },
        {
          onSuccess: () => navigate('/student'),
          onError: (error) => setServerError(error.message),
        },
      );
    }
  }
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
          <form
            onSubmit={submit}
            onChange={(e) => {
              setErrors(withoutError(errors, e.target));
              setServerError('');
            }}
            noValidate
            className={layout.formStack}
          >
            {register && (
              <div className={styles.nameFields}>
                <Field label="First name" id="first_name" error={errors.first_name}>
                  <Input id="first_name" name="first_name" autoComplete="given-name" />
                </Field>
                <Field label="Last name" id="last_name" error={errors.last_name}>
                  <Input id="last_name" name="last_name" autoComplete="family-name" />
                </Field>
              </div>
            )}
            {register && role === 'company' && (
              <Field label="Company name" id="company_name" error={errors.company_name}>
                <Input id="company_name" name="company_name" autoComplete="organization" />
              </Field>
            )}
            <Field label="Email address" id="email" error={errors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" />
            </Field>
            <Field
              label="Password"
              id="password"
              error={errors.password}
            >
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={register ? 'new-password' : 'current-password'}
              />
            </Field>
            <FieldError message={serverError} />
            <Button type="submit" busy={registerStudent.isPending}>
              {registerStudent.isPending ? 'Creating account...' : register ? 'Create account' : 'Log in'} <span aria-hidden="true">→</span>
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
