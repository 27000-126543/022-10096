import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import TemplateList from '@/pages/TemplateList';
import TemplateEditor from '@/pages/TemplateEditor';
import ProjectMapping from '@/pages/ProjectMapping';
import ReviewList from '@/pages/ReviewList';
import ReviewDetail from '@/pages/ReviewDetail';
import DeployCenter from '@/pages/DeployCenter';
import SignatureList from '@/pages/SignatureList';
import SignatureDetail from '@/pages/SignatureDetail';
import RiskAnalytics from '@/pages/RiskAnalytics';

interface AuthUser {
  username: string;
  realName: string;
  role: string;
  roleLabel: string;
  department: string;
  loginTime: string;
}

function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function ProtectedRoute() {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setUser(getAuthUser());
    setChecking(false);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <div className="text-sm text-neutral-500">正在加载...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/new" element={<TemplateEditor />} />
          <Route path="/templates/:id" element={<TemplateEditor />} />
          <Route path="/projects" element={<ProjectMapping />} />
          <Route path="/reviews" element={<ReviewList />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/deploy" element={<DeployCenter />} />
          <Route path="/signatures" element={<SignatureList />} />
          <Route path="/signatures/:id" element={<SignatureDetail />} />
          <Route path="/analytics" element={<RiskAnalytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
