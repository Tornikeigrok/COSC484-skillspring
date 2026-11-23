import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Field, Textarea } from '../../components/ui';
import { Icon } from '../business-tasks/components/Icon';
import { FORM_ICONS } from '../business-tasks/constants/create-task';
import { formatSize } from '../business-tasks/utils/format-size';
import { cx } from '../../utils/cx';
import styles from './SubmitWorkPage.module.css';
import { latestSubmission, useDisplayMyWork, useSubmitTask } from './hooks';
import { submissionSchema, SubmissionFormData } from './utils/assignments-validations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SubmissionPage from './SubmissionPage';


const MAX_SIZE = 50 * 1024 * 1024;

const CHECKLIST = [
  'A README with setup and run instructions',
  'No node_modules, .git, or build output',
  'No secrets, API keys, or .env files',
  'Under 50 MB as a single .zip',
];

const NEXT_STEPS = [
  ['Automatic checks', 'We scan the archive for size, structure, and leaked credentials.'],
  ['Company review', 'The company reviews your work and runs it on their side.'],
  ['Feedback', 'The company approves your work or shares feedback with you.'],
];

function zipError(file: File) {
  if (!file.name.toLowerCase().endsWith('.zip')) return 'Only .zip files are accepted';
  if (file.size > MAX_SIZE) return 'The zip must be under 50 MB';
  return '';
}

export default function SubmitWorkPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  function pickFile(picked: File | null) {
    setFile(picked);
    setValue('file', picked as File, { shouldValidate: true });
    setFileError(picked ? zipError(picked) : '');
  }

  function clearFile() {
    pickFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const { mutate: submitTask } = useSubmitTask(taskId);

  const { register, handleSubmit, setValue, formState: { errors }} = useForm({
    resolver: zodResolver(submissionSchema),
  });

  const [openSubmission, setOpenSubmision] = useState(false);
  const submit = (data: SubmissionFormData) => {
    submitTask({ file: data.file, notes: data.notes},
      { onSuccess: () => {
        setOpenSubmision(true);
      }});
  }

  // One submission per task: already submitted goes back to the task page.
  // Skipped while the success popup is open, closing it then lands on the task page.
  const { data: myWork } = useDisplayMyWork();
  const submitted = latestSubmission(myWork?.find((w) => w.Task.id === Number(taskId)));
  if (submitted && !openSubmission) return <Navigate to={`/assignment/${taskId}`} replace />;

  return (
    <div className={styles.page}>
      <SubmissionPage open={openSubmission} onOpenChange={setOpenSubmision}/>
      
      <Link className={styles.back} to={`/assignment/${taskId}`}>
        <Icon d="M19 12H5M11 6l-6 6 6 6" className={styles.icon} />
        Back to task
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Submit your work</h1>
        <p className={styles.subtitle}>
          Upload your finished solution. You can only submit once, so double-check it first.
        </p>
      </header>

      <div className={styles.grid}>
        <form className={styles.card} onSubmit={handleSubmit(submit)} noValidate>
          <Field label="Solution" id="solution" error={fileError}>
            <div className={cx(styles.dropzone, file && !fileError && styles.filled)}>
              {/* invisible input covers the box, so click and native drag-and-drop both work */}
              <input 
                ref={fileRef}
                id="solution"
                type="file"
                accept=".zip,application/zip"
                className={styles.fileInput}
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
              <span className={styles.dropIcon}>
                <Icon d={FORM_ICONS.upload} className={styles.icon} />
              </span>
              {file ? (
                <p className={styles.dropText}>
                  <strong>{file.name}</strong>
                  <span>{formatSize(file.size)} · click or drop to replace</span>
                </p>
              ) : (
                <p className={styles.dropText}>
                  <strong>Drop your .zip here, or click to browse</strong>
                  <span>.zip only, up to 50 MB</span>
                </p>
              )}
            </div>
            {file && (
              <button type="button" className={styles.remove} onClick={clearFile}>
                <Icon d={FORM_ICONS.trash} className={styles.icon} />
                Remove
              </button>
            )}
          </Field>

          <Field label="Notes for the reviewer" id="notes">
            <Textarea
              {...register('notes')}
              id="notes"
              name="notes"
              rows={5}
              className={styles.notes}
              placeholder="What did you build, how did you test it, and anything the reviewer should know."
            />
          </Field>

          <label className={styles.confirm}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirm this is my own work and contains no secrets or credentials.
          </label>

          <div className={styles.footer}>
            <Link className={styles.cancel} to={`/assignment/${taskId}`}>
              Cancel
            </Link>
            <Button type="submit" variant="dark" disabled={!confirmed} className={styles.submit}>
              Submit work
            </Button>
          </div>
        </form>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Before you submit</h2>
            <ul className={styles.checklist}>
              {CHECKLIST.map((item) => (
                <li key={item}>
                  <Icon d="M20 6 9 17l-5-5" className={styles.check} />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>What happens next</h2>
            <ol className={styles.steps}>
              {NEXT_STEPS.map(([title, body]) => (
                <li key={title}>
                  <strong>{title}</strong>
                  <span>{body}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
