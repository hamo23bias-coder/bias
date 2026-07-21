import { useEffect, useState, FormEvent } from 'react';
import { AdminLayout, AdminPageHeader } from '@/components/admin/AdminLayout';
import { api } from '@/lib/admin-api';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags?: string[];
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

type FormData = Omit<BlogPost, 'id' | 'createdAt' | 'publishedAt'> & { tags: string };

const EMPTY: FormData = {
  title: '', slug: '', excerpt: '', content: '',
  author: 'Bias Tech', tags: '', published: false,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = () =>
    api.get<BlogPost[]>('/admin/blog')
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (p: BlogPost) => {
    setForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content,
      author: p.author, tags: (p.tags || []).join(', '), published: p.published,
    });
    setEditId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({
      ...prev,
      [name]: val,
      ...(name === 'title' && !editId ? { slug: slugify(value) } : {}),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editId) {
        await api.put(`/admin/blog/${editId}`, body);
      } else {
        await api.post('/admin/blog', body);
      }
      await fetchPosts();
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    await api.delete(`/admin/blog/${id}`);
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="إدارة المدونة"
        subtitle={`${posts.length} مقال`}
        action={
          <button className="b-btn-main" onClick={openNew}>
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            مقال جديد
          </button>
        }
      />

      {/* Form Modal */}
      {showForm && (
        <div className="adm-modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2>{editId ? 'تعديل المقال' : 'مقال جديد'}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="adm-alert adm-alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="b-form-row">
                <div className="b-fg">
                  <label>العنوان *</label>
                  <input name="title" value={form.title} onChange={handleChange} required placeholder="عنوان المقال" />
                </div>
                <div className="b-fg">
                  <label>الرابط (Slug) *</label>
                  <input name="slug" value={form.slug} onChange={handleChange} required placeholder="my-post-slug" dir="ltr" />
                </div>
              </div>
              <div className="b-fg">
                <label>المقتطف</label>
                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} placeholder="وصف قصير للمقال..." style={{ minHeight: 70 }} />
              </div>
              <div className="b-fg">
                <label>المحتوى *</label>
                <textarea name="content" value={form.content} onChange={handleChange} required placeholder="محتوى المقال..." style={{ minHeight: 160 }} />
              </div>
              <div className="b-form-row">
                <div className="b-fg">
                  <label>الكاتب</label>
                  <input name="author" value={form.author} onChange={handleChange} />
                </div>
                <div className="b-fg">
                  <label>الوسوم (مفصولة بفاصلة)</label>
                  <input name="tags" value={form.tags} onChange={handleChange} placeholder="AI, Tech, Design" dir="ltr" />
                </div>
              </div>
              <label className="adm-checkbox-label">
                <input type="checkbox" name="published" checked={form.published} onChange={handleChange} />
                <span>نشر المقال</span>
              </label>
              <div className="adm-form-actions">
                <button type="button" className="b-btn-ghost" onClick={() => setShowForm(false)}>إلغاء</button>
                <button type="submit" className="b-btn-main" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'نشر المقال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="adm-spinner-wrap"><div className="adm-loading-spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="adm-empty"><p>لا توجد مقالات بعد. أضف أول مقال!</p></div>
      ) : (
        <div className="adm-card">
          <table className="adm-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الكاتب</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td>
                    <strong style={{ color: 'var(--text-bright)' }}>{post.title}</strong>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted-color)' }} dir="ltr">/{post.slug}</div>
                  </td>
                  <td>{post.author}</td>
                  <td>
                    <span className={`adm-badge ${post.published ? 'adm-badge-green' : 'adm-badge-orange'}`}>
                      {post.published ? 'منشور' : 'مسودة'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted-color)', fontSize: '.75rem' }}>
                    {new Date(post.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="adm-action-btn" onClick={() => openEdit(post)}>تعديل</button>
                      <button className="adm-action-btn adm-action-danger" onClick={() => handleDelete(post.id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
