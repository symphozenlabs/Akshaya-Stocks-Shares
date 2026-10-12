import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  Archive, ArrowRight, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronRight, CircleDollarSign,
  CloudUpload, Download, Edit3, Eye, FileSpreadsheet, Gift, HandCoins, Home, Landmark, LayoutDashboard,
  LockKeyhole, LogIn, LogOut, Mail, Menu, Moon, MoreHorizontal, Phone, PieChart, Plus, Printer,
  Search, Settings, ShieldCheck, Sparkles, Sun, TrendingUp, Upload, UserPlus, Users, WalletCards, X,
} from 'lucide-react'
import Papa from 'papaparse'
import {
  EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, sendEmailVerification,
  sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updatePassword,
} from 'firebase/auth'
import {
  addDoc, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, Timestamp, updateDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { csvRowToCustomer, dobToIso, filterCustomers, PRODUCTS, rowsToCsv, todaysBirthdays, validateCustomer } from './lib'

const ADMIN_EMAIL = 'akshayastocksshares@gmail.com'
const FILTERS = ['All', 'Shares', 'Mutual Funds', 'Forex', 'Others']

const cx = (...items) => items.filter(Boolean).join(' ')

function Logo({ inverse = false }) {
  return (
    <Link to="/" className={cx('brand', inverse && 'brand-inverse')} aria-label="Akshaya Stocks and Shares home">
      <span className="brand-mark"><TrendingUp size={22} strokeWidth={2.5} /></span>
      <span><strong>Akshaya</strong><small>Stocks & Shares</small></span>
    </Link>
  )
}

function PublicHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="public-header">
      <Logo />
      <button className="icon-button mobile-menu" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation"><Menu /></button>
      <nav className={cx('public-nav', open && 'open')} onClick={() => setOpen(false)}>
        <NavLink to="/">Home</NavLink><NavLink to="/about">About</NavLink><NavLink to="/services">Services</NavLink><NavLink to="/contact">Contact</NavLink>
        <Link className="button button-dark nav-login" to="/login"><LockKeyhole size={17} /> CRM Login</Link>
      </nav>
    </header>
  )
}

function MoneyScene({ compact = false }) {
  return (
    <div className={cx('money-scene', compact && 'compact')} aria-label="Animated wealth growth visualization">
      <div className="scene-glow" />
      {[1, 2, 3, 4, 5].map((n) => <div key={`note-${n}`} className={`flying-note note-${n}`}><span>₹</span><i /></div>)}
      {[1, 2, 3, 4, 5, 6].map((n) => <div key={`coin-${n}`} className={`flying-coin coin-${n}`}>₹</div>)}
      <div className="wealth-card">
        <div className="wealth-card-top"><span>Portfolio outlook</span><span className="live-dot">Live</span></div>
        <strong>Purpose-led growth</strong>
        <svg viewBox="0 0 420 150" role="img" aria-label="Rising investment chart">
          <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e7b86c" stopOpacity=".5"/><stop offset="1" stopColor="#e7b86c" stopOpacity="0"/></linearGradient></defs>
          <path className="area" d="M0 134 C40 122,58 116,88 120 S135 92,170 99 S220 75,252 82 S300 45,333 56 S382 21,420 12 L420 150 L0 150Z" />
          <path className="line" d="M0 134 C40 122,58 116,88 120 S135 92,170 99 S220 75,252 82 S300 45,333 56 S382 21,420 12" />
        </svg>
        <div className="chart-labels"><span>Clarity</span><span>Consistency</span><span>Confidence</span></div>
      </div>
    </div>
  )
}

function IntroLoader({ onDone }) {
  useEffect(() => { const id = setTimeout(onDone, 1900); return () => clearTimeout(id) }, [onDone])
  return <div className="intro-loader"><MoneyScene compact /><p>Building brighter financial tomorrows</p><span className="loader-line"><i /></span></div>
}

