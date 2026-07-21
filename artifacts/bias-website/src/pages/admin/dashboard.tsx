import { useEffect, useState } from 'react';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { api } from '@/lib/admin-api';

interface AnalyticsSummary {
  totalPageViews: number;
  uniquePageViews: number;
  totalLeads: number;
  newLeads: number;
  topPages: { path: string; views: number }[];
}

function KpiCard({ icon, value, label, trend, trendUp }: {
  icon: React.ReactNode; value: string | number; label: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="b-kpi-card">
      <div className="adm-kpi-top">
        <div className="b-kpi-icon">{icon}</div>
        {trend && (
          <span className={`b-kpi-trend ${trendUp ? 'up' : 'neutral'}`}>
            {trendUp ? '▲' : '→'} {trend}
          </span>
        )}
      </div>
      <div className="b-kpi-value">{value}</div>
      <div className="b-kpi-label">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsSummary>('/admin/analytics')
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <AdminPageHeader title="لوحة التحكم" subtitle="نظرة عامة على أداء الموقع" />

      {loading ? (
        <div className="adm-spinner-wrap"><div className="adm-loading-spinner" /></div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="b-kpi-bar" style={{ marginBottom: '2rem' }}>
            <KpiCard
              icon={<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
              value={analytics?.totalPageViews ?? 0}
              label="إجمالي مشاهدات الصفحات"
              trend="هذا الشهر"
              trendUp
            />
            <KpiCard
              icon={<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
              value={analytics?.uniquePageViews ?? 0}
              label="زيارات فريدة"
              trend="جلسات مختلفة"
              trendUp
            />
            <KpiCard
              icon={<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.1-.45c.91.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>}
              value={analytics?.totalLeads ?? 0}
              label="إجمالي الطلبات"
              trend="كل الوقت"
            />
            <KpiCard
              icon={<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"/><path d="M3 9h18M9 21V9"/></svg>}
              value={analytics?.newLeads ?? 0}
              label="طلبات جديدة"
              trend="بانتظار الرد"
              trendUp={(analytics?.newLeads ?? 0) > 0}
            />
          </div>

          {/* Top Pages */}
          {analytics?.topPages && analytics.topPages.length > 0 && (
            <div className="adm-card">
              <div className="adm-card-header">
                <span className="adm-card-title">أكثر الصفحات زيارةً</span>
              </div>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الصفحة</th>
                    <th>المشاهدات</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPages.map((p, i) => (
                    <tr key={p.path}>
                      <td><span className="adm-rank">{i + 1}</span></td>
                      <td><code className="adm-path">{p.path}</code></td>
                      <td>
                        <div className="adm-bar-wrap">
                          <div
                            className="adm-bar-fill"
                            style={{ width: `${Math.round((p.views / (analytics.topPages[0]?.views || 1)) * 100)}%` }}
                          />
                          <span className="adm-bar-val">{p.views}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {analytics?.topPages?.length === 0 && (
            <div className="adm-empty">
              <p>لا توجد بيانات تحليلية بعد — ستظهر هنا عند بدء الزوار.</p>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
