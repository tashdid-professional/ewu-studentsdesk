import Analytics from '../../../components/analytics';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Analytics />
    </div>
  );
}

export const metadata = {
  title: 'Course Combinations Analytics - EWU Helpdesk',
  description: 'Comprehensive analytics and insights for your saved course combinations',
};
