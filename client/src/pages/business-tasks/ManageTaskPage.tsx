import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fullName } from '../../lib/types';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  PageHeading,
  StatusBadge,
  buttonClass,
} from '../../components/ui';
import { toFieldErrors, withoutError } from '../../utils/form-errors';
import type { FieldErrors } from '../../utils/form-errors';
import { sampleAssignments } from '../assignments/constants/sample-assignments';
import { sampleTask } from '../../constants/sample';
import { sampleStarterFiles, sampleTaskProposals } from './constants/sample-tasks';
import { cx } from '../../utils/cx';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import notice from '../../styles/notice.module.css';
import text from '../../styles/text.module.css';
import { uploadStarterSchema } from './utils/business-tasks-validations';
import styles from './ManageTaskPage.module.css';

export default function ManageTaskPage() {
  const { id } = useParams();
  const proposals = sampleTaskProposals;
  const files = sampleStarterFiles;
  const [uploadErrors, setUploadErrors] = useState<FieldErrors>({});
  function uploadFile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = uploadStarterSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setUploadErrors(toFieldErrors(result.error));
      return;
    }
    setUploadErrors({});
  }
  const current = sampleTask;
  const assigned = sampleAssignments.find((a) => a.task.id === id);
  return (
    <>
      <Link className={links.backLink} to="/business/tasks">
        ← My tasks
      </Link>
      <PageHeading
        eyebrow="TASK MANAGEMENT"
        title={current.title}
        action={<StatusBadge status={current.status} />}
      />
      {assigned && (
        <div className={cx(notice.notice, notice.success, notice.withAction)}>
          <span>This task has an assignment.</span>
          <Link className={buttonClass()} to={`/assignments/${assigned.id}`}>
            Open assignment →
          </Link>
        </div>
      )}
      <div className={layout.split}>
        <div>
          <div className={layout.sectionBar}>
            <h2>Student proposals</h2>
            <span className={text.muted}>{proposals.length} received</span>
          </div>
          {proposals.length ? (
            <div className={layout.stack}>
              {proposals.map((proposal) => (
                <Card key={proposal.id}>
                  <div className={layout.headerRow}>
                    <h3>
                      <Link to={`/profiles/${proposal.student.id}`}>
                        {fullName(proposal.student)}
                      </Link>
                    </h3>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <p className={text.mutedSmall}>
                    Estimated effort: {proposal.estimated_hours} hours
                  </p>
                  <p className={text.longText}>{proposal.message}</p>
                  <Link className={links.textLink} to={`/profiles/${proposal.student.id}`}>
                    View student profile →
                  </Link>
                  {current.status === 'open' && proposal.status === 'pending' && (
                    <ConfirmDialog
                      trigger={<Button className={styles.actionButton}>Select student</Button>}
                      title={`Select ${fullName(proposal.student)}?`}
                      description="This creates one assignment and closes the other proposals. Starter files will be locked for editing."
                    >
                      <Button>Confirm selection</Button>
                    </ConfirmDialog>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="The right introduction is on its way.">
              Students can now discover your task and send a proposal.
            </EmptyState>
          )}
        </div>
        <aside className={layout.stack}>
          <Card>
            <h2>Private starter files</h2>
            <p className={text.mutedSmall}>
              Only you and the selected student can download these. Agreement requirements are
              enforced on every download.
            </p>
            {files.map((file) => (
              <a key={file.id} className={links.fileLink} href="#">
                {file.filename} <span>↓</span>
              </a>
            ))}
            {current.status === 'open' && (
              <form
                className={layout.formStack}
                onSubmit={uploadFile}
                onChange={(e) => setUploadErrors(withoutError(uploadErrors, e.target))}
                noValidate
              >
                <Field
                  label="Starter ZIP"
                  id="starter"
                  error={uploadErrors.file}
                  hint="Up to 8 MB. Include a README. Exclude secrets, .git, and node_modules."
                >
                  <Input id="starter" name="file" type="file" accept=".zip,application/zip" />
                </Field>
                <Button type="submit" variant="secondary">
                  Upload starter files
                </Button>
              </form>
            )}
          </Card>
          <Card>
            <h3>Task controls</h3>
            <Link className={links.textLink} to={`/tasks/${id}`}>
              View public task →
            </Link>
            {current.status === 'open' && (
              <ConfirmDialog
                trigger={
                  <Button variant="danger" className={styles.actionButton}>
                    Close task
                  </Button>
                }
                title="Close this task?"
                description="This stops new proposals and rejects the pending proposals. You can post a new task later."
              >
                <Button variant="danger">Confirm close</Button>
              </ConfirmDialog>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
