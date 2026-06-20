import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Search, Pencil, Trash2, ExternalLink, X, Filter } from 'lucide-react';

const STATUSES = ['All', 'Applied', 'Interview', 'Offer', 'Rejected'];
const EMPTY_FORM = { company: '', role: '', status: 'Applied', location: '', salary: '', notes: '', link: '', appliedDate: new Date().toISOString().split('T')[0] };

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchJobs = () => api.get('/jobs').then(({ data }) => { setJobs(data); setLoading(false); });
  useEffect(() => { fetchJobs(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (job) => { setEditing(job._id); setForm({ ...job, appliedDate: job.appliedDate?.split('T')[0] || '' }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.company || !form.role) return;
    setSaving(true);
    try {
      editing ? await api.put(`/jobs/${editing}`, form) : await api.post('/jobs', form);
      await fetchJobs(); closeModal();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => { await api.delete(`/jobs/${id}`); setDeleteId(null); fetchJobs(); };

  const filtered = jobs.filter(j =>
    (j.company.toLowerCase().includes(search.toLowerCase()) || j.role.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatus === 'All' || j.status === filterStatus)
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p className="page-sub">{jobs.length} total · {filtered.length} showing</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Application</button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input className="search-input" placeholder="Search by company or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-pills">
          <Filter size={15} className="filter-icon" />
          {STATUSES.map(s => (
            <button key={s} className={`pill ${filterStatus === s ? 'pill-active' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        filtered.length === 0 ? (
          <div className="empty-state">
            <p>{search || filterStatus !== 'All' ? 'No results match your filters.' : 'No applications yet!'}</p>
            {!search && filterStatus === 'All' && <button className="btn-primary" onClick={openAdd}>Add Application</button>}
          </div>
        ) : (
          <div className="jobs-table-wrap">
            <table className="jobs-table">
              <thead><tr><th>Company</th><th>Role</th><th>Status</th><th>Location</th><th>Salary</th><th>Applied</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(job => (
                  <tr key={job._id}>
                    <td><div className="company-cell"><div className="company-avatar">{job.company.charAt(0)}</div><span>{job.company}</span></div></td>
                    <td className="role-cell">{job.role}</td>
                    <td><span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span></td>
                    <td className="muted">{job.location || '—'}</td>
                    <td className="muted">{job.salary || '—'}</td>
                    <td className="muted">{new Date(job.appliedDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>
                      <div className="action-btns">
                        {job.link && <a href={job.link} target="_blank" rel="noreferrer" className="icon-btn"><ExternalLink size={15} /></a>}
                        <button className="icon-btn" onClick={() => openEdit(job)}><Pencil size={15} /></button>
                        <button className="icon-btn danger" onClick={() => setDeleteId(job._id)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Application' : 'Add Application'}</h3>
              <button className="icon-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label>Company *</label><input placeholder="Google" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                <div className="form-group"><label>Role *</label><input placeholder="Full Stack Developer" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {['Applied', 'Interview', 'Offer', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Applied Date</label><input type="date" value={form.appliedDate} onChange={e => setForm({ ...form, appliedDate: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Location</label><input placeholder="Bengaluru / Remote" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div className="form-group"><label>Salary</label><input placeholder="₹8–12 LPA" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Job Link</label><input placeholder="https://..." value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} /></div>
              <div className="form-group"><label>Notes</label><textarea placeholder="Interview notes, referral, follow-ups..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving || !form.company || !form.role}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Delete Application</h3><button className="icon-btn" onClick={() => setDeleteId(null)}><X size={18} /></button></div>
            <div className="modal-body"><p>Are you sure? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}