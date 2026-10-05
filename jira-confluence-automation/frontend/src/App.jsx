import { useState } from 'react'
import './App.css'
import * as api from './api/client'

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [role, setRole] = useState('viewer')
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const session = await api.login(username, role)
      onLogin(session)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Jira/Confluence Automation Platform</h1>
        <p>Sign in to continue (prototype dev login — not real OIDC).</p>
      </header>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="login-username">
          Username
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label htmlFor="login-role">
          Role
          <select id="login-role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="viewer">Viewer (read-only)</option>
            <option value="actor">Actor (can acknowledge/complete)</option>
          </select>
        </label>
        <button type="submit">Log in</button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  )
}

function Dashboard({ session, onLogout }) {
  const [report, setReport] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [actionItems, setActionItems] = useState([])
  const [syncResult, setSyncResult] = useState(null)
  const [error, setError] = useState(null)

  async function refresh() {
    setError(null)
    try {
      const [r, a, ai] = await Promise.all([
        api.getStatusReport(session.token),
        api.getAlerts(session.token),
        api.getActionItems(session.token),
      ])
      setReport(r)
      setAlerts(a)
      setActionItems(ai)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSync() {
    setError(null)
    try {
      const result = await api.runSync(session.token)
      setSyncResult(result)
      await refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleAcknowledge(id) {
    await api.acknowledgeAlert(session.token, id)
    await refresh()
  }

  async function handleComplete(id) {
    await api.completeActionItem(session.token, id)
    await refresh()
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Jira/Confluence Automation Platform</h1>
        <p>
          Signed in as <strong>{session.username}</strong> ({session.role}) —{' '}
          <button className="link-button" onClick={onLogout}>log out</button>
        </p>
      </header>

      <section className="dashboard-panel">
        <button onClick={handleSync}>
          {session.role === 'actor' ? 'Run Sync (ingest + alerts + tracker + publish)' : 'Load Data'}
        </button>
        {session.role !== 'actor' && (
          <p className="hint">Viewer role can load/view data but cannot trigger sync or take actions.</p>
        )}
        <button onClick={refresh} style={{ marginLeft: 8 }}>Refresh</button>
        {error && <p className="error">{error}</p>}
        {syncResult && (
          <p className="hint">
            Last sync: {syncResult.counts.issuesIngested} issues ingested,{' '}
            {syncResult.counts.alertsRaised} alerts raised,{' '}
            {syncResult.counts.actionItemsExtracted} action items extracted.
          </p>
        )}
      </section>

      {report && (
        <section className="dashboard-panel">
          <h2>Status Report</h2>
          <table>
            <thead>
              <tr><th>Completed</th><th>In Progress</th><th>Overdue</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>{report.completed_issue_keys.join(', ') || '—'}</td>
                <td>{report.in_progress_issue_keys.join(', ') || '—'}</td>
                <td className={report.overdue_issue_keys.length ? 'rag-red' : ''}>
                  {report.overdue_issue_keys.join(', ') || '—'}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      <section className="dashboard-panel">
        <h2>Alerts ({alerts.filter((a) => a.acknowledgement_status === 'open').length} open)</h2>
        <table>
          <thead>
            <tr><th>Issue</th><th>Reason</th><th>Status</th>{session.role === 'actor' && <th>Action</th>}</tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id}>
                <td>{a.jira_key}</td>
                <td className={a.reason === 'overdue' ? 'rag-red' : 'rag-amber'}>{a.reason}</td>
                <td>{a.acknowledgement_status}</td>
                {session.role === 'actor' && (
                  <td>
                    {a.acknowledgement_status === 'open' && (
                      <button onClick={() => handleAcknowledge(a.id)}>Acknowledge</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {alerts.length === 0 && <tr><td colSpan={4}>No alerts yet — run sync first.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="dashboard-panel">
        <h2>Action Items ({actionItems.filter((i) => i.status === 'open').length} open)</h2>
        <table>
          <thead>
            <tr><th>Description</th><th>Owner</th><th>Due</th><th>Status</th>{session.role === 'actor' && <th>Action</th>}</tr>
          </thead>
          <tbody>
            {actionItems.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.owner}</td>
                <td>{item.due_date}</td>
                <td>{item.status}</td>
                {session.role === 'actor' && (
                  <td>
                    {item.status === 'open' && (
                      <button onClick={() => handleComplete(item.id)}>Mark Complete</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {actionItems.length === 0 && <tr><td colSpan={5}>No action items yet — run sync first.</td></tr>}
          </tbody>
        </table>
      </section>

      <footer className="dashboard-footer">
        <p>Prototype: Jira/Confluence data is mocked (fixtures); Confluence publish writes a
          versioned local Markdown file instead of calling the real API.</p>
      </footer>
    </main>
  )
}

function App() {
  const [session, setSession] = useState(null)

  if (!session) {
    return <LoginForm onLogin={setSession} />
  }
  return <Dashboard session={session} onLogout={() => setSession(null)} />
}

export default App
