import { useState } from 'react'
import { Search, Building2, Link, RefreshCw, Clock } from 'lucide-react'
import { employers } from '../data/mock'

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

const integrationIcon = (s: string) => {
  if (s === 'connected') return <Link size={12} style={{ color: 'var(--color-success)' }} />
  if (s === 'syncing') return <RefreshCw size={12} style={{ color: 'var(--color-warning)' }} />
  return <Clock size={12} style={{ color: 'var(--color-text-muted)' }} />
}

export default function Employers() {
  const [search, setSearch] = useState('')

  const filtered = employers.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.industry.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employer Partners</h1>
          <p className="page-subtitle">Payroll integration status and lending metrics by employer</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search employers or industry..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="employers-grid">
        {filtered.map(e => {
          const enrollRate = Math.round((e.enrolledEmployees / e.employees) * 100)
          const repayRate = e.totalDisbursed > 0 ? Math.round((e.totalRepaid / e.totalDisbursed) * 100) : 0
          return (
            <div key={e.id} className="employer-card animate-in">
              <div className="employer-header">
                <div className="employer-icon">
                  <Building2 size={20} />
                </div>
                <div className="employer-title">
                  <h3 className="employer-name">{e.name}</h3>
                  <span className="employer-industry">{e.industry}</span>
                </div>
                <div className="employer-badges">
                  <span className={`badge badge-${e.status === 'active' ? 'success' : 'warning'}`}>{e.status}</span>
                </div>
              </div>

              <div className="integration-row">
                {integrationIcon(e.integrationStatus)}
                <span className="integration-label">Payroll: </span>
                <span className={`integration-status ${e.integrationStatus}`}>{e.integrationStatus}</span>
              </div>

              <div className="employer-metrics">
                <div className="metric">
                  <span className="metric-value">{e.employees.toLocaleString()}</span>
                  <span className="metric-label">Employees</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{e.enrolledEmployees}</span>
                  <span className="metric-label">Enrolled</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{enrollRate}%</span>
                  <span className="metric-label">Enroll Rate</span>
                </div>
              </div>

              <div className="employer-financials">
                <div className="fin-row">
                  <span className="fin-label">Total Disbursed</span>
                  <span className="fin-value">{fmt(e.totalDisbursed)}</span>
                </div>
                <div className="fin-row">
                  <span className="fin-label">Total Repaid</span>
                  <span className="fin-value success">{fmt(e.totalRepaid)}</span>
                </div>
                <div className="fin-row">
                  <span className="fin-label">Avg Loan Size</span>
                  <span className="fin-value">{e.avgLoanSize > 0 ? fmt(e.avgLoanSize) : '—'}</span>
                </div>
              </div>

              {e.totalDisbursed > 0 && (
                <div className="repay-bar-wrap">
                  <div className="repay-bar-header">
                    <span>Repayment</span>
                    <span>{repayRate}%</span>
                  </div>
                  <div className="repay-track">
                    <div className="repay-fill" style={{ width: `${repayRate}%` }} />
                  </div>
                </div>
              )}

              <div className="employer-footer">
                <span className="joined-label">Partner since {e.joinedDate}</span>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <Building2 size={32} />
          <p>No employers found</p>
        </div>
      )}

      <style>{`
        .page { display: flex; flex-direction: column; gap: 20px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--color-text); }
        .page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .toolbar { display: flex; gap: 10px; align-items: center; }
        .search-box { flex: 1; max-width: 380px; display: flex; align-items: center; gap: 8px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 9px 14px; color: var(--color-text-muted); }
        .search-box input { background: none; border: none; outline: none; color: var(--color-text); font-size: 13px; width: 100%; }
        .search-box input::placeholder { color: var(--color-text-muted); }
        .employers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .employer-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 14px; transition: border-color 0.2s, transform 0.2s; }
        .employer-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
        .employer-header { display: flex; align-items: flex-start; gap: 12px; }
        .employer-icon { width: 40px; height: 40px; background: var(--color-primary-dim); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--color-primary-light); flex-shrink: 0; }
        .employer-title { flex: 1; }
        .employer-name { font-size: 15px; font-weight: 600; color: var(--color-text); }
        .employer-industry { font-size: 12px; color: var(--color-text-muted); }
        .integration-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); }
        .integration-label { color: var(--color-text-muted); }
        .integration-status { font-weight: 500; text-transform: capitalize; }
        .integration-status.connected { color: var(--color-success); }
        .integration-status.syncing { color: var(--color-warning); }
        .integration-status.pending { color: var(--color-text-muted); }
        .employer-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: var(--color-surface-2); border-radius: var(--radius-sm); padding: 12px; }
        .metric { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .metric-value { font-size: 17px; font-weight: 700; color: var(--color-text); font-family: 'Sora', sans-serif; }
        .metric-label { font-size: 10px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .employer-financials { display: flex; flex-direction: column; gap: 8px; }
        .fin-row { display: flex; justify-content: space-between; align-items: center; }
        .fin-label { font-size: 12px; color: var(--color-text-muted); }
        .fin-value { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .fin-value.success { color: var(--color-success); }
        .repay-bar-wrap { display: flex; flex-direction: column; gap: 5px; }
        .repay-bar-header { display: flex; justify-content: space-between; font-size: 11px; color: var(--color-text-muted); }
        .repay-track { height: 5px; background: var(--color-border); border-radius: 3px; }
        .repay-fill { height: 100%; background: var(--color-success); border-radius: 3px; transition: width 0.6s ease; }
        .employer-footer { border-top: 1px solid var(--color-border); padding-top: 10px; }
        .joined-label { font-size: 11px; color: var(--color-text-dim); }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--color-text-muted); }
      `}</style>
    </div>
  )
}
