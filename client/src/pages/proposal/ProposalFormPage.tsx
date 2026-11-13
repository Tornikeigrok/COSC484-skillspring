import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  DateLabel,
  ErrorMessage,
  Field,
  Loading,
  Textarea,
  buttonClass,
} from '../../components/ui';
import { DIFFICULTY_LABELS, TASK_TYPE_LABELS } from '../../constants/tasks';
import {
  Dropdown,
  DropdownMenu,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownTrigger,
} from '@/ui/radix-dropdown';
import { Icon } from '../business-tasks/components/Icon';
import { FORM_ICONS, TOOLBAR } from '../business-tasks/constants/create-task';
import { applyTool } from '../business-tasks/utils/markdown-editor';
import styles from './ProposalFormPage.module.css';
import { useGetTaskDetails } from '@/pages/discover/hooks/index';
import { proposalSchema, ProposalFormData } from './utils/proposal-validations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { formatHours } from './utils/format-hours';
import {
  APPROACH_MAX,
  HOUR_OPTIONS,
  ICON,
  ICONS,
  QUESTIONS_MAX,
  REFERENCES,
} from './constants/proposal-form';
import type { HourPick } from './constants/proposal-form';
import { useSendProposal } from './hooks';
import { toast } from 'sonner';




export default function ProposalFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: task, isPending, error, refetch } = useGetTaskDetails(id);
  const approachRef = useRef<HTMLTextAreaElement | null>(null);
  const [approachLength, setApproachLength] = useState(0);
  const [questionsLength, setQuestionsLength] = useState(0);
  const [pickedHours, setPickedHours] = useState<string>();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(proposalSchema),
    values: task?.estimated_hours
      ? { message: '', proposed_hours: task.estimated_hours }
      : undefined,
  });
  const messageField = register('message');

  const { mutate: sendProposal, isPending: sending, error: sendError } = useSendProposal();
  const submit = (data: ProposalFormData) => {
    if (!id) return;
    sendProposal({
      taskId: id,
      approach: data.message,
      est_hrs: data.proposed_hours,
      questions: data.questions,
    }, { onSuccess: () => {
      toast.success('You have sent the proposal');
      navigate('/student/proposals');
    }});
  };

  if (isPending) return <Loading />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;

  // default to the company's estimate until the student picks their own
  const hours = pickedHours ?? (task.estimated_hours ? String(task.estimated_hours) : undefined);

  return (
    <div className={styles.page}>
      <form className={styles.form} noValidate onSubmit={handleSubmit(submit)}>
        <header>
          <Link className={styles.back} to="/tasks">
            <svg {...ICON} width={16} height={16}>
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Back to tasks
          </Link>
          <h1 className={styles.title}>Submit proposal</h1>
          <p className={styles.subtitle}>
            Share your approach, any questions, and how long you expect this task to take.
          </p>
        </header>

        <Field label="Your approach" id="message" error={errors.message?.message}>
          <div className={styles.editor}>
            <Textarea
              {...messageField}
              ref={(el) => {
                messageField.ref(el);
                approachRef.current = el;
              }}
              id="message"
              rows={7}
              maxLength={APPROACH_MAX}
              className={styles.editorInput}
              placeholder="Outline your approach, key steps, and how you’ll deliver it…"
              onChange={(e) => {
                messageField.onChange(e);
                setApproachLength(e.target.value.length);
              }}
            />
            <div
              className={styles.toolbar}
              role="toolbar"
              aria-label="Formatting"
              aria-controls="message"
            >
              {TOOLBAR.map((tool, i) =>
                tool ? (
                  <button
                    key={tool.label}
                    type="button"
                    className={styles.tool}
                    onClick={() => applyTool(approachRef.current, tool)}
                    aria-label={tool.label}
                    title={tool.label}
                  >
                    <Icon d={tool.icon} className={styles.icon} />
                  </button>
                ) : (
                  <span key={i} className={styles.divider} />
                ),
              )}
              <span className={styles.toolbarCount} aria-live="polite">
                {approachLength.toLocaleString()} / {APPROACH_MAX.toLocaleString()}
              </span>
            </div>
          </div>
        </Field>

        <Field
          label="Your estimated time"
          id="estimated_hours"
          className={styles.half}
          error={errors.proposed_hours?.message}
        >
          <Dropdown>
            <DropdownTrigger id="estimated_hours" className={styles.control}>
              <span className={styles.value}>
                <Icon d={ICONS.clock} className={styles.icon} />
                {hours ? formatHours(Number(hours)) : 'Select hours'}
              </span>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownRadioGroup
                value={hours}
                onValueChange={(value) => {
                  const picked = Number(value) as HourPick;
                  setPickedHours(String(picked));
                  setValue('proposed_hours', picked);
                }}
              >
                {HOUR_OPTIONS.map((h) => (
                  <DropdownRadioItem key={h} value={String(h)}>
                    {h} {h === 1 ? 'hour' : 'hours'}
                  </DropdownRadioItem>
                ))}
              </DropdownRadioGroup>
            </DropdownMenu>
          </Dropdown>
        </Field>

        <Field label="Questions (optional)" id="questions">
          <Textarea
            id="questions"
            name="questions"
            rows={4}
            maxLength={QUESTIONS_MAX}
            placeholder="Any questions for the company?"
            onChange={(e) => setQuestionsLength(e.target.value.length)}
          />
          <span className={styles.count} aria-live="polite">
            {questionsLength.toLocaleString()} / {QUESTIONS_MAX.toLocaleString()}
          </span>
        </Field>

        <ErrorMessage error={sendError} />

        <div className={styles.actions}>
          <Link to={`/tasks/${id}`} className={buttonClass('secondary')}>
            Cancel
          </Link>
          <Button
            type="submit"
            className={styles.submit}
            disabled={task.status !== 'open'}
            busy={sending}
          >
            <Icon d={ICONS.send} className={styles.icon} />
            Submit proposal
          </Button>
        </div>
      </form>

      <aside className={styles.aside}>
        <p className={styles.eyebrow}>Task</p>
        <div className={styles.taskHead}>
          <h2 className={styles.taskTitle}>{task.title}</h2>
          <Link to={`/tasks/${id}`} className={styles.iconLink} aria-label="Open task details">
            <Icon d={ICONS.external} className={styles.icon} />
          </Link>
        </div>
        <p className={styles.muted}>{task.description}</p>

        <dl className={styles.facts}>
          <div>
            <dt>
              <Icon d={FORM_ICONS.code} className={styles.icon} />
              Type
            </dt>
            <dd>
              <Badge>{TASK_TYPE_LABELS[task.task_type]?.label ?? task.task_type}</Badge>
            </dd>
          </div>
          <div>
            <dt>
              <Icon d={ICONS.bars} className={styles.icon} />
              Difficulty
            </dt>
            <dd>
              <Badge tone={task.difficulty === 'easy' ? 'success' : 'warning'}>
                {DIFFICULTY_LABELS[task.difficulty] ?? task.difficulty}
              </Badge>
            </dd>
          </div>
          <div>
            <dt>
              <Icon d={ICONS.clock} className={styles.icon} />
              Estimated time
            </dt>
            <dd>{task.estimated_hours !== null ? formatHours(task.estimated_hours) : '—'}</dd>
          </div>
          <div>
            <dt>
              <Icon d={ICONS.calendar} className={styles.icon} />
              Posted
            </dt>
            <dd>
              <DateLabel value={task.created_at} />
            </dd>
          </div>
        </dl>

        <section className={styles.files}>
          <h3>Starter files</h3>
          <div className={styles.locked}>
            <Icon d={ICONS.lock} className={styles.icon} />
            <p>
              Starter files unlock once your proposal is approved. Submit your proposal first. If
              the company selects you, the files will be available here.
            </p>
          </div>
        </section>

        <section className={styles.files}>
          <h3>References</h3>
          <ul className={styles.refs}>
            {REFERENCES.map((name) => (
              // ponytail: placeholder rows, link to real URLs once tasks carry references
              <li key={name}>
                <Icon d={FORM_ICONS.link} className={styles.icon} />
                <span>{name}</span>
                <Icon d={ICONS.external} className={styles.icon} />
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