function HomePage() {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('akshaya-intro-seen'))
  const finish = () => { sessionStorage.setItem('akshaya-intro-seen', '1'); setLoading(false) }
  if (loading) return <IntroLoader onDone={finish} />
  return (
    <div className="public-page">
      <PublicHeader />
      <main>
        <section className="hero shell">
          <div className="hero-copy reveal">
            <span className="eyebrow"><Sparkles size={15} /> Progress begins with a clear plan</span>
            <h1>Grow with clarity.<br/><em>Invest with confidence.</em></h1>
            <p>Thoughtful guidance across shares, mutual funds, currencies and other investments—built around your goals and backed by trusted personal service in Salem.</p>
            <div className="hero-actions"><Link to="/contact" className="button button-gold">Start a conversation <ArrowRight size={18} /></Link><Link to="/services" className="text-link">Explore our services <ChevronRight size={17}/></Link></div>
            <div className="trust-row"><div className="avatar-stack"><span>AS</span><span>₹</span><span>+</span></div><p><strong>Personal, practical guidance</strong><small>For every stage of your wealth journey</small></p></div>
          </div>
          <MoneyScene />
        </section>
        <section className="marquee"><div>Shares <i/> Mutual Funds <i/> Forex & Dollar <i/> Other Investments <i/> Long-term relationships <i/> Thoughtful action</div></section>
        <section className="section shell philosophy">
          <div><span className="eyebrow">The Akshaya approach</span><h2>Money should create possibilities, not pressure.</h2></div>
          <div><p>We believe positive financial progress comes from informed decisions, disciplined action and a relationship you can rely on. No noise—just a clear view of the road ahead.</p><Link to="/about" className="text-link">Know our story <ArrowRight size={17}/></Link></div>
        </section>
        <section className="service-strip shell">
          {[
            [TrendingUp, 'Shares', 'Participate in business growth with a plan shaped around you.'],
            [PieChart, 'Mutual funds', 'Build a diversified path for consistent, long-term progress.'],
            [CircleDollarSign, 'Forex & dollar', 'Navigate currency opportunities with careful guidance.'],
            [Landmark, 'Other investments', 'Explore suitable avenues without losing sight of your goals.'],
          ].map(([Icon, title, copy], i) => <article key={title} className="service-card"><span className="card-number">0{i + 1}</span><Icon/><h3>{title}</h3><p>{copy}</p></article>)}
        </section>
        <section className="cta-band"><div className="shell"><div><span className="eyebrow light">A brighter financial chapter</span><h2>Let your money move with purpose.</h2></div><Link to="/contact" className="button button-light">Talk to us <ArrowRight size={18}/></Link></div></section>
      </main>
      <PublicFooter />
    </div>
  )
}

function PublicFooter() {
  return <footer className="public-footer"><div className="shell"><Logo inverse/><p>1/31-A, First Floor, Anna Salai, Swarnapuri, Salem – 636004</p><div><Link to="/services">Services</Link><Link to="/contact">Contact</Link><Link to="/login">CRM Login</Link></div><small>© {new Date().getFullYear()} Akshaya Stocks & Shares. Investments are subject to market risks.</small></div></footer>
}

const pageContent = {
  about: { eyebrow: 'Rooted in Salem', title: 'A steady hand for your financial journey.', intro: 'Akshaya Stocks & Shares brings human perspective to a world full of numbers. We make space for questions, explain choices in plain language and help customers move forward with confidence.', cards: [['Listen first', 'Every relationship begins with understanding what matters to you.'], ['Clarity over noise', 'We turn complex market information into decisions you can act on.'], ['Progress with patience', 'We value thoughtful consistency over short-lived excitement.']] },
  services: { eyebrow: 'Solutions for every chapter', title: 'Investment choices, thoughtfully connected.', intro: 'From first-time participation to a broader portfolio, we help customers understand suitable options across four focused areas.', cards: [['Shares', 'Equity participation with an emphasis on clarity, suitability and informed action.'], ['Mutual Funds', 'Diversified solutions aligned to goals, timelines and comfort with risk.'], ['Forex / Dollar', 'Guidance for currency-related needs and opportunities.'], ['Other Investments', 'A considered view of additional avenues that may complement your plan.']] },
}

function ContentPage({ type }) {
  const data = pageContent[type]
  return <div className="public-page"><PublicHeader/><main><section className="inner-hero"><div className="shell"><span className="eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p>{data.intro}</p></div></section><section className="section shell editorial-grid">{data.cards.map(([t,c],i)=><article key={t}><span>0{i+1}</span><h2>{t}</h2><p>{c}</p></article>)}</section><section className="section shell quote-block"><HandCoins/><blockquote>“Positive progress starts when good information meets a clear purpose.”</blockquote><Link to="/contact" className="button button-gold">Start a conversation</Link></section></main><PublicFooter/></div>
}

