import { Settings, Shield, Bell, Building2, Link, Save } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="settings">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Platform configuration and integration management</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <div className="section-header">
            <Settings size={16} />
            <h3>General Configuration</h3>
          </div>
          <div className="settings-card">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Platform Name</span>
                <span className="setting-desc">Displayed in borrower-facing communications</span>
              </div>
              <input className="setting-input" defaultValue="PayLink" />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Default Loan Cap (% of Salary)</span>
                <span className="setting-desc">Maximum loan amount relative to annual salary</span>
              </div>
              <input className="setting-input" defaultValue="25%" />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Max Repayment Deduction</span>
                <span className="setting-desc">Cap on per-paycheck deduction percentage</span>
              </div>
              <input className="setting-input" defaultValue="8%" />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Interest Rate Model</span>
                <span className="setting-desc">Pricing model used for loan APR calculation</span>
              </div>
              <select className="setting-select">
                <option>Risk-adjusted flat rate</option>
                <option>Tiered by credit score</option>
                <option>Fixed rate (all borrowers)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <Shield size={16} />
            <h3>Risk & Compliance</h3>
          </div>
          <div className="settings-card">
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Minimum Credit Score</span>
                <span className="setting-desc">Borrowers below this threshold are auto-declined</span>
              </div>
              <input className="setting-input" defaultValue="620" />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Max DTI Ratio</span>
                <span className="setting-desc">Maximum debt-to-income ratio for approval</span>
              </div>
              <input className="setting-input" defaultValue="40%" />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Min Employment Duration</span>
                <span className="setting-desc">Minimum months employed before eligible</span>
              </div>
              <input className="setting-input" defaultValue="6 months" />
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Employer Verification Required</span>
                <span className="setting-desc">Require payroll API integration before lending</span>
              </div>
              <div className="toggle-wrap">
                <div className="toggle on" />
                <span className="toggle-label">Enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <Link size={16} />
            <h3>Payroll Integrations</h3>
          </div>
          <div className="settings-card">
            {[
              { name: 'Gusto', status: 'connected', desc: 'Real-time payroll sync' },
              { name: 'ADP Workforce', status: 'connected', desc: 'Enterprise HR & payroll' },
              { name: 'Rippling', status: 'pending', desc: 'Pending API credentials' },
              { name: 'Paychex', status: 'disconnected', desc: 'Not configured' },
            ].map(integ => (
              <div key={integ.name} className="integ-row">
                <div className="integ-icon"><Building2 size={16} /></div>
                <div className="integ-info">
                  <span className="integ-name">{integ.name}</span>
                  <span className="integ-desc">{integ.desc}</span>
                </div>
                <span className={`badge badge-${integ.status === 'connected' ? 'success' : integ.status === 'pending' ? 'warning' : 'neutral'}`}>
                  {integ.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <Bell size={16} />
            <h3>Notifications</h3>
          </div>
          <div className="settings-card">
            {[
              { label: 'New loan applications', desc: 'Notify when new applications are submitted', on: true },
              { label: 'Missed repayments', desc: 'Alert when a scheduled deduction fails', on: true },
              { label: 'Employer sync failures', desc: 'Alert on payroll API disconnections', on: true },
              { label: 'Weekly portfolio digest', desc: 'Summary of key metrics every Monday', on: false },
            ].map(n => (
              <div key={n.label} className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">{n.label}</span>
                  <span className="setting-desc">{n.desc}</span>
                </div>
                <div className="toggle-wrap">
                  <div className={`toggle ${n.on ? 'on' : 'off'}`} />
                  <span className="toggle-label">{n.on ? 'On' : 'Off'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-save">
          <Save size={14} />
          Save Changes
        </button>
      </div>

      <style>{`
        .settings { display: flex; flex-direction: column; gap: 24px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .page-title { font-size: 24px; font-weight: 700; color: var(--color-text); }
        .page-subtitle { font-size: 13px; color: var(--color-text-muted); margin-top: 4px; }
        .settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .settings-section { display: flex; flex-direction: column; gap: 10px; }
        .section-header { display: flex; align-items: center; gap: 8px; color: var(--color-text); font-size: 14px; font-weight: 600; padding: 0 2px; }
        .settings-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; }
        .setting-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; border-bottom: 1px solid var(--color-border); }
        .setting-row:last-child { border-bottom: none; }
        .setting-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .setting-label { font-size: 13px; font-weight: 500; color: var(--color-text); }
        .setting-desc { font-size: 11px; color: var(--color-text-muted); }
        .setting-input { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text); font-size: 13px; padding: 6px 10px; min-width: 120px; outline: none; transition: border-color 0.2s; }
        .setting-input:focus { border-color: var(--color-primary); }
        .setting-select { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: 6px; color: var(--color-text); font-size: 13px; padding: 6px 10px; min-width: 160px; outline: none; cursor: pointer; }
        .toggle-wrap { display: flex; align-items: center; gap: 8px; }
        .toggle { width: 36px; height: 20px; border-radius: 100px; cursor: pointer; transition: background 0.2s; position: relative; }
        .toggle::after { content: ''; position: absolute; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: white; transition: left 0.2s; }
        .toggle.on { background: var(--color-primary); }
        .toggle.on::after { left: 19px; }
        .toggle.off { background: var(--color-border); }
        .toggle.off::after { left: 3px; }
        .toggle-label { font-size: 12px; color: var(--color-text-muted); }
        .integ-row { display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-bottom: 1px solid var(--color-border); }
        .integ-row:last-child { border-bottom: none; }
        .integ-icon { width: 32px; height: 32px; border-radius: 8px; background: var(--color-surface-2); display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); flex-shrink: 0; }
        .integ-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .integ-name { font-size: 13px; font-weight: 500; color: var(--color-text); }
        .integ-desc { font-size: 11px; color: var(--color-text-muted); }
        .settings-actions { display: flex; justify-content: flex-end; }
        .btn-save { display: flex; align-items: center; gap: 7px; padding: 10px 22px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .btn-save:hover { background: var(--color-primary-light); transform: translateY(-1px); }
        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
