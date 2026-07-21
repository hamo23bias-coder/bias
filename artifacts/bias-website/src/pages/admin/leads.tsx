import { useEffect, useState } from 'react';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { api } from '@/lib/admin-api';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  industry: string;
  budget?: string;
  goal: string;
  status: 'new' | 'contacted' | 'closed';
  notes?: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  new:       { label: 'جديد',    class: 'adm-badge-blue' },
  contacted: { label: 'تم التواصل', class: 'adm-badge-orange' },
  closed:    { label: 'مغلق',    class: 'adm-badge-green' },
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchLeads = () => {
    const q = filter !== 'all' ? `?status=${filter}` : '';
    api.get<Lead[]>(`/admin/leads${q}`)
      .then(setLeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); fetchLeads(); }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/admin/leads/${id}/status`, { status });
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filterBtns = [
    { key: 'all', label: 'الكل' },
    { key: 'new', label: 'جديد' },
    { key: 'contacted', label: 'تم التواصل' },
    { key: 'closed', label: 'مغلق' },
  ];

  return (
    <AdminLayout>
      <AdminPageHeader
        title="العملاء المحتملون"
        subtitle={`${leads.length} طلب`}
      />

      {/* Filter */}
      <div className="b-filter-bar" style={{ marginBottom: '1.5rem' }}>
        {filterBtns.map(b => (
          <button
            key={b.key}
            className={`b-filter-btn ${filter === b.key ? 'active' : ''}`}
            onClick={() => setFilter(b.key)}
          >{b.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="adm-spinner-wrap"><div className="adm-loading-spinner" /></div>
      ) : leads.length === 0 ? (
        <div className="adm-empty"><p>لا توجد طلبات بعد.</p></div>
      ) : (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>نوع المشروع</th>
                <th>الميزانية</th>
                <th>التاريخ</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <>
                  <tr key={lead.id} className={expanded === lead.id ? 'adm-row-expanded' : ''}>
                    <td><strong style={{ color: 'var(--text-bright)' }}>{lead.name}</strong></td>
                    <td><a href={`mailto:${lead.email}`} className="adm-link" dir="ltr">{lead.email}</a></td>
                    <td>{lead.projectType}</td>
                    <td>{lead.budget || '—'}</td>
                    <td style={{ color: 'var(--muted-color)', fontSize: '.75rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td>
                      <select
                        className="adm-status-select"
                        value={lead.status}
                        disabled={updating === lead.id}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                      >
                        <option value="new">جديد</option>
                        <option value="contacted">تم التواصل</option>
                        <option value="closed">مغلق</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="adm-expand-btn"
                        onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                      >{expanded === lead.id ? '▲' : '▼'}</button>
                    </td>
                  </tr>
                  {expanded === lead.id && (
                    <tr key={`${lead.id}-detail`} className="adm-detail-row">
                      <td colSpan={7}>
                        <div className="adm-detail-grid">
                          <div className="adm-detail-item">
                            <span className="adm-detail-label">الهاتف</span>
                            <span>{lead.phone || '—'}</span>
                          </div>
                          <div className="adm-detail-item">
                            <span className="adm-detail-label">الصناعة</span>
                            <span>{lead.industry}</span>
                          </div>
                          <div className="adm-detail-item" style={{ gridColumn: '1 / -1' }}>
                            <span className="adm-detail-label">الهدف</span>
                            <span>{lead.goal}</span>
                          </div>
                          {lead.notes && (
                            <div className="adm-detail-item" style={{ gridColumn: '1 / -1' }}>
                              <span className="adm-detail-label">ملاحظات</span>
                              <span>{lead.notes}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
