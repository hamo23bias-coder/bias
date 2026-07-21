import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { api } from '@/lib/admin-api';

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  imageUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

type FormData = Omit<PortfolioItem, 'id' | 'createdAt'> & { tags: string };

const EMPTY: FormData = {
  title: '', description: '', category: 'web', tags: '',
  imageUrl: '', liveUrl: '', githubUrl: '', featured: false, order: 0,
};

export default function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = () =>
    api.get<PortfolioItem[]>('/admin/portfolio')
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchItems(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (item: PortfolioItem) => {
    setForm({
      title: item.title, description: item.description, category: item.category,
      tags: (item.tags || []).join(', '), imageUrl: item.imageUrl || '',
      liveUrl: item.liveUrl || '', githubUrl: item.githubUrl || '',
      featured: item.featured, order: item.order,
    });
    setEditId(item.id);
    setShowForm(true);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editId) {
        await api.put(`/admin/portfolio/${editId}`, body);
      } else {
        await api.post('/admin/portfolio', body);
      }
      await fetchItems();
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
    await api.delete(`/admin/portfolio/${id}`);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="إدارة البورتفوليو"
        subtitle={`${items.length} مشروع`}
        action={
          <button className="b-btn-main" onClick={openNew}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            مشروع جديد
          </button>
        }
      />

      {/* Form Modal */}
      {showForm && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2>{editId ? 'تعديل المشروع' : 'مشروع جديد'}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="adm-alert adm-alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="b-form-row">
                <div className="b-fg">
                  <label>اسم المشروع *</label>
                  <input name="title" value={form.title} onChange={handleChange} required placeholder="اسم المشروع" />
                </div>
                <div className="b-fg">
                  <label>التصنيف</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="web">تطبيق ويب</option>
                    <option value="mobile">تطبيق جوال</option>
                    <option value="ai">ذكاء اصطناعي</option>
                    <option value="design">تصميم</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
              </div>
              <div className="b-fg">
                <label>الوصف *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required placeholder="وصف المشروع..." style={{ minHeight: 100 }} />
              </div>
              <div className="b-fg">
                <label>الوسوم (مفصولة بفاصلة)</label>
                <input name="tags" value={form.tags} onChange={handleChange} placeholder="React, AI, Node.js" dir="ltr" />
              </div>
              <div className="b-fg">
                <label>رابط الصورة</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." dir="ltr" type="url" />
              </div>
              <div className="b-form-row">
                <div className="b-fg">
                  <label>رابط المشروع</label>
                  <input name="liveUrl" value={form.liveUrl} onChange={handleChange} placeholder="https://..." dir="ltr" type="url" />
                </div>
                <div className="b-fg">
                  <label>رابط GitHub</label>
                  <input name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="https://github.com/..." dir="ltr" type="url" />
                </div>
              </div>
              <div className="b-form-row">
                <div className="b-fg">
                  <label>الترتيب</label>
                  <input name="order" type="number" value={form.order} onChange={handleChange} min="0" />
                </div>
                <div className="b-fg" style={{ justifyContent: 'flex-end' }}>
                  <label className="adm-checkbox-label">
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                    <span>مشروع مميز</span>
                  </label>
                </div>
              </div>
              <div className="adm-form-actions">
                <button type="button" className="b-btn-ghost" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="b-btn-main" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة المشروع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="adm-spinner-wrap"><div className="adm-loading-spinner" /></div>
      ) : items.length === 0 ? (
        <div className="adm-empty"><p>لا توجد مشاريع بعد. أضف أول مشروع!</p></div>
      ) : (
        <div className="adm-portfolio-grid">
          {items.map(item => (
            <div key={item.id} className="adm-portfolio-card">
              {item.featured && <div className="adm-featured-badge">⭐ مميز</div>}
              {item.imageUrl ? (
                <div className="adm-portfolio-thumb">
                  <img src={item.imageUrl} alt={item.title} />
                </div>
              ) : (
                <div className="adm-portfolio-thumb adm-portfolio-thumb-empty">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                </div>
              )}
              <div className="adm-portfolio-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem' }}>
                  <span className="adm-badge adm-badge-blue">{item.category}</span>
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noopener" className="adm-link" style={{ fontSize: '.72rem' }}>
                      ↗ معاينة
                    </a>
                  )}
                </div>
                <h3 className="adm-portfolio-title">{item.title}</h3>
                <p className="adm-portfolio-desc">{item.description}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="b-case-tags" style={{ marginTop: '.6rem' }}>
                    {item.tags.map(t => <span key={t} className="b-case-tag">{t}</span>)}
                  </div>
                )}
              </div>
              <div className="adm-portfolio-actions">
                <button className="adm-action-btn" onClick={() => openEdit(item)}>تعديل</button>
                <button className="adm-action-btn adm-action-danger" onClick={() => handleDelete(item.id)}>حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
