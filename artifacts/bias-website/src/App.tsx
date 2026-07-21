import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';
import { I18nProvider } from '@/lib/i18n';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth';

// Public Pages
import Home from '@/pages/home';
import Services from '@/pages/services';
import AIStudio from '@/pages/ai-studio';
import Work from '@/pages/work';
import StartProject from '@/pages/start-project';

// Admin Pages
import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminLeads from '@/pages/admin/leads';
import AdminBlog from '@/pages/admin/blog';
import AdminPortfolio from '@/pages/admin/portfolio';

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="adm-loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to={`/admin/login?from=${encodeURIComponent(location)}`} />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/ai-studio" component={AIStudio} />
      <Route path="/work" component={Work} />
      <Route path="/start-project" component={StartProject} />

      {/* Admin auth */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin protected routes */}
      <Route path="/admin">
        {() => <Redirect to="/admin/dashboard" />}
      </Route>
      <Route path="/admin/dashboard">
        {() => <AdminGuard><AdminDashboard /></AdminGuard>}
      </Route>
      <Route path="/admin/leads">
        {() => <AdminGuard><AdminLeads /></AdminGuard>}
      </Route>
      <Route path="/admin/blog">
        {() => <AdminGuard><AdminBlog /></AdminGuard>}
      </Route>
      <Route path="/admin/portfolio">
        {() => <AdminGuard><AdminPortfolio /></AdminGuard>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <I18nProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </I18nProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
