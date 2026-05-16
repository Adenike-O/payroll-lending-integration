import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { kpiData, repaymentHistory, loanApplications, borrowers } from '../data/mock'

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

function KpiCard({ label, value, sub, trend, icon: Icon, accent }: {
  label: string
  value: string
  sub: string
  trend?: 'up' | 'down'
  icon: React.ElementType
  accent: string
}) {
  return (
    <div className="kpi-card animate-in">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon-wrap" style={{ background: accent + '20' }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-sub">
        {trend && (trend === 'up'
          ? <TrendingUp size={12} className="trend-up" />
          : <TrendingDown size={12} className="trend-down" />
        )}
        <span>{sub}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const recent = loanApplications.slice(0, 4)
  const activeBorrowers = borrowers.filter(b => b.status === 'active')

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Payroll-backed lending portfolio overview — May 2026</p>
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard
          label="Total Portfolio"
          value={fmt(kpiData.totalPortfolio)}
          sub="+8.4% from last month"
          trend="up"
          icon={DollarSign}
          accent="var(--color-primary)"
        />
        <KpiCard
          label="Active Loans"
          value={kpiData.activeLoans.toString()}
          sub={`+${kpiData.newBorrowersThisMonth} new this month`}
          trend="up"
          icon={Users}
          accent="var(--color-success)"
        />
        <KpiCard
          label="Repayment Rate"
          value={`${kpiData.repaymentRate}%`}
          sub="Payroll-deducted, on-time"
          icon={CheckCircle}
          accent="var(--color-success)"
        />
        <KpiCard
          label="Default Rate"
          value={`${kpiData.defaultRate}%`}
          sub="Below industry avg 3.1%"
          trend="down"
          icon={AlertTriangle}
          accent="var(--color-warning)"
        />
        <KpiCard
          label="Avg Loan Size"
          value={fmt(kpiData.avgLoanSize)}
          sub="Salary-adjusted cap"
          icon={TrendingUp}
          accent="var(--color-primary)"
        />
        <KpiCard
          label="Partner Employers"
          value={kpiData.totalEmployers.toString()}
          sub="Payroll integration active"
          icon={Building2}
          accent="#7c3aed"
        />
        <KpiCard
          label="Pending Applications"
          value={kpiData.pendingApplications.toString()}
          sub="Awaiting review"
          icon={Clock}
          accent="var(--color-warning)"
        />
        <KpiCard
          label="Avg Loan Size"
          value={fmt(kpiData.avgLoanSize)}
          sub="All active borrowers"
          icon={DollarSign}
          accent="var(--color-primary)"
        />
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title">Disbursement vs Repayment</h3>
            <span className="badge badge-primary">7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={repaymentHistory} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f7aff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f7aff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8892b0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8892b0' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}K`} />
              <Tooltip
                contentStyle={{ background: '#1e2236', border: '1px solid #2a2f4a', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, n: string) => [`$${(v/1000).toFixed(0)}K`, n === 'disbursed' ? 'Disbursed' : 'Repaid']}
              />
              <Area type="monotone" dataKey="disbursed" stroke="#4f7aff" strokeWidth={2} fill="url(#disbGrad)" />
              <Area type="monotone" dataKey="repaid" stroke="#22c55e" strokeWidth={2} fill="url(#repGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            <div className="legend-item"><span className="legend-dot" style={{ background: '#4f7aff' }} />Disbursed</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} />Repaid</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Applications</h3>
            <a href="/applications" className="card-link">View all</a>
          </div>
          <div className="app-list">
            {recent.map(app => (
              <div key={app.id} className="app-row">
                <div className="app-info">
                  <span className="app-name">{app.borrowerName}</span>
                  <span className="app-employer">{app.employer}</span>
                </div>
                <div className="app-right">
                  <span className="app-amount">{fmt(app.amount)}</span>
                  <span className={`badge badge-${app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : app.status === 'under_review' ? 'warning' : 'neutral'}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Borrowers</h3>
            <a href="/borrowers" className="card-link">View all</a>
          </div>
          <div className="borrower-list">
            {activeBorrowers.map(b => {
              const progress = Math.round(((b.loanAmount - b.loanBalance) / b.loanAmount) * 100)
              return (
                <div key={b.id} className="borrower-row">
                  <div className="borrower-avatar">{b.name.split(' ').map(n => n[0]).join('')}</div>
                  <div className="borrower-info">
                    <span className="borrower-name">{b.name}</span>
                    <span className="borrower-employer">{b.employer}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="borrower-right">
                    <span className="borrower-balance">{fmt(b.loanBalance)}</span>
                    <span className="borrower-pct">{progress}% paid</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard { display: flex; flex-direction: column; gap: 24px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--color-text); }
        .page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
        .kpi-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 18px; transition: border-color 0.2s, transform 0.2s; }
        .kpi-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
        .kpi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .kpi-label { font-size: 12px; color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
        .kpi-icon-wrap { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .kpi-value { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
        .kpi-sub { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--color-text-muted); }
        .trend-up { color: var(--color-success); }
        .trend-down { color: var(--color-warning); }
        .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
        .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; }
        .chart-card { grid-column: 1 / 2; }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .card-title { font-size: 15px; font-weight: 600; color: var(--color-text); }
        .card-link { font-size: 12px; color: var(--color-primary-light); transition: opacity 0.2s; }
        .card-link:hover { opacity: 0.7; }
        .chart-legend { display: flex; gap: 16px; margin-top: 12px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .app-list { display: flex; flex-direction: column; gap: 2px; }
        .app-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
        .app-row:last-child { border-bottom: none; }
        .app-info { display: flex; flex-direction: column; gap: 2px; }
        .app-name { font-size: 13px; font-weight: 500; color: var(--color-text); }
        .app-employer { font-size: 11px; color: var(--color-text-muted); }
        .app-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .app-amount { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .borrower-list { display: flex; flex-direction: column; gap: 14px; }
        .borrower-row { display: flex; align-items: center; gap: 10px; }
        .borrower-avatar { width: 34px; height: 34px; border-radius: 8px; background: var(--color-primary-dim); color: var(--color-primary-light); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
        .borrower-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .borrower-name { font-size: 13px; font-weight: 500; color: var(--color-text); }
        .borrower-employer { font-size: 11px; color: var(--color-text-muted); }
        .progress-bar { height: 3px; background: var(--color-border); border-radius: 2px; margin-top: 4px; }
        .progress-fill { height: 100%; background: var(--color-primary); border-radius: 2px; transition: width 0.6s ease; }
        .borrower-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .borrower-balance { font-size: 13px; font-weight: 600; color: var(--color-text); }
        .borrower-pct { font-size: 11px; color: var(--color-text-muted); }
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .chart-card { grid-column: 1; }
        }
      `}</style>
    </div>
  )
}
