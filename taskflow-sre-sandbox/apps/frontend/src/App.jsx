import { useEffect, useMemo, useState } from 'react'
import './App.css'

const monitorLinks = [
  {
    label: 'Grafana dashboard',
    href: 'http://localhost:3001',
    detail: 'Charts for traffic, errors, latency, and saturation'
  },
  {
    label: 'Prometheus',
    href: 'http://localhost:9090',
    detail: 'Raw metrics queries and scrape targets'
  },
  {
    label: 'API health',
    href: '/health',
    detail: 'Quick service uptime check'
  },
  {
    label: 'API metrics',
    href: '/metrics',
    detail: 'Prometheus-format metrics from Express'
  }
]

const processSteps = [
  {
    label: '1',
    title: 'Browser',
    text: 'A user clicks a demo action on this page.'
  },
  {
    label: '2',
    title: 'API server',
    text: 'Express receives the request and records request metrics.'
  },
  {
    label: '3',
    title: 'Demo task store',
    text: 'The current API saves demo items in memory for this UI.'
  },
  {
    label: '4',
    title: 'Monitoring',
    text: 'Prometheus and Grafana help you inspect health and behavior.'
  }
]

const advancedEndpoints = [
  { method: 'POST', path: '/api/data', purpose: 'Create one demo task item' },
  { method: 'GET', path: '/api/data', purpose: 'Read the demo task list' },
  { method: 'GET', path: '/api/data?delay=2000', purpose: 'Simulate a slower API response' },
  { method: 'GET', path: '/api/data?fail=true', purpose: 'Simulate an error for monitoring practice' },
  { method: 'GET', path: '/health', purpose: 'Check API uptime' },
  { method: 'GET', path: '/metrics', purpose: 'Expose Prometheus metrics' }
]

const formatLatency = (value) => {
  if (value === null || value === undefined) {
    return 'Not measured'
  }

  return `${value} ms`
}

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json().catch(() => null)
  }

  return response.text().catch(() => '')
}

const getErrorMessage = (body, fallback) => {
  if (!body) {
    return fallback
  }

  if (typeof body === 'string') {
    return body || fallback
  }

  return body.error?.message || body.message || fallback
}

