import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Button,
  Card,
  Field,
  Input,
  PageHeading,
  Select,
  StatusBadge,
  Textarea,
} from '../../components/ui';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { sampleProfile } from '../profile/constants/sample-profile';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import notice from '../../styles/notice.module.css';
import { verificationSchema } from './utils/verification-validations';
import { useUniversityMatches } from './hooks';
import { useDebounce } from './utils/verification-validations';
import styles from './VerificationPage.module.css';

const thisYear = new Date().getFullYear();
const years = Array.from({ length: 7 }, (_, i) => thisYear + i);
export default function VerificationPage() {

  const { user, profile } = sampleProfile;
  const [errors, setErrors] = useState<FieldErrors>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = verificationSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setErrors(toFieldErrors(result.error));
      return;
    }
    setErrors({});
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


  return (
    <div className={layout.narrowPage}>
      <PageHeading
        eyebrow="BUILDING TRUST"
        title={user.role === 'student' ? 'Student verification' : 'Business verification'}
        description="You must verify your role before being taking on the tasks."
      />
      <Card>
        <div className={layout.headerRow}>
          <h2>Verification status</h2>
          <StatusBadge status={profile.verification_status} />
        </div>
        {profile.verification_status === 'verified' ? (
          <p className={cx(notice.notice, notice.success)}>
            Your profile identity has been reviewed and verified.
          </p>
        ) : profile.verification_status === 'pending' ? (
          <p className={cx(notice.notice, notice.info)}>
            Your request is pending a manual review by the project team. It will not be marked
            verified automatically.
          </p>
        ) : (
          <form
            className={layout.formStack}
            onSubmit={submit}
            onChange={(e) => setErrors(withoutError(errors, e.target))}
            noValidate
          >
            <Field label="Full name" id="full_name" error={errors.full_name}>
              <Input id="full_name" name="full_name" placeholder="Jane Doe" required />
            </Field>
            <Field label="University" id="university" error={errors.university}>
              <div className={styles.combobox}>
                <Input
                  value={universityPicker}
                  onChange={(e) => {
                    setUniversityPicker(e.target.value);
                    setOpen(true);
                    setActive(-1);
                    if (e.target.value.trim()) setUniversityPicker(e.target.value);
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
            <Field label="Graduation year" id="graduation_year" error={errors.graduation_year}>
              <Select id="graduation_year" name="graduation_year" defaultValue="" required>
                <option value="" disabled>
                  Select year
                </option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="University email" id="university_email" error={errors.university_email}>
              <Input
                id="university_email"
                name="university_email"
                type="email"
                placeholder="jane.doe@university.edu"
                required
              />
            </Field>
            <Field label="Bio (optional)" id="bio" error={errors.bio}>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="A few lines about what you study and build."
              />
            </Field>
            <Button type="submit">Request verification</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
