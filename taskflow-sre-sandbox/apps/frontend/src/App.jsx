import { useState } from 'react'

function App() {
  const [status, setStatus] = useState('')

  const submitTask = async () => {
    try {
      setStatus('Submitting...')
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Simulated Task Payload' })
      })

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText || 'Unknown error')
        setStatus('Error submitting task: ' + text)
        return
      }

      const respData = await res.json().catch(() => null)
      if (respData && respData.success) {
        setStatus(`Task Submitted: ID ${respData.data.id}`)
      } else {
        setStatus('Error submitting task: invalid server response')
      }
    } catch (e) {
      setStatus('Error submitting task: ' + e.message)
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>TaskFlow SRE Sandbox</h1>
      <p>Simulate tasks to generate load and queue depth.</p>
      <button onClick={submitTask} style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}>
        Create Task
      </button>
      <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{status}</p>
    </div>
  )
}

export default App