function ContactPage() {
  return <div className="public-page"><PublicHeader/><main><section className="inner-hero compact-hero"><div className="shell"><span className="eyebrow">Let’s talk</span><h1>Your next financial step can start with a simple conversation.</h1></div></section><section className="section shell contact-grid"><div className="contact-card"><Phone/><span>Call us</span><strong>+91 98427 44955</strong><strong>0427 2336881</strong></div><div className="contact-card"><Mail/><span>Email</span><strong>akshayastocksshares@gmail.com</strong></div><div className="contact-card wide"><Landmark/><span>Visit</span><strong>1/31-A, First Floor, Anna Salai, Swarnapuri, Salem – 636004</strong><p>Opposite the PF Office · Open from 10:00 AM on working days</p></div></section></main><PublicFooter/></div>
}

function LoginPage({ user }) {
  const nav = useNavigate()
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [resetMode, setResetMode] = useState(false)
  useEffect(() => { if (user) nav('/app', { replace: true }) }, [user, nav])
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMessage('')
    try {
      if (resetMode) { await sendPasswordResetEmail(auth, email); setMessage('Password reset email sent. Please check your inbox.'); setResetMode(false) }
      else await signInWithEmailAndPassword(auth, email, password)
    } catch (error) { setMessage(error.code === 'auth/invalid-credential' ? 'The email or password is incorrect.' : error.message.replace('Firebase: ', '')) }
    finally { setBusy(false) }
  }
  return <div className="login-page"><div className="login-visual"><Logo inverse/><div><span className="eyebrow light">Private CRM</span><h1>Every relationship,<br/>beautifully organised.</h1><p>Securely manage customer information, celebrate important moments and keep your practice moving forward.</p></div><MoneyScene compact/></div><div className="login-panel"><Link to="/" className="back-link">← Back to website</Link><form className="login-form" onSubmit={submit}><span className="mini-mark"><LockKeyhole/></span><h2>{resetMode ? 'Reset your password' : 'Welcome back'}</h2><p>{resetMode ? 'We’ll email you a secure reset link.' : 'Sign in to access the Akshaya CRM.'}</p><label>Email address<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email"/></label>{!resetMode && <label>Password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password"/></label>}{message && <div className={cx('form-message', message.includes('sent') && 'success')}>{message}</div>}<button className="button button-dark full" disabled={busy}>{busy ? 'Please wait…' : resetMode ? 'Send reset link' : <><LogIn size={18}/> Sign in securely</>}</button><button type="button" className="link-button" onClick={()=>{setResetMode(v=>!v);setMessage('')}}>{resetMode ? 'Return to sign in' : 'Forgot password?'}</button><small>Authorised access only · Protected by Firebase Authentication</small></form></div></div>
}

