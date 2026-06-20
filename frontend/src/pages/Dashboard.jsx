import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const STATUS_COLORS = { Applied: '#6366f1', Interview: '#f59e0b', Offer: '#10b981', Rejected: '#ef4444' };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/jobs').then(({ data }) => { setJobs(data); setLoading(false); });
  }, []);

  const stats = {
    total: jobs.length,
    interview: jobs.filter(j => j.status === 'Interview').length,
    offer: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  const pieData = ['Applied', 'Interview', 'Offer', 'Rejected']
    .map(s => ({ name: s, value: jobs.filter(j => j.status === s).length }))
    .filter(d => d.value > 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      count: jobs.filter(j => new Date(j.appliedDate).toDateString() === d.toDateString()).length
    };
  });

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's your job search at a glance</p>
        </div>
        <Link to="/jobs" className="btn-primary">+ Add Application</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon"><Briefcase size={20} /></div>
          <div className="stat-info"><span className="stat-value">{stats.total}</span><span className="stat-label">Total Applications</span></div>
        </div>
        <div className="stat-card interview">
          <div className="stat-icon"><Clock size={20} /></div>
          <div className="stat-info"><span className="stat-value">{stats.interview}</span><span className="stat-label">Interviews</span></div>
        </div>
        <div className="stat-card offer">
          <div className="stat-icon"><CheckCircle size={20} /></div>
          <div className="stat-info"><span className="stat-value">{stats.offer}</span><span className="stat-label">Offers</span></div>
        </div>
        <div className="stat-card rejected">
          <div className="stat-icon"><XCircle size={20} /></div>
          <div className="stat-info"><span className="stat-value">{stats.rejected}</span><span className="stat-label">Rejected</span></div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>No applications yet</h3>
          <p>Start tracking your job search by adding your first application.</p>
          <Link to="/jobs" className="btn-primary">Add your first job</Link>
        </div>
      ) : (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Applications this week</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={last7}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Status breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map(entry => <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend">
              {pieData.map(d => (
                <div key={d.name} className="legend-item">
                  <span className="legend-dot" style={{ background: STATUS_COLORS[d.name] }} />
                  <span>{d.name}</span>
                  <span className="legend-count">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="recent-card">
          <div className="recent-header">
            <h3>Recent Applications</h3>
            <Link to="/jobs" className="view-all">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="recent-list">
            {jobs.slice(0, 5).map(job => (
              <div key={job._id} className="recent-item">
                <div className="recent-company-icon">{job.company.charAt(0)}</div>
                <div className="recent-info">
                  <span className="recent-role">{job.role}</span>
                  <span className="recent-company">{job.company}</span>
                </div>
                <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span>
                <span className="recent-date">{new Date(job.appliedDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}