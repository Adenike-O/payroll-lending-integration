import { useState } from 'react'
import { Search, FileText, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'
import { loanApplications } from '../data/mock'

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

export default function Applications() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = loanApplications.filter(a => {
    const matchSearch = a.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
      a.employer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: loanApplications.length,
    approved: loanApplications.filter(a => a.status === 'approved').length,
    under_review: loanApplications.filter(a => a.status === 'under_review').length,
    rejected: loanApplications.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loan Applications</h1>
          <p className="page-subtitle">Review and manage incoming loan requests</p>
        </div>
      </div>

      <div className="status-tabs">
        {([
          ['all', 'All', counts.all],
          ['approved', 'Approved', counts.approved],
          ['under_review', 'Under Review', counts.under_review],
          ['rejected', 'Rejected', counts.rejected],
        ] as const).map(([val, label, count]) => (
          <button
            key={val}
            className={`status-tab ${statusFilter === val ? 'active' : ''}`}
            onClick={() => setStatusFilter(val)}
          >
            {label}
            <span className="tab-count">{count}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search applicants or employers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="app-cards">
        {filtered.map(app => (
          <div key={app.id} className="app-card animate-in">
            <div className="app-card-header">
              <div className="app-avatar">
                {app.borrowerName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="app-identity">
                <span className="app-name">{app.borrowerName}</span>
                <span className="app-employer">{app.employer}</span>
              </div>
              <span className={`badge badge-${app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'under_review' ? 'warning' : 'neutral'}`}>
                {app.status === 'approved' && <CheckCircle size={11} />}
                {app.status === 'rejected' && <XCircle size={11} />}
                {app.status === 'under_review' && <Clock size={11} />}
                {app.status.replace('_', ' ')}
              </span>
            </div>

            <div className="app-card-body">
              <div className="app-stat">
                <span className="app-stat-label">Requested</span>
                <span className="app-stat-value">{fmt(app.amount)}</span>
              </div>
              <div className="app-stat">
                <span className="app-stat-label">Purpose</span>
                <span className="app-stat-value">{app.purpose}</span>
              </div>
              <div className="app-stat">
                <span className="app-stat-label">DTI Ratio</span>
                <span className={`app-stat-value dti-${app.dti < 0.25 ? 'good' : app.dti < 0.4 ? 'mid' : 'bad'}`}>
                  {(app.dti * 100).toFixed(0)}%
                </span>
              </div>
              <div className="app-stat">
                <span className="app-stat-label">Risk</span>
                <span className={`badge badge-${app.riskScore === 'low' ? 'success' : app.riskScore === 'medium' ? 'warning' : 'danger'}`}>
                  {app.riskScore}
                </span>
              </div>
            </div>

            <div className="app-card-footer">
              <span className="app-date">Applied: {app.appliedDate}</span>
              {app.decidedDate && <span className="app-date">Decided: {app.decidedDate}</span>}
              {app.status === 'under_review' && (
                <div className="app-actions">
                  <button className="btn-approve">
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button className="btn-reject">
                    <XCircle size={13} /> Decline
                  </button>
                  <button className="btn-view">
                    <Eye size={13} /> Details
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state-center">
          <FileText size={32} />
          <p>No applications found</p>
        </div>
      )}

      <style>{`
        .page { display: flex; flex-direction: column; gap: 20px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--color-text); }
        .page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .status-tabs { display: flex; gap: 4px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 4px; width: fit-content; }
        .status-tab { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 6px; border: none; background: none; color: var(--color-text-muted); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .status-tab:hover { color: var(--color-text); }
        .status-tab.active { background: var(--color-surface-2); color: var(--color-text); }
        .tab-count { font-size: 11px; background: var(--color-border); color: var(--color-text-muted); padding: 1px 6px; border-radius: 100px; }
        .toolbar { display: flex; gap: 10px; align-items: center; }
        .search-box { flex: 1; max-width: 380px; display: flex; align-items: center; gap: 8px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 9px 14px; color: var(--color-text-muted); }
        .search-box input { background: none; border: none; outline: none; color: var(--color-text); font-size: 13px; width: 100%; }
        .search-box input::placeholder { color: var(--color-text-muted); }
        .app-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
        .app-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 14px; transition: border-color 0.2s, transform 0.2s; }
        .app-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
        .app-card-header { display: flex; align-items: center; gap: 10px; }
        .app-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--color-primary-dim); color: var(--color-primary-light); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .app-identity { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .app-name { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .app-employer { font-size: 12px; color: var(--color-text-muted); }
        .app-card-body { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: var(--color-surface-2); border-radius: var(--radius-sm); padding: 12px; }
        .app-stat { display: flex; flex-direction: column; gap: 3px; }
        .app-stat-label { font-size: 10px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .app-stat-value { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .dti-good { color: var(--color-success) !important; }
        .dti-mid { color: var(--color-warning) !important; }
        .dti-bad { color: var(--color-danger) !important; }
        .app-card-footer { display: flex; flex-direction: column; gap: 8px; }
        .app-date { font-size: 11px; color: var(--color-text-dim); }
        .app-actions { display: flex; gap: 8px; margin-top: 4px; }
        .btn-approve { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border: none; border-radius: 7px; background: var(--color-success-dim); color: var(--color-success); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn-approve:hover { background: var(--color-success); color: #fff; }
        .btn-reject { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border: none; border-radius: 7px; background: var(--color-danger-dim); color: var(--color-danger); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn-reject:hover { background: var(--color-danger); color: #fff; }
        .btn-view { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border: none; border-radius: 7px; background: var(--color-surface-2); color: var(--color-text-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn-view:hover { color: var(--color-text); }
        .empty-state-center { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--color-text-muted); }
      `}</style>
    </div>
  )
}
