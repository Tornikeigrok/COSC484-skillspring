import { ErrorMessage, Loading } from '../../components/ui';
import { useCurrentUser } from './hooks/use-profile';
import { StudentOverview } from './components/StudentOverview';
import { CompanyOverview } from './components/CompanyOverview';

export default function HomePage() {
  const { data: profile, isPending, error, refetch } = useCurrentUser();
  if (isPending) return <Loading />;
  if (!profile) return <ErrorMessage error={error} retry={() => refetch()} />;

  if (profile.role === 'company') {
    return <CompanyOverview firstName={profile.first_name} companyName={profile.Company.name} />;
  }
  return <StudentOverview firstName={profile.first_name} skills={profile.Student.skills} />;
}
