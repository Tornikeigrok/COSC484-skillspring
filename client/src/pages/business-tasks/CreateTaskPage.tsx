import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, Input, Textarea } from '../../components/ui';
import { DIFFICULTIES, DIFFICULTY_LABELS, TASK_TYPES, TASK_TYPE_LABELS } from '../../constants/tasks';
import type { TaskType } from '../../constants/tasks';
import links from '../../styles/links.module.css';
import styles from './CreateTaskPage.module.css';
import { cx } from '../../utils/cx';
import { Dropdown, DropdownMenu, DropdownRadioGroup, DropdownRadioItem, DropdownTrigger } from '@/ui/radix-dropdown';
import { createTaskSchema, CreateTaskFormData } from './utils/business-tasks-validations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';



const DIFFICULTY_HINTS: Record<(typeof DIFFICULTIES)[number], string> = {
  easy: 'A focused change a newer student can finish with little guidance.',
  medium: 'Needs some prior experience and a bit of independent problem-solving.',
  hard: 'Open-ended or technically deep. Best for experienced students.',
};

// 1536 -> "1.5 KB"
const formatSize = (bytes: number) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

export default function CreateTaskPage() {
  // '' until the company picks one
  const [taskType, setTaskType] = useState<TaskType | ''>('');

  // only used to show the picked file's name and size
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  function clearFile() {
    if (fileRef.current) {
      setFile(null);
      fileRef.current.value = '';
    }
  }
  
  // const { register, handleSubmit, formState: { errors }} = useForm({
  //   resolver: zodResolver(createTaskSchema),
  // });

  // const submitTask = (data: CreateTaskFormData) => {
  //   // API endpoint call to create a task
  // }

  return (
    <div className={styles.page}>
      <Link to="/business/tasks" className={links.backLink}>
        ← My tasks
      </Link>

      <header className={styles.header}>
        <h1>Post a new task</h1>
        <p>A task is a small, well-scoped piece of work for a student. Be specific about the problem, the deliverable, and what done looks like.</p>
      </header>
      <p className={styles.required}>Required fields are marked with an asterisk (*).</p>

      {/* preventDefault only stops a full page reload until submitting is wired up */}
      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <section className={styles.section}>
          <Field label="Task title *" id="title" hint="Short and specific, 5–160 characters.">
            <Input id="title" name="title" placeholder="Build a responsive analytics dashboard" />
          </Field>
          <Field
            label="Description *"
            id="description"
            hint="The problem, the deliverable, and how you'll review it. Public information only."
          >
            <Textarea
              id="description"
              name="description"
              rows={8}
              placeholder="We need a dashboard that shows weekly signups by channel. The finished work should…"
            />
          </Field>
        </section>

        <section className={styles.section}>
          <div className={styles.typeField}>
            <Field label="Task type *" id="task_type" hint={taskType ? TASK_TYPE_LABELS[taskType].hint : 'Helps the right students find your task.'}>
              {/* hidden input carries the picked value with the form */}
              <input type="hidden" name="task_type" value={taskType} />
              <Dropdown>
                <DropdownTrigger id="task_type" data-placeholder={taskType ? undefined : ''}>
                  {taskType ? TASK_TYPE_LABELS[taskType].label : 'Select a task type'}
                </DropdownTrigger>
                <DropdownMenu>
                  {/* 'none' isn't a real task type; it clears the pick back to the placeholder */}
                  <DropdownRadioGroup
                    value={taskType || 'none'}
                    onValueChange={(value) => setTaskType(value === 'none' ? '' : (value as TaskType))}
                  >
                    <DropdownRadioItem value='none'>None</DropdownRadioItem>
                    {TASK_TYPES.map((type) => (
                      <DropdownRadioItem key={type} value={type}>
                        {TASK_TYPE_LABELS[type].label}
                      </DropdownRadioItem>
                    ))}
                  </DropdownRadioGroup>
                </DropdownMenu>
              </Dropdown>
            </Field>
          </div>
        </section>

        <section className={styles.section}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Difficulty *</legend>
            <div className={styles.radioList}>
              {DIFFICULTIES.map((value) => (
                <label key={value} className={styles.radio}>
                  <input type="radio" name="difficulty" value={value} defaultChecked={value === 'medium'} />
                  <span>
                    <span className={styles.radioLabel}>{DIFFICULTY_LABELS[value]}</span>
                    <span className={styles.radioHint}>{DIFFICULTY_HINTS[value]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.hoursField}>
            <Field label="Estimated hours" id="estimated_hours" hint="Whole hours, 1–500. Optional.">
              <Input
                id="estimated_hours"
                name="estimated_hours"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                defaultValue={6}
              />
            </Field>
          </div>

          <Field label="Files" id="files" hint="A single .zip with the document(s) needed to complete the task.">
            <div className={cx(styles.dropzone, file && styles.dropzoneFilled)}>
              {/* the invisible input covers the whole box, so clicking and native drag-and-drop both work */}
              <input
                ref={fileRef}
                id="files"
                name="files"
                type="file"
                accept=".zip,application/zip"
                className={styles.fileInput}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <svg className={styles.dropIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
                <path d="M12 18v-6m-3 3 3-3 3 3" />
              </svg>
              {file ? (
                <p className={styles.dropText}>
                  <strong>{file.name}</strong>
                  <span>{formatSize(file.size)} · click or drop to replace</span>
                  
                </p>
              ) : (
                <p className={styles.dropText}>
                  <strong>
                    Drop a .zip here or <span className={styles.browse}>choose a file</span>
                  </strong>
                  <span>One file, .zip only</span>
                </p>
              )}
            </div>
          </Field>
          {file && (
          <button type="button" className={styles.clearFile} onClick={clearFile}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            Remove file
          </button>
        )}
        </section>
        <footer className={styles.footer}>
          <p>You can add private files after the task is created.</p>
          <Button>Post task</Button>
        </footer>
      </form>
    </div>
  );
}
