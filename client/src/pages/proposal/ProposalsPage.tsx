import { Link } from 'react-router-dom';
import {
  Card,
  DateLabel,
  EmptyState,
  PageHeading,
  StatusBadge,
  buttonClass,
} from '../../components/ui';
import layout from '../../styles/layout.module.css';
import links from '../../styles/links.module.css';
import text from '../../styles/text.module.css';
import { sampleProposals } from './constants/sample-proposals';

export default function ProposalsPage() {
  return (
    <>
      <PageHeading
        eyebrow="YOUR NEXT OPPORTUNITIES"
        title="My proposals"
        description="Keep track of the projects you’re ready to take on."
      />
      {sampleProposals.length ? (
        <div className={layout.stack}>
          {sampleProposals.map((item) => (
            <Card key={item.id}>
              <div className={layout.headerRow}>
                <h2>
                  <Link to={`/tasks/${item.task.id}`}>{item.task.title}</Link>
                </h2>
                <StatusBadge status={item.status} />
              </div>
              <p className={text.mutedSmall}>
                {item.task.company.name} · {item.estimated_hours} hours ·{' '}
                <DateLabel value={item.createdAt} />
              </p>
              <p className={text.longText}>{item.message}</p>
              {item.status === 'accepted' && (
                <Link className={links.textLink} to="/assignments">
                  Open your assignments →
                </Link>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Make your first introduction."
          action={
            <Link className={buttonClass()} to="/tasks">
              Explore tasks
            </Link>
          }
        >
          Find a task you’re excited about and explain your approach.
        </EmptyState>
      )}
    </>
  );
}
