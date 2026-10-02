import { Link } from 'react-router-dom';
import { Disclaimer } from './Disclaimer';
import { DemoModeBanner } from './DemoModeBanner';
import { ToastContainer } from './ToastNotification';
import { useApp } from '../context/AppContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isDemoMode } = useApp();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {isDemoMode && <DemoModeBanner />}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-navy-900 font-bold text-xl hover:opacity-80">
          <span className="text-blue-600">⚖️</span> PaymentProof
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 font-medium">Dashboard</Link>
          <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Upload Invoice</Link>
        </nav>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer>
        <Disclaimer />
      </footer>
      <ToastContainer />
    </div>
  );
}
