import { useState } from 'react'
import { Search, Filter, ChevronDown, User, CheckCircle, Clock, XCircle } from 'lucide-react'
import { borrowers } from '../data/mock'

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

export default function Borrowers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = borrowers.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.employer.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Borrowers</h1>
          <p className="page-subtitle">{borrowers.length} total borrowers in the portfolio</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search borrowers or employers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={14} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paid">Paid Off</option>
            <option value="pending">Pending</option>
          </select>
          <ChevronDown size={13} />
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Borrower</th>
              <th>Employer</th>
              <th>Loan Amount</th>
              <th>Balance</th>
              <th>Progress</th>
              <th>Risk</th>
              <th>Status</th>
              <th>Next Repayment</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const progress = b.loanAmount > 0
                ? Math.round(((b.loanAmount - b.loanBalance) / b.loanAmount) * 100)
                : 100
              return (
                <tr key={b.id} className="table-row animate-in">
                  <td>
                    <div className="borrower-cell">
                      <div className="avatar">{b.name.split(' ').map(n => n[0]).join('')}</div>
                      <div>
                        <div className="cell-primary">{b.name}</div>
                        <div className="cell-secondary">Score: {b.creditScore}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-primary">{b.employer}</div>
                    <div className="cell-secondary flex-row">
                      {b.employerVerified
                        ? <><CheckCircle size={11} style={{ color: 'var(--color-success)' }} /> Verified</>
                        : <><XCircle size={11} style={{ color: 'var(--color-danger)' }} /> Unverified</>
                      }
                    </div>
                  </td>
                  <td><span className="cell-primary">{fmt(b.loanAmount)}</span></td>
                  <td><span className="cell-primary">{fmt(b.loanBalance)}</span></td>
                  <td>
                    <div className="progress-wrap">
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="progress-label">{progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${b.riskScore === 'low' ? 'success' : b.riskScore === 'medium' ? 'warning' : 'danger'}`}>
                      {b.riskScore}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${b.status === 'active' ? 'primary' : b.status === 'paid' ? 'success' : 'warning'}`}>
                      {b.status === 'active' ? <><User size={11} /> active</> : b.status === 'paid' ? <><CheckCircle size={11} /> paid</> : <><Clock size={11} /> pending</>}
                    </span>
                  </td>
                  <td>
                    <span className="cell-secondary">{b.nextRepayment ?? '—'}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">
            <User size={32} />
            <p>No borrowers found</p>
          </div>
        )}
      </div>

      <style>{`
        .page { display: flex; flex-direction: column; gap: 20px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--color-text); }
        .page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .toolbar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .search-box { flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 9px 14px; color: var(--color-text-muted); }
        .search-box input { background: none; border: none; outline: none; color: var(--color-text); font-size: 13px; width: 100%; }
        .search-box input::placeholder { color: var(--color-text-muted); }
        .filter-group { display: flex; align-items: center; gap: 6px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 9px 14px; color: var(--color-text-muted); position: relative; }
        .filter-group select { background: none; border: none; outline: none; color: var(--color-text); font-size: 13px; appearance: none; cursor: pointer; padding-right: 4px; }
        .table-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table thead tr { border-bottom: 1px solid var(--color-border); }
        .data-table th { padding: 13px 16px; text-align: left; font-size: 11px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: var(--color-surface-2); }
        .data-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
        .data-table tr:last-child td { border-bottom: none; }
        .borrower-cell { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 32px; height: 32px; border-radius: 8px; background: var(--color-primary-dim); color: var(--color-primary-light); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .cell-primary { font-size: 13px; font-weight: 500; color: var(--color-text); }
        .cell-secondary { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }
        .flex-row { display: flex; align-items: center; gap: 4px; }
        .progress-wrap { display: flex; align-items: center; gap: 8px; min-width: 100px; }
        .progress-track { flex: 1; height: 5px; background: var(--color-border); border-radius: 3px; }
        .progress-fill { height: 100%; background: var(--color-primary); border-radius: 3px; }
        .progress-label { font-size: 11px; color: var(--color-text-muted); min-width: 30px; }
        .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: var(--color-text-muted); }
      `}</style>
    </div>
  )
}
