import { Link } from 'react-router-dom';
import { fullName } from '../../lib/types';
import { EmptyState, PageHeading, StatusBadge } from '../../components/ui';
import layout from '../../styles/layout.module.css';
import linkCard from '../../styles/link-card.module.css';
import text from '../../styles/text.module.css';
import { sampleAssignments } from './constants/sample-assignments';

export default function AssignmentsPage() {
  return (
    <>
      <PageHeading
        eyebrow="FROM APPROACH TO IMPACT"
        title="Your assignments"
        description="Everything you need to move your work forward."
      />
      {sampleAssignments.length ? (
        <div className={layout.stack}>
          {sampleAssignments.map((item) => (
            <Link className={linkCard.linkCard} key={item.id} to={`/assignments/${item.id}`}>
              <div>
                <h2>{item.task.title}</h2>
                <p className={text.muted}>
                  {item.task.company.name} · {fullName(item.student)}
                </p>
              </div>
              <StatusBadge status={item.status} />
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="A place for work in progress.">
          Assignments appear here after a business selects a student’s proposal.
        </EmptyState>
      )}
    </>
  );
}