function AuthGate({ user, loading }) {
  const location = useLocation()
  if (loading) return <div className="app-loading"><span className="brand-mark"><TrendingUp/></span><p>Preparing your workspace…</p></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

const sideItems = [
  [LayoutDashboard, 'Overview', '/app'], [Users, 'Customer details', '/app/customers'], [UserPlus, 'Add customer', '/app/customers/new'], [CloudUpload, 'Import & export', '/app/import'], [Archive, 'Archive', '/app/archive'], [Settings, 'Settings', '/app/settings'],
]

function AppShell({ user, customers, profile, setProfile }) {
  const [sideOpen, setSideOpen] = useState(false)
  const [notifications, setNotifications] = useState(false)
  const birthdays = useMemo(() => todaysBirthdays(customers), [customers])
  return <div className="app-shell"><aside className={cx('sidebar', sideOpen && 'open')}><div className="sidebar-head"><Logo inverse/><button className="icon-button close-side" onClick={()=>setSideOpen(false)}><X/></button></div><nav>{sideItems.map(([Icon,label,to])=><NavLink end={to==='/app'} key={to} to={to} onClick={()=>setSideOpen(false)}><Icon size={19}/><span>{label}</span></NavLink>)}</nav><div className="sidebar-foot"><div className="secure-chip"><ShieldCheck/><span><strong>Secure workspace</strong><small>Firebase protected</small></span></div><button onClick={()=>signOut(auth)}><LogOut size={18}/> Sign out</button></div></aside><div className="app-main"><header className="app-topbar"><button className="icon-button open-side" onClick={()=>setSideOpen(true)}><Menu/></button><div className="topbar-greeting"><span>Akshaya CRM</span><strong>Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, Navin</strong></div><div className="topbar-actions"><button className="notification-button" onClick={()=>setNotifications(v=>!v)}><Bell/><span>{birthdays.length || ''}</span></button><Link to="/app/customers/new" className="button button-gold small"><Plus/> Add customer</Link><div className="user-badge">AS</div></div>{notifications && <div className="notification-popover"><div><strong>Notifications</strong><button className="icon-button" onClick={()=>setNotifications(false)}><X size={17}/></button></div>{birthdays.length?<>{birthdays.map((c)=><Link to={`/app/customers/${c.id}/edit`} key={c.id}><Gift/><span><strong>It’s {c.name}’s birthday!</strong><small>Wish them a wonderful year ahead.</small></span></Link>)}</>:<div className="empty-notification"><CalendarDays/><p>No customer birthdays today.</p></div>}</div>}</header><main className="app-content"><Outlet context={{ user, customers, profile, setProfile }} /></main></div></div>
}

function PageTitle({ eyebrow, title, copy, action }) { return <div className="page-title"><div><span>{eyebrow}</span><h1>{title}</h1>{copy&&<p>{copy}</p>}</div>{action}</div> }

function DashboardPage() {
  const { customers } = useOutletContext()
  const active = customers.filter(c=>!c.archived)
  const birthdays = todaysBirthdays(customers)
  const productCounts = PRODUCTS.map(p=>[p,active.filter(c=>c.product===p).length])
  return <><PageTitle eyebrow="Overview" title="Your relationship dashboard" copy="A calm, clear view of the customers you serve." action={<Link className="button button-gold" to="/app/customers/new"><Plus/> Add customer</Link>}/><div className="stat-grid"><article><span>Active customers</span><strong>{active.length}</strong><Users/><small>Across all products</small></article><article><span>Mutual funds</span><strong>{productCounts.find(x=>x[0]==='Mutual Funds')[1]}</strong><PieChart/><small>Customer relationships</small></article><article><span>Shares</span><strong>{productCounts.find(x=>x[0]==='Shares')[1]}</strong><TrendingUp/><small>Customer relationships</small></article><article className="birthday-stat"><span>Birthdays today</span><strong>{birthdays.length}</strong><Gift/><small>{birthdays.length?birthdays.map(x=>x.name).join(', '):'No celebrations today'}</small></article></div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><span>Customer mix</span><h2>Products at a glance</h2></div><Link to="/app/customers">View all <ArrowRight size={16}/></Link></div><div className="product-bars">{productCounts.map(([p,n],i)=>{const pct=active.length?Math.max(5,(n/active.length)*100):0;return <div key={p}><span>{p}<b>{n}</b></span><i><em style={{width:`${pct}%`, '--i':i}}/></i></div>})}</div></section><section className="panel quick-panel"><div className="panel-head"><div><span>Quick actions</span><h2>Move work forward</h2></div></div><Link to="/app/customers/new"><UserPlus/><span><strong>Add a new customer</strong><small>Create a complete relationship record</small></span><ChevronRight/></Link><Link to="/app/import"><Upload/><span><strong>Import a customer list</strong><small>Use the guided CSV template</small></span><ChevronRight/></Link><Link to="/app/customers"><Printer/><span><strong>Prepare a printout</strong><small>Select customers and preview A4 pages</small></span><ChevronRight/></Link></section></div></>
}

function EmptyCustomers({ archived }) { return <div className="empty-state"><span><Users/></span><h3>{archived?'No archived customers':'No customers yet'}</h3><p>{archived?'Archived customer records will remain safely stored here.':'Add your first customer or import an existing list to get started.'}</p>{!archived&&<Link to="/app/customers/new" className="button button-gold"><Plus/> Add first customer</Link>}</div> }

function CustomersPage({ archived = false }) {
  const { customers } = useOutletContext()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(new Set())
  const [preview, setPreview] = useState(false)
  const visible = useMemo(()=>filterCustomers(customers,search,filter,archived),[customers,search,filter,archived])
  useEffect(()=>setSelected(new Set()),[search,filter,archived])
  const toggleAll=()=>setSelected(selected.size===visible.length?new Set():new Set(visible.map(c=>c.id)))
  const chosen=visible.filter(c=>selected.has(c.id))
  const restore=async(c)=>updateDoc(doc(db,'customers',c.id),{archived:false,archivedAt:null,updatedAt:serverTimestamp()})
  return <><PageTitle eyebrow={archived?'Protected records':'Simple CRM'} title={archived?'Customer archive':'Customer details'} copy={archived?'Records are retained here and can be restored at any time.':'Search, filter, update, export or prepare customer details for print.'} action={!archived&&<Link to="/app/customers/new" className="button button-gold"><Plus/> Add customer</Link>}/><div className="customer-toolbar"><label className="search-box"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, PAN or email…"/><kbd>⌘ K</kbd></label><div className="filter-tabs">{FILTERS.map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>{visible.length?<div className="table-panel"><div className="selection-bar"><label><input type="checkbox" checked={visible.length>0&&selected.size===visible.length} onChange={toggleAll}/><span>{selected.size?`${selected.size} selected`:'Select visible customers'}</span></label>{selected.size>0&&<div><button onClick={()=>setPreview(true)}><Eye/> Print preview</button></div>}<span>{visible.length} {visible.length===1?'customer':'customers'}</span></div><div className="responsive-table"><table><thead><tr><th className="check-col"></th><th>Name</th><th>Phone</th><th>Email</th><th>PAN</th><th>Product</th><th>Referred by</th><th></th></tr></thead><tbody>{visible.map(c=><tr key={c.id}><td><input type="checkbox" checked={selected.has(c.id)} onChange={()=>setSelected(prev=>{const n=new Set(prev);n.has(c.id)?n.delete(c.id):n.add(c.id);return n})}/></td><td data-label="Name"><div className="customer-name"><span>{c.name.charAt(0).toUpperCase()}</span><strong>{c.name}</strong></div></td><td data-label="Phone">{c.phone}</td><td data-label="Email">{c.email||'—'}</td><td data-label="PAN"><code>{c.pan||'—'}</code></td><td data-label="Product"><span className={`product-pill p-${PRODUCTS.indexOf(c.product)}`}>{c.product}</span></td><td data-label="Referred by">{c.referredBy||'—'}</td><td className="row-actions">{archived?<button onClick={()=>restore(c)} title="Restore customer"><Archive size={17}/> Restore</button>:<Link to={`/app/customers/${c.id}/edit`}><Edit3 size={17}/> Edit</Link>}</td></tr>)}</tbody></table></div></div>:<EmptyCustomers archived={archived}/>} {preview&&<PrintPreview customers={chosen} onClose={()=>setPreview(false)}/>}</>
}

const emptyCustomer = { name:'', phone:'', email:'', pan:'', tradingCode:'', referredBy:'', product:'', dob:'' }

function CustomerFormPage() {
  const { id } = useParams(); const editing=Boolean(id); const nav=useNavigate(); const { customers,user }=useOutletContext()
  const current=customers.find(c=>c.id===id)
  const [form,setForm]=useState(emptyCustomer); const [errors,setErrors]=useState({}); const [saving,setSaving]=useState(false); const [archiveConfirm,setArchiveConfirm]=useState(false)
  useEffect(()=>{if(current)setForm(Object.fromEntries(Object.keys(emptyCustomer).map(k=>[k,k==='dob'?dobToIso(current.dob):(current[k]||'')])))},[current])
  const change=(key,val)=>{setForm(f=>({...f,[key]:val}));setErrors(e=>({...e,[key]:''}))}
  const submit=async(e)=>{e.preventDefault();const result=validateCustomer(form);setErrors(result.errors);if(!result.valid)return;setSaving(true);try{const payload={...result.customer,dob:Timestamp.fromDate(new Date(`${result.customer.dob}T12:00:00`)),updatedAt:serverTimestamp(),updatedBy:user.uid};if(editing)await updateDoc(doc(db,'customers',id),payload);else await addDoc(collection(db,'customers'),{...payload,archived:false,archivedAt:null,createdAt:serverTimestamp(),createdBy:user.uid});nav('/app/customers')}finally{setSaving(false)}}
  const archiveCustomer=async()=>{await updateDoc(doc(db,'customers',id),{archived:true,archivedAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:user.uid});nav('/app/customers')}
  if(editing&&!current)return <div className="app-loading inline"><p>Loading customer…</p></div>
  return <><PageTitle eyebrow={editing?'Update relationship':'New relationship'} title={editing?'Edit customer':'Add customer'} copy="Keep every field accurate so search, exports and important reminders work beautifully."/><form className="customer-form" onSubmit={submit}><section><div className="form-section-head"><span>01</span><div><h2>Personal details</h2><p>The essential information for this customer relationship.</p></div></div><div className="field-grid"><Field label="Full name" required error={errors.name}><input value={form.name} onChange={e=>change('name',e.target.value)} placeholder="e.g. Arjun Kumar" autoFocus/></Field><Field label="Phone number" required error={errors.phone}><input value={form.phone} onChange={e=>change('phone',e.target.value)} placeholder="e.g. +91 98427 44955" inputMode="tel"/></Field><Field label="Email ID" hint="Optional" error={errors.email}><input value={form.email} onChange={e=>change('email',e.target.value)} placeholder="customer@example.com" type="email"/></Field><Field label="Date of birth" required error={errors.dob}><input value={form.dob} onChange={e=>change('dob',e.target.value)} type="date" max={new Date().toISOString().slice(0,10)}/></Field></div></section><section><div className="form-section-head"><span>02</span><div><h2>Investment relationship</h2><p>Choose the primary product and add the available identifiers.</p></div></div><div className="field-grid"><Field label="Product" required error={errors.product}><select value={form.product} onChange={e=>change('product',e.target.value)}><option value="">Select a product</option>{PRODUCTS.map(p=><option key={p}>{p}</option>)}</select></Field><Field label="PAN card number" hint={form.product==='Shares'||form.product==='Mutual Funds'?'Required for this product':'Optional'} error={errors.pan}><input value={form.pan} onChange={e=>change('pan',e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10}/></Field><Field label="Trading code" hint="Optional"><input value={form.tradingCode} onChange={e=>change('tradingCode',e.target.value)} placeholder="Customer trading code"/></Field><Field label="Referred by" hint="Optional"><input value={form.referredBy} onChange={e=>change('referredBy',e.target.value)} placeholder="Referrer name or source"/></Field></div></section><div className="form-actions">{editing&&<button type="button" className="archive-button" onClick={()=>setArchiveConfirm(true)}><Archive/> Archive customer</button>}<div><button type="button" className="button button-ghost" onClick={()=>nav(-1)}>Cancel</button><button className="button button-gold" disabled={saving}><Check/> {saving?'Saving…':editing?'Save changes':'Create customer'}</button></div></div></form>{archiveConfirm&&<ConfirmModal title="Archive this customer?" copy="The record will not be deleted. It will remain securely stored and can be restored from the archive at any time." confirm="Archive customer" onCancel={()=>setArchiveConfirm(false)} onConfirm={archiveCustomer}/>}</>
}

function Field({label,hint,required,error,children}) { return <label className={cx('field',error&&'has-error')}><span>{label}{required&&<b>*</b>}{hint&&<em>{hint}</em>}</span>{children}{error&&<small>{error}</small>}</label> }

function ConfirmModal({title,copy,confirm,onCancel,onConfirm}) { return <div className="modal-backdrop"><div className="confirm-modal"><span className="modal-icon"><Archive/></span><h2>{title}</h2><p>{copy}</p><div><button className="button button-ghost" onClick={onCancel}>Cancel</button><button className="button button-danger" onClick={onConfirm}>{confirm}</button></div></div></div> }

function PrintPreview({customers,onClose}) {
  const pages=[]; for(let i=0;i<customers.length;i+=8)pages.push(customers.slice(i,i+8))
  const print=()=>window.print()
  return <div className="print-overlay"><header><div><span>Print preview</span><strong>{customers.length} customers · {pages.length} A4 landscape {pages.length===1?'page':'pages'}</strong></div><div><button onClick={onClose}><X/> Close</button><button className="button button-gold" onClick={print}><Printer/> Print</button></div></header><main className="print-preview">{pages.map((page,p)=><section className="print-page" key={p}><div className="print-heading"><div><strong>AKSHAYA</strong><span>STOCKS & SHARES</span></div><div><h1>Customer Details</h1><p>Generated {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p></div></div><table><thead><tr><th>S. No</th><th>Name</th><th>Phone No</th><th>Email Id</th><th>Pan Card No</th><th>Trading Code</th><th>Product</th><th>Ref by</th></tr></thead><tbody>{page.map((c,i)=><tr key={c.id}><td>{p*8+i+1}</td><td>{c.name}</td><td>{c.phone}</td><td>{c.email||'—'}</td><td>{c.pan||'—'}</td><td>{c.tradingCode||'—'}</td><td>{c.product}</td><td>{c.referredBy||'—'}</td></tr>)}</tbody></table><footer>1/31-A, First Floor, Anna Salai, Swarnapuri, Salem – 636004 <span>Page {p+1} of {pages.length}</span></footer></section>)}</main></div>
}

function ImportExportPage() {
  const { customers,user }=useOutletContext(); const fileRef=useRef(); const [rows,setRows]=useState([]); const [importErrors,setImportErrors]=useState([]); const [busy,setBusy]=useState(false); const [done,setDone]=useState('')
  const download=(data,name)=>{const blob=new Blob([data],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
  const template=()=>download(Papa.unparse([{'Name':'','Phone No':'','Email Id':'','Pan Card No':'','Trading Code':'','Product':'Shares','Ref by':'','DOB':'YYYY-MM-DD'}]),'akshaya-customer-import-template.csv')
  const exportAll=()=>download(Papa.unparse(rowsToCsv(customers)),'akshaya-customers.csv')
  const pick=(file)=>{setDone('');Papa.parse(file,{header:true,skipEmptyLines:true,complete:({data,errors})=>{const parsed=[];const issues=errors.map(e=>`Row ${e.row+2}: ${e.message}`);data.forEach((row,index)=>{const result=validateCustomer(csvRowToCustomer(row));if(result.valid)parsed.push(result.customer);else issues.push(`Row ${index+2}: ${Object.values(result.errors).join(' ')}`)});setRows(parsed);setImportErrors(issues)}})}
  const importRows=async()=>{setBusy(true);try{for(const c of rows)await addDoc(collection(db,'customers'),{...c,dob:Timestamp.fromDate(new Date(`${c.dob}T12:00:00`)),archived:false,archivedAt:null,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),createdBy:user.uid,updatedBy:user.uid});setDone(`${rows.length} customer records imported successfully.`);setRows([]);if(fileRef.current)fileRef.current.value=''}finally{setBusy(false)}}
  return <><PageTitle eyebrow="Data tools" title="Import & export" copy="Move customer information safely with a guided CSV workflow."/><div className="transfer-grid"><section className="panel transfer-card"><span className="transfer-icon"><Download/></span><div><span>Bulk download</span><h2>Export customer details</h2><p>Download active and archived customer records in a clean CSV file for your secure offline records.</p></div><button className="button button-dark" onClick={exportAll}><FileSpreadsheet/> Download CSV</button><small>{customers.length} records ready</small></section><section className="panel transfer-card"><span className="transfer-icon gold"><Upload/></span><div><span>Bulk import</span><h2>Import customer details</h2><p>Start with our template. DOB is required for birthday reminders; PAN is required for shares and mutual funds.</p></div><button className="button button-ghost" onClick={template}><Download/> Download template</button><label className="file-drop"><CloudUpload/><strong>Choose a completed CSV file</strong><small>CSV up to 5 MB</small><input ref={fileRef} type="file" accept=".csv,text/csv" onChange={e=>e.target.files[0]&&pick(e.target.files[0])}/></label></section></div>{(rows.length>0||importErrors.length>0||done)&&<section className="panel import-review"><div className="panel-head"><div><span>Import review</span><h2>{done||`${rows.length} valid records ready`}</h2></div>{rows.length>0&&<button className="button button-gold" disabled={busy} onClick={importRows}><Upload/> {busy?'Importing…':'Import valid records'}</button>}</div>{importErrors.length>0&&<div className="import-errors"><strong>Please fix these rows and upload again:</strong>{importErrors.slice(0,8).map((e,i)=><p key={i}>{e}</p>)}</div>}{rows.length>0&&<div className="responsive-table compact-table"><table><thead><tr><th>Name</th><th>Phone</th><th>Product</th><th>DOB</th></tr></thead><tbody>{rows.slice(0,5).map((r,i)=><tr key={i}><td>{r.name}</td><td>{r.phone}</td><td>{r.product}</td><td>{r.dob}</td></tr>)}</tbody></table>{rows.length>5&&<small>And {rows.length-5} more records…</small>}</div>}</section>}</>
}

function SettingsPage() {
  const {user,profile,setProfile}=useOutletContext(); const [current,setCurrent]=useState('');const [next,setNext]=useState('');const [confirm,setConfirm]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false)
  const change=async(e)=>{e.preventDefault();setMessage('');if(next.length<8){setMessage('Use at least 8 characters.');return}if(next!==confirm){setMessage('New passwords do not match.');return}setBusy(true);try{await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,current));await updatePassword(user,next);const data={mustChangePassword:false,changeDeferred:false,lastUpdatedAt:serverTimestamp()};await setDoc(doc(db,'users',user.uid),data,{merge:true});setProfile(p=>({...p,...data}));setMessage('Password changed successfully.');setCurrent('');setNext('');setConfirm('')}catch(e){setMessage(e.code==='auth/wrong-password'||e.code==='auth/invalid-credential'?'Your current password is incorrect.':e.message)}finally{setBusy(false)}}
  return <><PageTitle eyebrow="Account" title="Settings" copy="Manage the administrator account and workspace security."/><div className="settings-grid"><section className="panel account-card"><div className="user-avatar-large">AS</div><div><span>Administrator account</span><h2>Akshaya Stocks & Shares</h2><p>{user.email}</p><em>{user.emailVerified?'Email verified':'Email verification pending'}</em></div></section><form className="panel password-card" onSubmit={change}><div className="panel-head"><div><span>Security</span><h2>Change password</h2></div><LockKeyhole/></div><Field label="Current password" required><input type="password" value={current} onChange={e=>setCurrent(e.target.value)} autoComplete="current-password"/></Field><Field label="New password" required><input type="password" value={next} onChange={e=>setNext(e.target.value)} autoComplete="new-password"/></Field><Field label="Confirm new password" required><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/></Field>{message&&<div className={cx('form-message',message.includes('successfully')&&'success')}>{message}</div>}<button className="button button-dark" disabled={busy}>{busy?'Updating…':'Update password'}</button><button type="button" className="link-button align-left" onClick={async()=>{await sendPasswordResetEmail(auth,user.email);setMessage('Password reset email sent.')}}>Send a password reset email instead</button></form></div></>
}

function FirstLoginPrompt({user,profile,setProfile}) {
  const [open,setOpen]=useState(Boolean(profile?.mustChangePassword)&&!profile?.changeDeferred)
  useEffect(()=>setOpen(Boolean(profile?.mustChangePassword)&&!profile?.changeDeferred),[profile])
  if(!open)return null
  const later=async()=>{await setDoc(doc(db,'users',user.uid),{changeDeferred:true,lastUpdatedAt:serverTimestamp()},{merge:true});setProfile(p=>({...p,changeDeferred:true}));setOpen(false)}
  return <div className="modal-backdrop"><div className="welcome-modal"><span className="modal-icon"><Sparkles/></span><span className="eyebrow">First login</span><h2>Welcome to your new CRM</h2><p>Your account currently uses a temporary password. For the strongest protection, change it now. You can also do this later from Settings.</p><div><button className="button button-ghost" onClick={later}>Change later</button><Link className="button button-gold" to="/app/settings" onClick={()=>setOpen(false)}>Change password now</Link></div></div></div>
}

function VerifyEmail({user}) {
  const [sent,setSent]=useState(false)
  return <div className="verify-page"><Logo/><span className="modal-icon"><Mail/></span><h1>Verify the administrator email</h1><p>For the protection of customer records, confirm <strong>{user.email}</strong> before entering the CRM.</p><button className="button button-gold" onClick={async()=>{await sendEmailVerification(user);setSent(true)}}>{sent?'Verification email sent':'Send verification email'}</button><button className="button button-ghost" onClick={()=>user.reload().then(()=>window.location.reload())}>I have verified — continue</button><button className="link-button" onClick={()=>signOut(auth)}>Sign out</button></div>
}

export default function App() {
  const [user,setUser]=useState(null);const [authLoading,setAuthLoading]=useState(true);const [customers,setCustomers]=useState([]);const [profile,setProfile]=useState(null)
  useEffect(()=>onAuthStateChanged(auth,async(next)=>{setUser(next);setAuthLoading(false);if(next){const ref=doc(db,'users',next.uid);const snap=await getDoc(ref).catch(()=>null);if(snap?.exists())setProfile(snap.data());else if(next.emailVerified){const initial={mustChangePassword:true,changeDeferred:false,onboardingCreatedAt:serverTimestamp(),lastUpdatedAt:serverTimestamp()};await setDoc(ref,initial);setProfile(initial)}}else{setCustomers([]);setProfile(null)}}),[])
  useEffect(()=>{if(!user?.emailVerified)return;return onSnapshot(collection(db,'customers'),snap=>setCustomers(snap.docs.map(d=>({id:d.id,...d.data()}))),()=>setCustomers([]))},[user])
  return <Routes><Route path="/" element={<HomePage/>}/><Route path="/about" element={<ContentPage type="about"/>}/><Route path="/services" element={<ContentPage type="services"/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/login" element={<LoginPage user={user}/>}/><Route element={<AuthGate user={user} loading={authLoading}/>}>{user&&!user.emailVerified?<Route path="/app/*" element={<VerifyEmail user={user}/>}/>:<Route path="/app" element={<><AppShell user={user} customers={customers} profile={profile} setProfile={setProfile}/><FirstLoginPrompt user={user} profile={profile} setProfile={setProfile}/></>}><Route index element={<DashboardPage/>}/><Route path="customers" element={<CustomersPage/>}/><Route path="customers/new" element={<CustomerFormPage/>}/><Route path="customers/:id/edit" element={<CustomerFormPage/>}/><Route path="import" element={<ImportExportPage/>}/><Route path="archive" element={<CustomersPage archived/>}/><Route path="settings" element={<SettingsPage/>}/></Route>}</Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
