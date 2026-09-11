import { useEffect, useMemo, useState } from 'react'
import { Activity, CheckCircle2, ChevronRight, Clock3, Filter, GitBranch, LayoutDashboard, Plus, RefreshCw, Search, ShieldCheck, XCircle, Zap } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

type Status = 'PENDING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'FAILED'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
type Request = {
  id:number; type:string; priority:Priority; status:Status; requester:string
  application:string; description:string; assignee?:string; createdAt:string
}
type Metrics = { total:number; pending:number; approved:number; inProgress:number; completed:number; failed:number }

function App() {
  const [requests, setRequests] = useState<Request[]>([])
  const [metrics, setMetrics] = useState<Metrics>({total:0,pending:0,approved:0,inProgress:0,completed:0,failed:0})
  const [selected, setSelected] = useState<Request | null>(null)
  const [status, setStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    const [r, m] = await Promise.all([
      fetch(`${API}/api/requests`).then(x => x.json()),
      fetch(`${API}/api/metrics`).then(x => x.json())
    ])
    setRequests(r); setMetrics(m); setLoading(false)
    if (selected) setSelected(r.find((x:Request) => x.id === selected.id) || null)
  }

  useEffect(() => { load().catch(() => setLoading(false)) }, [])

  const filtered = useMemo(() => requests.filter(r => {
    const matchStatus = status === 'ALL' || r.status === status
    const q = search.toLowerCase()
    const matchSearch = !q || `${r.id} ${r.requester} ${r.application} ${r.type}`.toLowerCase().includes(q)
    return matchStatus && matchSearch
  }), [requests, status, search])

  async function action(id:number, path:string, body?:object) {
    await fetch(`${API}/api/requests/${id}/${path}`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: body ? JSON.stringify(body) : undefined
    })
    setNotice(`Request #${id} updated`)
    await load()
  }

  async function create(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    await fetch(`${API}/api/requests`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        type:data.get('type'), priority:data.get('priority'), requester:data.get('requester'),
        application:data.get('application'), description:data.get('description')
      })
    })
    setShowForm(false); setNotice('Request created'); await load()
  }

  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="logo"><Zap size={20}/></div><span>OpsFlow</span></div>
      <nav><div className="nav active"><LayoutDashboard size={18}/> Overview</div><div className="nav"><Activity size={18}/> Operations</div><div className="nav"><ShieldCheck size={18}/> Integrations</div></nav>
      <div className="side-bottom"><div className="health-dot"></div><div><b>System healthy</b><small>All services operational</small></div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div><div className="eyebrow">INTERNAL OPERATIONS</div><h1>Operations overview</h1></div><div className="top-actions"><button className="ghost" onClick={load}><RefreshCw size={16}/> Refresh</button><button className="primary" onClick={()=>setShowForm(true)}><Plus size={17}/> New request</button></div></header>

      {notice && <div className="notice">{notice}<button onClick={()=>setNotice('')}>×</button></div>}

      <section className="metrics">
        <Metric label="Total requests" value={metrics.total} icon={<LayoutDashboard/>}/>
        <Metric label="Pending approval" value={metrics.pending} icon={<Clock3/>}/>
        <Metric label="In progress" value={metrics.inProgress} icon={<Activity/>}/>
        <Metric label="Completed" value={metrics.completed} icon={<CheckCircle2/>}/>
        <Metric label="Failed" value={metrics.failed} icon={<XCircle/>} danger/>
      </section>

      <section className="content-grid">
        <div className="panel requests-panel">
          <div className="panel-head">
            <div><h2>Requests</h2><p>Business workflow queue</p></div>
            <div className="filters">
              <div className="search"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search"/></div>
              <select value={status} onChange={e=>setStatus(e.target.value)}><option value="ALL">All status</option><option>PENDING_APPROVAL</option><option>APPROVED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>FAILED</option><option>REJECTED</option></select>
              <Filter size={17} className="filter-icon"/>
            </div>
          </div>
          <div className="table-wrap">
            <table><thead><tr><th>ID</th><th>REQUEST</th><th>REQUESTER</th><th>PRIORITY</th><th>STATUS</th><th></th></tr></thead>
            <tbody>{loading ? <tr><td colSpan={6} className="empty">Loading requests…</td> : filtered.map(r=><tr key={r.id} onClick={()=>setSelected(r)}>
              <td className="id">#{r.id}</td><td><b>{labelType(r.type)}</b><small>{r.application}</small></td><td>{r.requester}</td><td><span className={`priority ${r.priority.toLowerCase()}`}>{r.priority}</span></td><td><StatusBadge status={r.status}/></td><td><ChevronRight size={17}/></td>
            </tr>)}</tbody></table>
          </div>
        </div>

        <div className="panel health-panel">
          <div className="panel-head"><div><h2>Integration health</h2><p>External service status</p></div><div className="live">LIVE</div></div>
          <Integration name="GitHub" detail="Repository & access API" ok/>
          <Integration name="Jira" detail="Ticket management API" ok/>
          <Integration name="Vendor API" detail="Incident workflow" ok={metrics.failed < 2}/>
          <div className="architecture"><div className="arch-title">Workflow pipeline</div><div className="pipeline"><span>Request</span><i>→</i><span>Validate</span><i>→</i><span>Approve</span><i>→</i><span>Automate</span></div></div>
        </div>
      </section>
    </main>

    {selected && <Drawer r={selected} close={()=>setSelected(null)} action={action}/>}
    {showForm && <Modal close={()=>setShowForm(false)} submit={create}/>}
  </div>
}

