import { useAuth } from '@/hooks/useAuth';
import { NotificationsList } from '@/components/portal/NotificationsList';

export default function StudentNotices() {
  const { user } = useAuth();
  if (!user) return null;
  return <NotificationsList userId={user.id} />;
}
