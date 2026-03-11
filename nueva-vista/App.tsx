
import React from 'react';
import DashboardView from './components/DashboardView';
import { LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        <DashboardView />
      </main>
    </div>
  );
};

export default App;