function Metric({label,value,icon,danger=false}:{label:string,value:number,icon:React.ReactNode,danger?:boolean}) {
  return <div className={`metric ${danger?'metric-danger':''}`}><div className="metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>
}
function StatusBadge({status}:{status:Status}) {
  const text=status.replace('_',' ')
  return <span className={`badge ${status.toLowerCase()}`}><i></i>{text}</span>
}
function Integration({name,detail,ok}:{name:string,detail:string,ok:boolean}) {
  return <div className="integration"><div className="integration-icon"><GitBranch size={17}/></div><div><b>{name}</b><small>{detail}</small></div><span className={`integration-status ${ok?'ok':'bad'}`}>{ok?'Operational':'Degraded'}</span></div>
}
function labelType(t:string) { return t.split('_').map(x=>x[0]+x.slice(1).toLowerCase()).join(' ') }

function Drawer({r,close,action}:{r:Request,close:()=>void,action:(id:number,path:string,body?:object)=>Promise<void>}) {
  const [audit,setAudit]=useState<any[]>([])
  useEffect(()=>{fetch(`${API}/api/requests/${r.id}/audit`).then(x=>x.json()).then(setAudit)},[r.id])
  return <div className="overlay" onClick={close}><div className="drawer" onClick={e=>e.stopPropagation()}>
    <div className="drawer-head"><div><span className="eyebrow">REQUEST #{r.id}</span><h2>{labelType(r.type)}</h2></div><button className="close" onClick={close}>×</button></div>
    <StatusBadge status={r.status}/>
    <div className="detail"><div><span>Requester</span><b>{r.requester}</b></div><div><span>Application</span><b>{r.application}</b></div><div><span>Priority</span><b>{r.priority}</b></div><div><span>Assignee</span><b>{r.assignee || 'Unassigned'}</b></div></div>
    <div className="description"><span>Description</span><p>{r.description}</p></div>
    <div className="drawer-actions">{r.status==='PENDING_APPROVAL' && <><button className="primary" onClick={()=>action(r.id,'approve',{actor:'manager'})}>Approve</button><button className="danger-btn" onClick={()=>action(r.id,'reject',{actor:'manager'})}>Reject</button></>}{r.status==='APPROVED' && <button className="primary" onClick={()=>action(r.id,'execute')}>Run workflow</button>}{r.status==='FAILED' && <button className="ghost" onClick={()=>action(r.id,'execute')}>Retry workflow</button>}</div>
    <div className="audit"><h3>Audit history</h3>{audit.map(a=><div className="audit-row" key={a.id}><div className="audit-dot"></div><div><b>{a.action.replaceAll('_',' ')}</b><small>{a.actor} · {new Date(a.createdAt).toLocaleString()}</small><p>{a.details}</p></div></div>)}</div>
  </div></div>
}
function Modal({close,submit}:{close:()=>void,submit:(e:React.FormEvent<HTMLFormElement>)=>Promise<void>}) {
  return <div className="overlay" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">NEW WORKFLOW</span><h2>Create request</h2></div><button className="close" onClick={close}>×</button></div>
    <form onSubmit={submit}><label>Request type<select name="type" defaultValue="ACCESS"><option>ACCESS</option><option>REPOSITORY</option><option>CLOUD_RESOURCE</option><option>INCIDENT</option><option>ACCOUNT</option></select></label><label>Priority<select name="priority" defaultValue="MEDIUM"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label><label>Requester<input name="requester" required placeholder="Your name"/></label><label>Application<input name="application" required placeholder="e.g. GitHub"/></label><label>Description<textarea name="description" required placeholder="Describe the business requirement…"/></label><div className="form-actions"><button type="button" className="ghost" onClick={close}>Cancel</button><button className="primary">Create request</button></div></form>
  </div></div>
}

export default App
