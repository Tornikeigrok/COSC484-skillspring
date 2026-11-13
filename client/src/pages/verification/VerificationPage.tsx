import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Field, Input, Textarea, buttonClass } from '../../components/ui';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { useCurrentUser } from '../dashboard/hooks/use-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import notice from '../../styles/notice.module.css';
import { verificationSchema } from './utils/verification-validations';
import { useSendVerificationEmail, useUniversityMatches, useSendCompanyVerifEmail } from './hooks';
import { useDebounce } from './utils/verification-validations';
import styles from './Verification.module.css';
import { VerificationShell } from './components/VerificationShell';
import { Icon } from './components/Icon';
import { BIO_MAX, GRAD_YEARS, ICONS } from './constants/verification';
import { CompanyVerificationForm } from './CompanyVerificationForm';
import {
  Dropdown,
  DropdownMenu,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownTrigger,
} from '@/ui/radix-dropdown';
import { Navigate, useNavigate } from 'react-router-dom';

export default function VerificationPage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const status =
    (user?.role === 'student' ? user.Student : user?.Company)?.verification_status ?? 'unverified';
  const [errors, setErrors] = useState<FieldErrors>({});
  const sendVerification = useSendVerificationEmail();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = verificationSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    // if everything goes thru successfuly, we make the request and direct to Code page
    // Only navigate to code page if email is sent successfuly
    setErrors({});
    sendVerification.mutate(result.data, { onSuccess: () => navigate('/verification-code') });
  }

  const [universityPicker, setUniversityPicker] = useState('');
  const debouncedUni = useDebounce(universityPicker, 700);
  const { mutate: data, data: mutateData, isSuccess, isPending, isError } = useUniversityMatches();

  useEffect(() => {
    if (debouncedUni && debouncedUni.length >= 3) {
      // Make the API fetch only if the value changes
      data(debouncedUni);
    }
  }, [debouncedUni]);

  const [gradYear, setGradYear] = useState('');
  const [bioLength, setBioLength] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const matches = mutateData ?? [];
  const listOpen = open && universityPicker.trim() !== '' && (isPending || isSuccess);
  const showList = listOpen && matches.length > 0;

  function pick(name: string) {
    setUniversityPicker(name);
    setOpen(false);
    setActive(-1);
  }

  // Company Verification func
  const {
    mutate: companyVerifEmail,
    isPending: companyVerifEmailPending,
    error: companyVerifEmailError,
    isError: companyVerifEmailErrorExists,
    reset: resetCompanyVerif,
  } = useSendCompanyVerifEmail();

  const company = user?.role === 'company';

  // Verification is one-time: verified users never come back here.
  if (status === 'verified') return <Navigate to={company ? '/business' : '/student'} replace />;

  return (
    <VerificationShell
      role={company ? 'company' : 'student'}
      step={0}
      title="Your information"
      description={
        company
          ? 'Tell us where you work. We’ll email a code to confirm it.'
          : 'Provide your academic details to start the verification process.'
      }
    >
      {company ? (
        <CompanyVerificationForm
          firstName={user.first_name}
          lastName={user.last_name}
          onSubmit={(data) => {
            companyVerifEmail(
              { workEmail: data.workEmail, website: data.website },
              { onSuccess: () => navigate('/verification-code') },
            );
          }}
          onCancel={() => navigate(-1)}
          serverError={companyVerifEmailError?.message}
          isPending={companyVerifEmailPending}
          isError={companyVerifEmailErrorExists}
          onEdit={resetCompanyVerif}
        />
      ) : (
        <form
          className={styles.form}
          onSubmit={submit}
          onChange={(e) => {
            setErrors(withoutError(errors, e.target));
            if (sendVerification.isError) sendVerification.reset();
          }}
          noValidate
        >
          <Field label="Full name" id="full_name" error={errors.full_name}>
            <div className={styles.withIcon}>
              <Icon d={ICONS.user} className={styles.fieldIcon} />
              <Input
                id="full_name"
                name="full_name"
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />
            </div>
          </Field>

          <div className={layout.fieldGrid}>
            <Field label="University" id="university" error={errors.university}>
              <div className={cx(styles.combobox, styles.withIcon)}>
                <Icon d={ICONS.university} className={styles.fieldIcon} />
                <Input
                  value={universityPicker}
                  onChange={(e) => {
                    setUniversityPicker(e.target.value);
                    setOpen(true);
                    setActive(-1);
                  }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => setOpen(false)}
                  onKeyDown={(e) => {
                    if (!showList) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActive((i) => (i + 1) % matches.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
                    } else if (e.key === 'Enter' && active >= 0) {
                      e.preventDefault();
                      pick(matches[active].name);
                    } else if (e.key === 'Escape') {
                      setOpen(false);
                    }
                  }}
                  id="university"
                  name="university"
                  placeholder="San Francisco State University"
                  autoComplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls="university-listbox"
                  aria-expanded={showList}
                  aria-activedescendant={active >= 0 ? `university-option-${active}` : undefined}
                  required
                />
                {listOpen && (
                  <ul className={styles.listbox} id="university-listbox" role="listbox">
                    {isPending && matches.length === 0 ? (
                      <li className={styles.status}>Searching…</li>
                    ) : matches.length === 0 ? (
                      <li className={styles.status}>No matching universities</li>
                    ) : (
                      matches.map((uni, i) => (
                        <li
                          key={uni.name}
                          id={`university-option-${i}`}
                          role="option"
                          aria-selected={i === active}
                          className={cx(styles.option, i === active && styles.active)}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setActive(i)}
                          onClick={() => pick(uni.name)}
                        >
                          {uni.name}
                          {uni.domains[0] && <small>{uni.domains[0]}</small>}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </Field>

            <Field label="Graduation year" id="graduation_year" error={errors.gradYear}>
              <Dropdown>
                <DropdownTrigger id="graduation_year" data-placeholder={gradYear ? undefined : ''}>
                  <span className={styles.triggerLabel}>
                    <Icon d={ICONS.calendar} className={styles.triggerIcon} />
                    {gradYear || 'Select a year'}
                  </span>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownRadioGroup
                    value={gradYear}
                    onValueChange={(year) => {
                      setGradYear(year);
                      setErrors(({ gradYear: _, ...rest }) => rest);
                    }}
                  >
                    {GRAD_YEARS.map((year) => (
                      <DropdownRadioItem key={year} value={year}>
                        {year}
                      </DropdownRadioItem>
                    ))}
                  </DropdownRadioGroup>
                </DropdownMenu>
              </Dropdown>
              <input type="hidden" name="gradYear" value={gradYear} />
            </Field>
          </div>

          <Field
            label="University email"
            id="university_email"
            error={errors.uniEmail}
            hint="We’ll send a 6-digit code here."
          >
            <div className={styles.withIcon}>
              <Icon d={ICONS.mail} className={styles.fieldIcon} />
              <Input
                id="university_email"
                name="uniEmail"
                type="email"
                placeholder="jane.doe@university.edu"
                autoComplete="email"
                required
              />
            </div>
          </Field>

          <Field label="Bio (optional)" id="bio" error={errors.bio}>
            <div className={styles.withIcon}>
              <Icon d={ICONS.file} className={styles.fieldIcon} />
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                maxLength={BIO_MAX}
                placeholder="A few lines about what you study and build…"
                onChange={(e) => setBioLength(e.target.value.length)}
              />
            </div>
            <p className={styles.counter}>
              {bioLength.toLocaleString()} / {BIO_MAX.toLocaleString()}
            </p>
          </Field>

          {sendVerification.isError && (
            <p className={cx(notice.notice, notice.error)} role="alert">
              {sendVerification.error.message}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={buttonClass('secondary', styles.cancel)}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <Button
              type="submit"
              busy={sendVerification.isPending}
              disabled={sendVerification.isError || Object.keys(errors).length > 0}
            >
              Continue
              <Icon d={ICONS.arrow} size={16} />
            </Button>
          </div>
        </form>
      )}
    </VerificationShell>
  );
}
