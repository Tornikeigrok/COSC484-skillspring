import { ErrorMessage, Loading } from '../../components/ui';
import { useCurrentUser } from './hooks/use-profile';
import { sampleHomeAssignments, sampleHomeProposals } from './constants/sample-home';
import { getActiveAssignments } from './utils/get-active-assignments';
import { StudentOverview } from './components/StudentOverview';
import { CompanyOverview } from './components/CompanyOverview';

export default function HomePage() {
  const { data: profile, isPending, error, refetch } = useCurrentUser();
  if (isPending) return <Loading />;
  if (!profile) return <ErrorMessage error={error} retry={() => refetch()} />;

  if (profile.role === 'company') {
    return <CompanyOverview firstName={profile.first_name} companyName={profile.Company.name} />;
  }

  const items = sampleHomeAssignments;
  return (
    <StudentOverview
      firstName={profile.first_name}
      skills={profile.Student.skills}
      counts={{
        active: getActiveAssignments(items).length,
        proposals: sampleHomeProposals.length,
        completed: items.filter((a) => a.status === 'completed').length,
      }}
    />
  );
}
