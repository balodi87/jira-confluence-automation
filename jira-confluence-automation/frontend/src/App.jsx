import './App.css'

function App() {
  const stubReports = [
    { project: 'Platform Core', status: 'Green', overdue: 0, alerts: 0 },
    { project: 'Mobile App', status: 'Amber', overdue: 2, alerts: 1 },
  ]

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Jira/Confluence Automation Platform</h1>
        <p>Weekly status reports, overdue/blocker alerts, and decision tracking — in one place.</p>
      </header>

      <section className="dashboard-panel">
        <h2>Project Status (placeholder data)</h2>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>RAG Status</th>
              <th>Overdue Issues</th>
              <th>Active Alerts</th>
            </tr>
          </thead>
          <tbody>
            {stubReports.map((report) => (
              <tr key={report.project}>
                <td>{report.project}</td>
                <td className={`rag-${report.status.toLowerCase()}`}>{report.status}</td>
                <td>{report.overdue}</td>
                <td>{report.alerts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="dashboard-footer">
        <p>Phase 1 scaffold — T011. Live Jira/Confluence data lands in Phase 3+.</p>
      </footer>
    </main>
  )
}

export default App
