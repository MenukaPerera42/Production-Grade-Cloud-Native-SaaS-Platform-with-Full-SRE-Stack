import { useState } from 'react'

function App() {
  const [status, setStatus] = useState('')

  const submitTask = async () => {
    try {
      setStatus('Submitting...')
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'report', payload: { foo: 'bar' } })
      })
      const data = await res.json()
      setStatus(`Task Submitted: ID ${data.id}`)
    } catch (e) {
      setStatus('Error submitting task')
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