function App() {
  const [health, setHealth] = useState({
    state: 'checking',
    title: 'Checking API',
    detail: 'Looking for the backend health endpoint.'
  })
  const [tasks, setTasks] = useState({
    state: 'checking',
    count: 0,
    items: [],
    detail: 'Loading demo tasks.'
  })
  const [lastAction, setLastAction] = useState({
    state: 'idle',
    title: 'No request yet',
    detail: 'Use a demo action to see the request result here.',
    endpoint: 'None',
    statusCode: null,
    latency: null
  })
  const [activeAction, setActiveAction] = useState('')

  const latestTask = useMemo(() => tasks.items[0], [tasks.items])

  const loadHealth = async () => {
    try {
      const response = await fetch('/health')
      const body = await parseResponseBody(response)

      if (!response.ok) {
        setHealth({
          state: 'offline',
          title: 'API health check failed',
          detail: getErrorMessage(body, response.statusText || 'The API did not return a healthy response.')
        })
        return
      }

      setHealth({
        state: 'online',
        title: 'API is online',
        detail: body?.uptime
          ? `Uptime: ${Math.round(body.uptime)} seconds`
          : 'The health endpoint returned successfully.'
      })
    } catch (error) {
      setHealth({
        state: 'offline',
        title: 'API is not reachable',
        detail: error.message
      })
    }
  }

  const loadTasks = async ({ recordAction = false } = {}) => {
    const startedAt = performance.now()

    if (recordAction) {
      setActiveAction('refresh')
      setLastAction({
        state: 'running',
        title: 'Refreshing demo tasks',
        detail: 'Reading the current list from GET /api/data.',
        endpoint: 'GET /api/data',
        statusCode: null,
        latency: null
      })
    }

    try {
      const response = await fetch('/api/data')
      const body = await parseResponseBody(response)
      const latency = Math.round(performance.now() - startedAt)

      if (!response.ok || !body?.success) {
        const message = getErrorMessage(body, response.statusText || 'The API did not return demo tasks.')
        setTasks({
          state: 'error',
          count: tasks.count,
          items: tasks.items,
          detail: message
        })

        if (recordAction) {
          setLastAction({
            state: 'error',
            title: 'Refresh failed',
            detail: message,
            endpoint: 'GET /api/data',
            statusCode: response.status,
            latency
          })
        }
        return
      }

      const items = Array.isArray(body.data) ? [...body.data].reverse() : []
      setTasks({
        state: 'ready',
        count: body.count ?? items.length,
        items,
        detail: `${body.count ?? items.length} demo tasks are visible to the frontend.`
      })

      if (recordAction) {
        setLastAction({
          state: 'success',
          title: 'Task list refreshed',
          detail: 'The frontend read the latest demo data from the API.',
          endpoint: 'GET /api/data',
          statusCode: response.status,
          latency
        })
      }
    } catch (error) {
      setTasks({
        state: 'error',
        count: tasks.count,
        items: tasks.items,
        detail: error.message
      })

      if (recordAction) {
        setLastAction({
          state: 'error',
          title: 'Refresh failed',
          detail: error.message,
          endpoint: 'GET /api/data',
          statusCode: null,
          latency: Math.round(performance.now() - startedAt)
        })
      }
    } finally {
      if (recordAction) {
        setActiveAction('')
      }
    }
  }

  const runRequest = async ({
    actionKey,
    endpoint,
    method = 'GET',
    body,
    runningTitle,
    successTitle,
    successDetail,
    expectedError = false
  }) => {
    const startedAt = performance.now()
    setActiveAction(actionKey)
    setLastAction({
      state: 'running',
      title: runningTitle,
      detail: 'Waiting for the API response.',
      endpoint: `${method} ${endpoint}`,
      statusCode: null,
      latency: null
    })

    try {
      const response = await fetch(endpoint, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
      })
      const responseBody = await parseResponseBody(response)
      const latency = Math.round(performance.now() - startedAt)

      if (!response.ok) {
        const message = getErrorMessage(responseBody, response.statusText || 'The API returned an error.')
        setLastAction({
          state: expectedError ? 'warning' : 'error',
          title: expectedError ? 'Expected failure captured' : `${successTitle} failed`,
          detail: expectedError
            ? `This is the planned error demo. The API returned: ${message}`
            : message,
          endpoint: `${method} ${endpoint}`,
          statusCode: response.status,
          latency
        })
        return
      }

      setLastAction({
        state: 'success',
        title: successTitle,
        detail: typeof successDetail === 'function' ? successDetail(responseBody, latency) : successDetail,
        endpoint: `${method} ${endpoint}`,
        statusCode: response.status,
        latency
      })

      if (method === 'POST' || endpoint === '/api/data') {
        await loadTasks()
      }
    } catch (error) {
      setLastAction({
        state: 'error',
        title: `${successTitle} failed`,
        detail: error.message,
        endpoint: `${method} ${endpoint}`,
        statusCode: null,
        latency: Math.round(performance.now() - startedAt)
      })
    } finally {
      setActiveAction('')
      loadHealth()
    }
  }

  const createTask = () => {
    const label = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

    runRequest({
      actionKey: 'create',
      endpoint: '/api/data',
      method: 'POST',
      body: {
        name: `Demo task created at ${label}`,
        status: 'pending'
      },
      runningTitle: 'Creating a demo task',
      successTitle: 'Demo task created',
      successDetail: (body) => {
        const id = body?.data?.id ? ` ID ${body.data.id}` : ''
        return `The API accepted the request and saved a demo item in memory.${id}`
      }
    })
  }

  const runSlowRequest = () => {
    runRequest({
      actionKey: 'slow',
      endpoint: '/api/data?delay=2000',
      runningTitle: 'Sending a slow request',
      successTitle: 'Slow request completed',
      successDetail: (_body, latency) => `The API waited on purpose, then returned successfully in ${latency} ms.`
    })
  }

  const runFailureRequest = () => {
    runRequest({
      actionKey: 'failure',
      endpoint: '/api/data?fail=true',
      runningTitle: 'Triggering a planned failure',
      successTitle: 'Failure demo',
      successDetail: 'The failure endpoint unexpectedly returned success.',
      expectedError: true
    })
  }

  useEffect(() => {
    loadHealth()
    loadTasks()
  }, [])

  const hasActiveAction = Boolean(activeAction)

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">SRE learning sandbox</p>
          <h1>TaskFlow SRE Sandbox</h1>
          <p className="hero-copy">
            A simple place to learn how a SaaS-style system receives requests, creates useful signals,
            and shows those signals in monitoring tools.
          </p>
          <div className="hero-actions" aria-label="Primary demo actions">
            <button className="primary-button" onClick={createTask} disabled={hasActiveAction}>
              {activeAction === 'create' ? 'Creating...' : 'Create demo task'}
            </button>
            <button className="secondary-button" onClick={() => loadTasks({ recordAction: true })} disabled={hasActiveAction}>
              {activeAction === 'refresh' ? 'Refreshing...' : 'Refresh tasks'}
            </button>
          </div>
        </div>
      </section>

      <section className="monitor-section" aria-labelledby="monitor-title">
        <div className="section-header compact">
          <div>
            <p className="section-kicker">What to monitor</p>
            <h2 id="monitor-title">Open the live views</h2>
          </div>
          <p>
            Use these links when you want to check health, inspect raw metrics, or view charts.
          </p>
        </div>
        <div className="monitor-links">
          {monitorLinks.map((link) => (
            <a key={link.href} className="monitor-link" href={link.href} target="_blank" rel="noreferrer">
              <span>{link.label}</span>
              <small>{link.detail}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="metrics-section" aria-label="Current sandbox status">
        <article className={`status-card ${health.state}`}>
          <span className="status-label">API health</span>
          <strong>{health.title}</strong>
          <p>{health.detail}</p>
        </article>
        <article className={`status-card ${tasks.state}`}>
          <span className="status-label">Demo tasks</span>
          <strong>{tasks.count}</strong>
          <p>{tasks.detail}</p>
        </article>
        <article className={`status-card ${lastAction.state}`}>
          <span className="status-label">Last latency</span>
          <strong>{formatLatency(lastAction.latency)}</strong>
          <p>{lastAction.endpoint}</p>
        </article>
        <article className={`status-card ${lastAction.state}`}>
          <span className="status-label">Last status</span>
          <strong>{lastAction.statusCode ?? 'None'}</strong>
          <p>{lastAction.title}</p>
        </article>
      </section>

      <section className="content-section" aria-labelledby="process-title">
        <div className="section-header">
          <div>
            <p className="section-kicker">How it works</p>
            <h2 id="process-title">The live demo path</h2>
          </div>
          <p>
            The buttons on this page use the current API contract. They generate HTTP traffic that can be
            watched through health checks, metrics, Prometheus, and Grafana.
          </p>
        </div>
        <div className="process-grid">
          {processSteps.map((step) => (
            <article className="process-step" key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
        <div className="truth-note">
          <strong>Current demo note:</strong>
          <span>
            This frontend does not claim the create button has gone through Redis or the worker. In this
            version, the API keeps demo items in memory while still exposing request metrics for SRE practice.
          </span>
        </div>
      </section>

      <section className="content-section action-section" aria-labelledby="demo-title">
        <div className="section-header">
          <div>
            <p className="section-kicker">Try it</p>
            <h2 id="demo-title">Generate behavior to observe</h2>
          </div>
          <p>
            Start with the normal request, then try slow and failed requests to see how monitoring data changes.
          </p>
        </div>

        <div className="action-grid">
          <article className="action-card">
            <h3>Normal path</h3>
            <p>
              Create a demo item with <code>POST /api/data</code> and watch the task count increase.
            </p>
            <button onClick={createTask} disabled={hasActiveAction}>
              {activeAction === 'create' ? 'Creating...' : 'Create task'}
            </button>
          </article>
          <article className="action-card">
            <h3>Latency path</h3>
            <p>
              Call <code>GET /api/data?delay=2000</code> to make the API respond slowly on purpose.
            </p>
            <button onClick={runSlowRequest} disabled={hasActiveAction}>
              {activeAction === 'slow' ? 'Running...' : 'Run slow request'}
            </button>
          </article>
          <article className="action-card">
            <h3>Error path</h3>
            <p>
              Call <code>GET /api/data?fail=true</code> to practice reading a controlled failure.
            </p>
            <button onClick={runFailureRequest} disabled={hasActiveAction}>
              {activeAction === 'failure' ? 'Triggering...' : 'Trigger failure'}
            </button>
          </article>
        </div>

        <article className={`result-panel ${lastAction.state}`} aria-live="polite">
          <div>
            <span className="status-label">Last action</span>
            <h3>{lastAction.title}</h3>
            <p>{lastAction.detail}</p>
          </div>
          <dl>
            <div>
              <dt>Endpoint</dt>
              <dd>{lastAction.endpoint}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{lastAction.statusCode ?? 'None'}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>{formatLatency(lastAction.latency)}</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="content-section learning-section" aria-labelledby="learning-title">
        <div className="section-header">
          <div>
            <p className="section-kicker">Beginner and advanced views</p>
            <h2 id="learning-title">Use the same page at any skill level</h2>
          </div>
        </div>
        <div className="learning-grid">
          <article className="learning-card">
            <h3>For beginners</h3>
            <p>
              Think of the API like the front desk. The frontend asks for work, the API replies, and monitoring
              tells you whether the service is healthy, slow, busy, or failing.
            </p>
            <ul>
              <li>Green health means the API can answer basic checks.</li>
              <li>Latency tells you how long a request took.</li>
              <li>Errors show requests that did not finish successfully.</li>
            </ul>
          </article>
          <article className="learning-card">
            <h3>For SRE and DevOps users</h3>
            <p>
              This page produces traffic against the existing Express endpoints and gives quick access to
              Golden Signal dashboards and Prometheus metrics.
            </p>
            <div className="endpoint-list">
              {advancedEndpoints.map((endpoint) => (
                <div className="endpoint-row" key={`${endpoint.method}-${endpoint.path}`}>
                  <code>{endpoint.method}</code>
                  <span>{endpoint.path}</span>
                  <small>{endpoint.purpose}</small>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="content-section task-section" aria-labelledby="tasks-title">
        <div className="section-header compact">
          <div>
            <p className="section-kicker">Latest demo data</p>
            <h2 id="tasks-title">What the frontend can currently see</h2>
          </div>
          <button className="secondary-button" onClick={() => loadTasks({ recordAction: true })} disabled={hasActiveAction}>
            {activeAction === 'refresh' ? 'Refreshing...' : 'Refresh list'}
          </button>
        </div>

        <div className="task-list">
          {latestTask ? (
            tasks.items.slice(0, 5).map((task) => (
              <article className="task-row" key={task.id}>
                <div>
                  <strong>{task.name}</strong>
                  <span>{task.createdAt ? `Created ${new Date(task.createdAt).toLocaleString()}` : 'Seed demo item'}</span>
                </div>
                <small>{task.status || 'unknown'}</small>
              </article>
            ))
          ) : (
            <article className="empty-state">
              <strong>No demo tasks loaded yet.</strong>
              <span>Create one task or refresh the list when the API is running.</span>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
