import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { repaymentHistory, borrowers, employers } from '../data/mock'

const riskBreakdown = [
  { name: 'Low Risk', value: borrowers.filter(b => b.riskScore === 'low').length, color: '#22c55e' },
  { name: 'Medium Risk', value: borrowers.filter(b => b.riskScore === 'medium').length, color: '#f59e0b' },
  { name: 'High Risk', value: borrowers.filter(b => b.riskScore === 'high').length, color: '#ef4444' },
]

const industryData = employers.map(e => ({
  name: e.name.split(' ')[0],
  enrolled: e.enrolledEmployees,
  total: e.employees,
}))

const defaultTrend = repaymentHistory.map(r => ({
  month: r.month,
  defaultRate: ((r.defaulted / r.disbursed) * 100).toFixed(2),
  repayRate: ((r.repaid / r.disbursed) * 100).toFixed(1),
}))

export default function Analytics() {
  return (
    <div className="analytics">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Portfolio performance and risk intelligence</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card animate-in">
          <div className="card-header">
            <h3 className="card-title">Monthly Disbursement vs Repayment</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={repaymentHistory} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8892b0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8892b0' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}K`} />
              <Tooltip
                contentStyle={{ background: '#1e2236', border: '1px solid #2a2f4a', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, n: string) => [`$${(v/1000).toFixed(0)}K`, n.charAt(0).toUpperCase() + n.slice(1)]}
              />
              <Bar dataKey="disbursed" fill="#4f7aff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="repaid" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card animate-in">
          <div className="card-header">
            <h3 className="card-title">Borrower Risk Distribution</h3>
          </div>
          <div className="pie-wrap">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={riskBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e2236', border: '1px solid #2a2f4a', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {riskBreakdown.map(r => (
                <div key={r.name} className="pie-legend-item">
                  <span className="legend-dot" style={{ background: r.color }} />
                  <span className="legend-name">{r.name}</span>
                  <span className="legend-val">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card animate-in">
          <div className="card-header">
            <h3 className="card-title">Default Rate Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={defaultTrend}>
              <CartesianGrid stroke="#2a2f4a" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8892b0' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8892b0' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#1e2236', border: '1px solid #2a2f4a', borderRadius: 8, fontSize: 12 }}
                formatter={(v: string, n: string) => [`${v}%`, n === 'defaultRate' ? 'Default Rate' : 'Repay Rate']}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="defaultRate" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} name="defaultRate" />
              <Line type="monotone" dataKey="repayRate" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="repayRate" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card animate-in">
          <div className="card-header">
            <h3 className="card-title">Employer Enrollment Penetration</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={industryData} layout="vertical" barCategoryGap="30%">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#8892b0' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#8892b0' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                contentStyle={{ background: '#1e2236', border: '1px solid #2a2f4a', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="total" fill="#2a2f4a" radius={[0, 4, 4, 0]} name="Total Employees" />
              <Bar dataKey="enrolled" fill="#4f7aff" radius={[0, 4, 4, 0]} name="Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="insights-row">
        <div className="insight-card animate-in">
          <div className="insight-icon success-bg">✓</div>
          <div>
            <div className="insight-title">Payroll deduction reduces default risk by 78%</div>
            <div className="insight-body">Compared to unsecured personal loans, salary-linked repayment maintains near-perfect collection rates across all employer segments.</div>
          </div>
        </div>
        <div className="insight-card animate-in">
          <div className="insight-icon warn-bg">!</div>
          <div>
            <div className="insight-title">BuildRight LLC pending verification</div>
            <div className="insight-body">Employer payroll API integration is pending for BuildRight LLC. 1 loan application is on hold pending employer confirmation.</div>
          </div>
        </div>
        <div className="insight-card animate-in">
          <div className="insight-icon primary-bg">↑</div>
          <div>
            <div className="insight-title">Healthcare sector showing strongest growth</div>
            <div className="insight-body">HealthFirst Group's 214 enrolled employees represent a 5.6% enrollment rate. Increasing to 8% would add $1.1M in portfolio volume.</div>
          </div>
        </div>
      </div>

      <style>{`
        .analytics { display: flex; flex-direction: column; gap: 24px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--color-text); }
        .page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .analytics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .chart-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 20px; }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .card-title { font-size: 15px; font-weight: 600; color: var(--color-text); }
        .pie-wrap { display: flex; align-items: center; gap: 0; }
        .pie-legend { flex: 1; display: flex; flex-direction: column; gap: 10px; padding-left: 8px; }
        .pie-legend-item { display: flex; align-items: center; gap: 8px; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .legend-name { font-size: 13px; color: var(--color-text-muted); flex: 1; }
        .legend-val { font-size: 14px; font-weight: 600; color: var(--color-text); }
        .insights-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .insight-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 18px; display: flex; gap: 14px; align-items: flex-start; transition: border-color 0.2s; }
        .insight-card:hover { border-color: var(--color-primary); }
        .insight-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; }
        .success-bg { background: var(--color-success-dim); color: var(--color-success); }
        .warn-bg { background: var(--color-warning-dim); color: var(--color-warning); }
        .primary-bg { background: var(--color-primary-dim); color: var(--color-primary-light); }
        .insight-title { font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
        .insight-body { font-size: 12px; color: var(--color-text-muted); line-height: 1.5; }
        @media (max-width: 768px) {
          .analytics-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
