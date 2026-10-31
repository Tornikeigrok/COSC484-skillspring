import { Loading } from '../../components/ui';
import { useCurrentUser } from '../dashboard/hooks/use-profile';
import StudentSettingsPage from './StudentSettingsPage';
import CompanySettingsPage from './CompanySettingsPage';

// Picks the settings page for the logged-in role, so student hooks never run for companies
export default function SettingsPage() {
  const { data: user } = useCurrentUser();
  if (!user) return <Loading />;
  return user.role === 'student' ? <StudentSettingsPage /> : <CompanySettingsPage />;
}
