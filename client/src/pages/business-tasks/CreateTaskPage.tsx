import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Field, FieldError, Input, Textarea, buttonClass } from '../../components/ui';
import { DIFFICULTIES, DIFFICULTY_LABELS, TASK_TYPES, TASK_TYPE_LABELS } from '../../constants/tasks';
import type { TaskType } from '../../constants/tasks';
import styles from './CreateTaskPage.module.css';
import { cx } from '../../utils/cx';
import { Dropdown, DropdownMenu, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger } from '@/ui/radix-dropdown';
import { createTaskSchema, CreateTaskFormData } from './utils/business-tasks-validations';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePostTask } from './hooks';
import { toast } from 'sonner';
import { Icon } from './components/Icon';
import { FORM_ICONS, TITLE_MAX, TOOLBAR, TYPE_ICONS } from './constants/create-task';
import { formatSize } from './utils/format-size';
import { applyTool, runHistory } from './utils/markdown-editor';
import { useFetchCompanyProfile } from '../dashboard/hooks/use-profile';



export default function CreateTaskPage() {
  

  const { data: user } = useFetchCompanyProfile();
  // wait for the profile so verified companies don't see a flash of the locked form
  const status = user?.Company.verification_status;
  const locked = !!status && status !== 'verified';

  // '' until the company picks one
  const [taskType, setTaskType] = useState<TaskType | ''>('');

  // only used to show the picked file's name and size
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const navigate = useNavigate();
  const { mutate: postTask, isPending } = usePostTask();

  const { register, control, handleSubmit, setValue, setError, formState: { errors }} = useForm({
    resolver: zodResolver(createTaskSchema),
    shouldFocusError: false,
  });

  const titleLength = useWatch({ control, name: 'title' })?.length ?? 0;

  // the toolbar edits the textarea directly, so keep our own handle next to react-hook-form's
  const descRef = useRef<HTMLTextAreaElement | null>(null);
  const descField = register('description');

  async function pickFile(picked: File | null) {
    setFile(picked);
    if (picked) {
      setValue('file', picked, { shouldValidate: true });
    }
  }

  function clearFile() {
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const submitTask = (data: CreateTaskFormData) => {
    postTask({
      taskTitle: data.title,
      taskDesc: data.description,
      taskType: data.task_type,
      difficulty: data.difficulty,
      estimated_hours: data.estimated_hours,
      file: data.file,
    }, { onSuccess: () => {
      navigate('/business/tasks');
      toast.success('You have successfully created a task');
    }});
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Post a new task</h1>
        <p>Get help from verified students on a specific technical task.</p>
      </header>

      {locked && (
        <div className={styles.verifyBanner} role="status">
          <Icon d={FORM_ICONS.info} className={styles.icon} />
          <div>
            <strong>Verify your company to publish tasks</strong>
            <p>Only verified companies can post tasks to students. Complete verification to unlock this form.</p>
          </div>
          <Link to="/verification" className={buttonClass('dark', styles.verifyAction)}>
            Verify company
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(submitTask)} noValidate>
        {/* a disabled fieldset natively disables every input and button inside it */}
        <fieldset disabled={locked} className={styles.lock}>
        <div className={styles.grid}>
          <section className={styles.card}>
            <Field error={errors.title?.message} label="Title *" id="title">
              <Input
                {...register('title')}
                id="title"
                maxLength={TITLE_MAX}
                className={styles.control}
                placeholder="e.g. Build a responsive analytics dashboard"
              />
              <span className={styles.counter} aria-live="polite">
                {titleLength} / {TITLE_MAX}
              </span>
            </Field>

            <Field error={errors.description?.message} label="Description *" id="description">
              <div className={styles.editor}>
                <div className={styles.toolbar} role="toolbar" aria-label="Formatting" aria-controls="description">
                  <span className={styles.format}>Markdown</span>
                  <span className={styles.divider} />
                  {TOOLBAR.map((tool, i) =>
                    tool ? (
                      <button key={tool.label} type="button" className={styles.tool} onClick={() => applyTool(descRef.current, tool)} aria-label={tool.label} title={tool.label}>
                        <Icon d={tool.icon} className={styles.icon} />
                      </button>
                    ) : (
                      <span key={i} className={styles.divider} />
                    ),
                  )}
                  <span className={styles.toolbarEnd}>
                    <button type="button" className={styles.tool} onClick={() => runHistory(descRef.current, 'undo')} aria-label="Undo" title="Undo">
                      <Icon d={FORM_ICONS.undo} className={styles.icon} />
                    </button>
                    <button type="button" className={styles.tool} onClick={() => runHistory(descRef.current, 'redo')} aria-label="Redo" title="Redo">
                      <Icon d={FORM_ICONS.redo} className={styles.icon} />
                    </button>
                  </span>
                </div>
                <Textarea
                  {...descField}
                  ref={(el) => {
                    descField.ref(el);
                    descRef.current = el;
                  }}
                  id="description"
                  rows={8}
                  className={styles.editorInput}
                  placeholder="Describe the problem, expected deliverable, and any important context…"
                />
              </div>
            </Field>

            <Field error={errors.file?.message} label="Starter files (ZIP) *" id="file">
              <div className={cx(styles.dropzone, file && styles.dropzoneFilled)}>
                {/* the invisible input covers the whole box, so clicking and native drag-and-drop both work */}
                <input
                  ref={fileRef}
                  id="file"
                  type="file"
                  accept=".zip,application/zip"
                  className={styles.fileInput}
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
                <Icon d={FORM_ICONS.upload} className={styles.dropIcon} />
                {file ? (
                  <p className={styles.dropText}>
                    <strong>{file.name}</strong>
                    <span>{formatSize(file.size)} · click or drop to replace</span>
                  </p>
                ) : (
                  <p className={styles.dropText}>
                    <span className={styles.dropTitle}>
                      <strong>Upload a .zip file</strong> or drag and drop
                    </span>
                    <span>.zip only, up to 50 MB</span>
                  </p>
                )}
              </div>
              {file ? (
                <button type="button" className={styles.clearFile} onClick={clearFile}>
                  <Icon d={FORM_ICONS.trash} className={styles.icon} />
                  Remove file
                </button>
              ) : (
                <p className={styles.note}>
                  <Icon d={FORM_ICONS.info} className={styles.icon} />
                  Each file inside the archive must be under 10 MB.
                </p>
              )}
              
            </Field>
          </section>

          <aside className={styles.card}>
            <h2 className={styles.cardTitle}>Task settings</h2>

            <Field error={errors.task_type?.message} label="Type *" id="task_type">
              <Dropdown>
                <DropdownTrigger id="task_type" className={styles.control} data-placeholder={taskType ? undefined : ''}>
                  <span className={styles.typeValue}>
                    {taskType && <Icon d={TYPE_ICONS[taskType]} className={styles.icon} />}
                    {taskType ? TASK_TYPE_LABELS[taskType].label : 'Select a task type'}
                  </span>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownRadioGroup
                    value={taskType}
                    onValueChange={(value) => {
                      const picked = value as TaskType;
                      setTaskType(picked);
                      setValue('task_type', picked, { shouldValidate: true });
                    }}
                  >
                    {TASK_TYPES.map((type) => (
                      <DropdownRadioItem key={type} value={type}>
                        <span className={styles.typeValue}>
                          <Icon d={TYPE_ICONS[type]} className={styles.icon} />
                          {TASK_TYPE_LABELS[type].label}
                        </span>
                      </DropdownRadioItem>
                    ))}
                  </DropdownRadioGroup>
                </DropdownMenu>
              </Dropdown>
            </Field>

            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>Difficulty *</legend>
              <div className={styles.segmented}>
                {DIFFICULTIES.map((value, level) => (
                  <label key={value} className={styles.segment}>
                    <input {...register('difficulty')} type="radio" value={value} defaultChecked={value === 'medium'} />
                    {/* signal-strength bars: one more filled bar per level */}
                    <svg className={styles.bars} viewBox="0 0 16 16" aria-hidden="true">
                      {[0, 1, 2].map((bar) => (
                        <rect key={bar} x={2 + bar * 5} y={10 - bar * 4} width="3" height={4 + bar * 4} rx="1" data-on={bar <= level || undefined} />
                      ))}
                    </svg>
                    {DIFFICULTY_LABELS[value]}
                  </label>
                ))}
              </div>
              <FieldError id="difficulty-error" message={errors.difficulty?.message} />
            </fieldset>

            <Field error={errors.estimated_hours?.message} label="Estimated hours *" id="estimated_hours">
              <Input
                {...register('estimated_hours')}
                id="estimated_hours"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                defaultValue={6}
                className={styles.control}
              />
            </Field>

            <div className={styles.callout}>
              <Icon d={FORM_ICONS.info} className={styles.icon} />
              <div>
                <strong>Before publishing</strong>
                <p>Share only the files needed to complete this task. Do not include private repositories, credentials, or production data.</p>
              </div>
            </div>
          </aside>
        </div>
        </fieldset>

        <footer className={styles.footer}>
          <Button type="submit" variant="dark" busy={isPending} disabled={locked} className={styles.action}>
            Publish task
          </Button>
        </footer>
      </form>
    </div>
  );
}
