import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  Archive, ArrowRight, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronRight, CircleDollarSign,
  CloudUpload, Download, Edit3, Eye, EyeOff, FileSpreadsheet, Gift, HandCoins, Home, Landmark, LayoutDashboard,
  LockKeyhole, LogIn, LogOut, Mail, Menu, Moon, MoreHorizontal, Phone, PieChart, Plus, Printer,
  RotateCcw, Search, Settings, ShieldCheck, Sparkles, Sun, TrendingUp, Upload, UserPlus, Users, WalletCards, X,
  MessageCircle, Send,
} from 'lucide-react'
import Papa from 'papaparse'
import {
  applyActionCode, createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, inMemoryPersistence,
  onAuthStateChanged, reauthenticateWithCredential, sendEmailVerification, sendPasswordResetEmail,
  setPersistence, signInWithEmailAndPassword, signOut, updatePassword, verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth'
import {
  addDoc, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, Timestamp, updateDoc, writeBatch,
} from 'firebase/firestore'
import { auth, db, getTeamCreatorAuth } from './firebase'
import { CIBIL_TYPES, csvRowToCustomer, dobToIso, filterCustomers, normalizeUsername, PRODUCTS, rowsToCsv, teamEmailForUsername, todaysBirthdays, validateCustomer } from './lib'

const ADMIN_EMAIL = 'akshayastocksshares@gmail.com'
const FILTERS = ['All', 'Shares', 'Mutual Funds', 'Forex', 'Others', 'Cibil']
const WHATSAPP_URL = 'https://wa.me/919150328704?text=Hello%20Akshaya%20Stocks%20%26%20Shares%2C%20I%20would%20like%20to%20start%20a%20conversation%20about%20my%20investment%20needs.'

const cx = (...items) => items.filter(Boolean).join(' ')

function WhatsAppLink({ className, children }) {
  return <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
}

function Logo({ inverse = false }) {
  return (
    <Link to="/" className={cx('brand', inverse && 'brand-inverse')} aria-label="Akshaya Stocks and Shares home">
      <span className="brand-logo-frame"><img className="brand-logo" src="/akshaya-logo-transparent.png" alt="Akshaya Stocks & Shares" /></span>
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
        <div className="wealth-card-top"><span>Portfolio outlook</span><span>Illustration</span></div>
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

function MarketChart() {
  const ref=useRef(null)
  useEffect(()=>{
    const container=ref.current
    const widget=document.createElement('div');widget.className='tradingview-widget-container__widget';widget.style.height='100%'
    const script=document.createElement('script');script.src='https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';script.async=true
    script.textContent=JSON.stringify({autosize:true,symbol:'FX_IDC:USDINR',interval:'D',timezone:'Asia/Kolkata',theme:'light',style:'1',locale:'en',allow_symbol_change:true,hide_side_toolbar:true,calendar:false,backgroundColor:'#ffffff',support_host:'https://www.tradingview.com'})
    const mount=setTimeout(()=>container.append(widget,script),0)
    return()=>{clearTimeout(mount);container.replaceChildren()}
  },[])
  return <section className="section shell market-section"><div className="section-heading"><div><span className="eyebrow">Market view</span><h2>Keep an eye on the market.</h2></div><p>Follow USD/INR movements, switch available symbols and compare timeframes before your next conversation with our team.</p></div><div className="market-chart tradingview-widget-container" ref={ref}/><p className="market-note"><a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">Chart by TradingView</a> · Data availability and delays depend on the exchange. Market information is for reference and is not a recommendation to trade.</p></section>
}

function GettingStarted() {
 return <section className="section getting-started"><div className="shell"><span className="eyebrow">From questions to a clear next step</span><h2>A conversation built around you.</h2><div className="editorial-grid"><article><span>01</span><h3>Tell us your priorities</h3><p>Share your goal, timeline and the questions on your mind. Whether you are starting out or reviewing existing investments, we begin with your needs.</p></article><article><span>02</span><h3>Understand your options</h3><p>Discuss the purpose, risks and practical requirements of the service you are considering. Ask about documentation, charges and next steps before proceeding.</p></article><article><span>03</span><h3>Move forward with support</h3><p>Choose the next step when you are comfortable. Stay connected with our Salem team by phone, WhatsApp or a visit to our office.</p></article></div></div></section>
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
            <p>Thoughtful guidance across shares, mutual funds, currencies and other investments—built around your goals and backed by trusted personal service across India.</p>
            <div className="hero-actions"><WhatsAppLink className="button button-gold">Start a conversation <MessageCircle size={18} /></WhatsAppLink><Link to="/services" className="text-link">Explore our services <ChevronRight size={17}/></Link></div>
            <div className="trust-row"><div className="avatar-stack"><span>AS</span><span>₹</span><span>+</span></div><p><strong>Personal, practical guidance</strong><small>For every stage of your wealth journey</small></p></div>
          </div>
          <MoneyScene />
        </section>
        <section className="marquee"><div>Shares <i/> Mutual Funds <i/> Forex & Dollar <i/> Other Investments <i/> Cibil Services <i/> Long-term relationships <i/> Thoughtful action</div></section>
        <section className="section shell philosophy">
          <div><span className="eyebrow">The Akshaya approach</span><h2>Money should create possibilities, not pressure.</h2></div>
          <div><p>We believe positive financial progress comes from informed decisions, disciplined action and a relationship you can rely on. We discuss your time horizon, comfort with risk and practical needs before exploring a service. Our Salem office offers a point of contact for customers across India, with conversations available by phone and WhatsApp.</p><Link to="/about" className="text-link">Know our story <ArrowRight size={17}/></Link></div>
        </section>
        <section className="service-strip shell">
          {[
            [TrendingUp, 'Shares', 'Understand equity participation, market movements and the documentation needed to begin. Discuss your objectives and risk comfort before taking a position.'],
            [PieChart, 'Mutual funds', 'Explore mutual funds, regular investing and diversification in relation to your goals, investment horizon and tolerance for market risk.'],
            [CircleDollarSign, 'Forex & dollar', 'Discuss your currency requirements, available options and supporting documents. Confirm current rates and service terms with our team.'],
            [Landmark, 'Other investments', 'Bring your questions about other investment avenues. Review liquidity, risk, eligibility and terms before choosing an option.'],
            [FileSpreadsheet, 'Cibil services', 'Get support understanding credit-report information across Cibil, CRIF, Experian and Equifax. A credit report is a starting point for informed credit decisions.'],
          ].map(([Icon, title, copy], i) => <article key={title} className="service-card"><span className="card-number">0{i + 1}</span><Icon/><h3>{title}</h3><p>{copy}</p></article>)}
        </section>
        <MarketChart/><GettingStarted/>
        <section className="cta-band"><div className="shell"><div><span className="eyebrow light">A brighter financial chapter</span><h2>Let your money move with purpose.</h2></div><WhatsAppLink className="button button-light">Talk to us on WhatsApp <MessageCircle size={18}/></WhatsAppLink></div></section>
      </main>
      <PublicFooter />
    </div>
  )
}

function PublicFooter() {
  return <footer className="public-footer"><div className="shell"><Logo inverse/><p>1/31-A, First Floor, Anna Salai, Swarnapuri, Salem – 636004</p><div><Link to="/services">Services</Link><Link to="/contact">Contact</Link><Link to="/login">CRM Login</Link></div><small><span>© {new Date().getFullYear()} Akshaya Stocks & Shares. Investments are subject to market risks.</span><span>Developed and maintained by <a href="https://www.symphozen.com" target="_blank" rel="noopener noreferrer">Symphozen Labs</a></span></small></div></footer>
}

const pageContent = {
  about: { eyebrow: 'Rooted in Salem', title: 'A steady hand for your financial journey.', intro: 'Based in Swarnapuri, Salem, Akshaya Stocks & Shares helps customers across India discuss shares, mutual funds, currency requirements and credit information. Our approach begins with your questions and priorities, followed by a clear explanation of the options, documentation and practical next steps.', quote: 'Positive progress starts when good information meets a clear purpose.', cards: [['Listen first', 'We take time to understand why you are investing, when you may need your money and how comfortable you are with uncertainty. These details shape a more useful conversation.'], ['Clarity over noise', 'We explain services in everyday language, including their practical requirements and risks. You should have room to ask questions and understand the terms before moving forward.'], ['Progress with patience', 'Financial decisions deserve time and regular attention. We encourage clear expectations, careful documentation and ongoing conversations as your circumstances change.']] },
  services: { eyebrow: 'Solutions for every chapter', title: 'Investment choices, thoughtfully connected.', intro: 'Whether you are exploring your first investment, reviewing your portfolio, arranging currency services or understanding a credit report, begin with a focused conversation. Explore our five service areas below, then contact our team to discuss availability, documentation and applicable terms.', quote: 'The right investment is not just a product—it is a purposeful step toward the future you want.', cards: [['Shares', 'Explore participation in listed companies and understand how market prices can change. Discuss trading-related requirements, your investment horizon and the risk of capital loss before proceeding.'], ['Mutual Funds', 'Discuss fund categories, diversification and approaches such as regular investing. Consider your goal, time horizon, costs and the scheme’s risk information; returns are not assured.'], ['Forex / Dollar', 'Speak with us about your forex or dollar requirements, available services and documentation. Confirm eligibility, current exchange rates and applicable charges directly with our team.'], ['Other Investments', 'Review additional investment possibilities with attention to their purpose, liquidity, eligibility and product terms. Understand the risks and commitments before making a decision.'], ['Cibil Services', 'Choose support for Cibil, CRIF, Experian or Equifax reports. Discuss report details and the next steps for clarification. Report access does not guarantee a loan, score increase or approval.']] },
}

function ContentPage({ type }) {
  const data = pageContent[type]
  return <div className="public-page"><PublicHeader/><main><section className="inner-hero"><div className="shell"><span className="eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p>{data.intro}</p></div></section><section className="section shell editorial-grid">{data.cards.map(([t,c],i)=><article key={t}><span>0{i+1}</span><h2>{t}</h2><p>{c}</p></article>)}</section><GettingStarted/><section className="section shell quote-block"><HandCoins/><blockquote>“{data.quote}”</blockquote><WhatsAppLink className="button button-gold">Start a conversation <MessageCircle size={18}/></WhatsAppLink></section></main><PublicFooter/></div>
}

function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', reason: '', website: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }))
  const submit = async (e) => {
    e.preventDefault()
    if (form.website) return
    setStatus({ state: 'sending', message: '' })
    try {
      const response = await fetch('https://formsubmit.co/ajax/akshayastocksshares@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          Name: form.name,
          'Phone Number': form.phone,
          Email: form.email,
          City: form.city,
          'Reason for connecting': form.reason,
          _subject: `New website enquiry from ${form.name}`,
          _template: 'table',
          _honey: form.website,
        }),
      })
      if (!response.ok) throw new Error('Submission failed')
      setForm({ name: '', phone: '', email: '', city: '', reason: '', website: '' })
      setStatus({ state: 'success', message: 'Thank you. Your enquiry has been sent to Akshaya Stocks & Shares.' })
    } catch {
      setStatus({ state: 'error', message: 'We could not send your enquiry. Please contact us on WhatsApp or by phone.' })
    }
  }
  return (
    <div className="public-page">
      <PublicHeader/>
      <main>
        <section className="inner-hero compact-hero">
          <div className="shell"><span className="eyebrow">Let’s talk</span><h1>Let’s discuss your next step.</h1><p>Have a question about shares, mutual funds, currency services or credit reports? Contact our Salem team or leave an enquiry below.</p></div>
        </section>
        <section className="section shell contact-layout">
          <div className="contact-grid">
            <div className="contact-card">
              <Phone/><span>Call or WhatsApp</span>
              <WhatsAppLink className="contact-number">+91 91503 28704 <MessageCircle size={18}/></WhatsAppLink>
              <a className="contact-number secondary" href="tel:+914272336881">0427 2336881</a>
            </div>
            <div className="contact-card"><Mail/><span>Email</span><a className="contact-email" href="mailto:akshayastocksshares@gmail.com">akshayastocksshares@gmail.com</a></div>
            <div className="contact-card wide"><Landmark/><span>Visit</span><strong>1/31-A, First Floor, Anna Salai, Swarnapuri, Salem – 636004</strong><p>Opposite the PF Office · Open from 10:00 AM on working days</p></div>
            <WhatsAppLink className="button button-dark whatsapp-contact"><MessageCircle size={19}/> Chat with us on WhatsApp</WhatsAppLink>
          </div>
          <form className="enquiry-form" onSubmit={submit}>
            <span className="eyebrow">Send an enquiry</span><h2>How can we help?</h2><p>Share a few details and our team will get in touch with you.</p>
            <div className="enquiry-fields">
              <label>Name <b>*</b><input name="name" value={form.name} onChange={update} required autoComplete="name"/></label>
              <label>Phone No <b>*</b><input name="phone" value={form.phone} onChange={update} required inputMode="tel" autoComplete="tel" pattern="[0-9+ ()-]{7,20}"/></label>
              <label>Email ID <b>*</b><input name="email" value={form.email} onChange={update} required type="email" autoComplete="email"/></label>
              <label>City <b>*</b><input name="city" value={form.city} onChange={update} required autoComplete="address-level2"/></label>
              <label className="full-field">Reason for connecting <b>*</b><textarea name="reason" value={form.reason} onChange={update} required rows="5" placeholder="Tell us what you would like to discuss…"/></label>
              <input type="text" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" hidden aria-hidden="true"/>
            </div>
            {status.message&&<div role="status" className={cx('form-message',status.state==='success'&&'success')}>{status.message}</div>}
            <button className="button button-gold full" disabled={status.state==='sending'}>{status.state==='sending'?'Sending…':<>Submit enquiry <Send size={18}/></>}</button>
            <small>Your details are used only to respond to this enquiry and are delivered to the Akshaya Stocks & Shares email inbox.</small>
          </form>
        </section>
      </main>
      <PublicFooter/>
    </div>
  )
}

function AuthActionPage() {
  const location = useLocation()
  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const mode = params.get('mode')
  const code = params.get('oobCode')
  const [state, setState] = useState({ status: 'working', email: '', message: 'Securely validating your request…' })
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  useEffect(() => {
    if (!code) { setState({ status: 'error', email: '', message: 'This link is incomplete. Please request a new email.' }); return }
    if (mode === 'verifyEmail' || mode === 'recoverEmail') {
      applyActionCode(auth, code)
        .then(() => setState({ status: 'success', email: '', message: mode === 'verifyEmail' ? 'Your administrator email is verified.' : 'Your email address has been restored.' }))
        .catch(() => setState({ status: 'error', email: '', message: 'This link is invalid or has expired. Please request a new email.' }))
      return
    }
    if (mode === 'resetPassword') {
      verifyPasswordResetCode(auth, code)
        .then((email) => setState({ status: 'reset', email, message: 'Create a new secure password.' }))
        .catch(() => setState({ status: 'error', email: '', message: 'This password-reset link is invalid or has expired.' }))
      return
    }
    setState({ status: 'error', email: '', message: 'This email action is not supported.' })
  }, [code, mode])

  const resetPassword = async (event) => {
    event.preventDefault()
    if (password.length < 8) { setState((current) => ({ ...current, message: 'Use at least 8 characters.' })); return }
    if (password !== confirm) { setState((current) => ({ ...current, message: 'The passwords do not match.' })); return }
    try {
      await confirmPasswordReset(auth, code, password)
      setState({ status: 'success', email: '', message: 'Your password has been changed successfully.' })
    } catch {
      setState({ status: 'error', email: '', message: 'This password-reset link is invalid or has expired.' })
    }
  }

  return <div className="verify-page auth-action-page"><Logo/><span className="modal-icon">{state.status==='success'?<Check/>:<ShieldCheck/>}</span><span className="eyebrow">Secure account action</span><h1>{state.status==='working'?'One moment…':state.status==='reset'?'Reset your password':state.status==='success'?'All set':'We could not complete that'}</h1><p>{state.message}</p>{state.status==='reset'&&<form className="action-password-form" onSubmit={resetPassword}><label>Account<input value={state.email} disabled/></label><label>New password<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete="new-password"/></label><label>Confirm password<input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required autoComplete="new-password"/></label><button className="button button-gold full">Save new password</button></form>}{state.status==='success'&&<Link className="button button-gold" to="/login">Continue to CRM login</Link>}{state.status==='error'&&<Link className="button button-ghost" to="/login">Return to login</Link>}</div>
}

function LoginPage({ user }) {
  const nav = useNavigate()
  const [email, setEmail] = useState(ADMIN_EMAIL)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMode, setLoginMode] = useState('admin')
  useEffect(() => { if (user) nav('/app', { replace: true }) }, [user, nav])
  const switchMode = (mode) => { setLoginMode(mode); setResetMode(false); setMessage(''); setPassword('') }
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setMessage('')
    try {
      if (resetMode) { await sendPasswordResetEmail(auth, email); setMessage('Password reset email sent. Please check your inbox.'); setResetMode(false) }
      else {
        const identity = loginMode === 'admin' ? email : teamEmailForUsername(username)
        await signInWithEmailAndPassword(auth, identity, password)
      }
    } catch (error) { setMessage(error.code === 'auth/invalid-credential' ? `The ${loginMode === 'admin' ? 'email' : 'username'} or password is incorrect.` : error.message.replace('Firebase: ', '')) }
    finally { setBusy(false) }
  }
  return <div className="login-page"><div className="login-visual"><Logo inverse/><div><span className="eyebrow light">Private CRM</span><h1>Every relationship,<br/>beautifully organised.</h1><p>Securely manage customer information, celebrate important moments and keep your practice moving forward.</p></div><MoneyScene compact/></div><div className="login-panel"><Link to="/" className="back-link">← Back to website</Link><form className="login-form" onSubmit={submit}><span className="mini-mark"><img src="/favicon.png" alt=""/></span><h2>{resetMode ? 'Reset your password' : 'Welcome back'}</h2><p>{resetMode ? 'We’ll email the administrator a secure reset link.' : 'Sign in to access the Akshaya CRM.'}</p>{!resetMode&&<div className="login-mode" role="group" aria-label="Choose account type"><button type="button" className={loginMode==='admin'?'active':''} onClick={()=>switchMode('admin')}>Administrator</button><button type="button" className={loginMode==='team'?'active':''} onClick={()=>switchMode('team')}>Team member</button></div>}{loginMode==='admin'?<label>Email address<input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email"/></label>:<label>Username<input value={username} onChange={(e)=>setUsername(normalizeUsername(e.target.value))} required autoComplete="username" placeholder="Enter your username" pattern="[a-z0-9._-]{3,30}"/></label>}{!resetMode && <label>Password<span className="password-input"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter your password"/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff/> : <Eye/>}</button></span></label>}{message && <div className={cx('form-message', message.includes('sent') && 'success')}>{message}</div>}<button className="button button-dark full" disabled={busy}>{busy ? 'Please wait…' : resetMode ? 'Send reset link' : <><LogIn size={18}/> Sign in securely</>}</button>{loginMode==='admin'&&<button type="button" className="link-button" onClick={()=>{setResetMode(v=>!v);setMessage('')}}>{resetMode ? 'Return to sign in' : 'Forgot password?'}</button>}<small>{loginMode==='admin'?'Administrator account':'Team access managed by the administrator'}</small></form></div></div>
}

function AuthGate({ user, loading }) {
  const location = useLocation()
  if (loading) return <div className="app-loading"><span className="brand-monogram"><img src="/favicon.png" alt=""/></span><p>Preparing your workspace…</p></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

const sideItems = [
  [LayoutDashboard, 'Overview', '/app'], [Users, 'Customer details', '/app/customers'], [UserPlus, 'Add customer', '/app/customers/new'], [CloudUpload, 'Import & export', '/app/import'], [Archive, 'Archive', '/app/archive'],
]

export function AppShell({ user, customers, profile, setProfile }) {
  const [notifications,setNotifications]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const [readIds,setReadIds]=useState(()=>{try{return JSON.parse(localStorage.getItem('akshaya-read-'+user.uid)||'[]')}catch{return []}})
  const utilityRef=useRef(null)
  const location=useLocation()
  const nav=useNavigate()
  const birthdays=useMemo(()=>todaysBirthdays(customers),[customers])
  const day=new Date().toLocaleDateString('en-CA')
  const keyFor=c=>day+':'+c.id
  const unread=birthdays.filter(c=>!readIds.includes(keyFor(c)))
  const markRead=ids=>setReadIds(previous=>{const next=[...new Set([...previous,...ids])].slice(-500);localStorage.setItem('akshaya-read-'+user.uid,JSON.stringify(next));return next})
  const isAdmin=profile?.role==='administrator'
  const displayName=isAdmin?'Navin':profile?.username||'Team member'
  const initials=isAdmin?'AS':displayName.slice(0,2).toUpperCase()
  const drawerOpen=/\/customers\/(new|[^/]+\/edit)$/.test(location.pathname)
  useEffect(()=>{
    const close=e=>{if(!utilityRef.current?.contains(e.target)){setNotifications(false);setAccountOpen(false)}}
    const escape=e=>{if(e.key==='Escape'){setNotifications(false);setAccountOpen(false)}}
    document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape)
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape)}
  },[])
  useEffect(()=>{setNotifications(false);setAccountOpen(false)},[location.pathname])
  return <div className="app-shell top-navigation"><header className="workspace-header" inert={drawerOpen?true:undefined}><div className="workspace-top"><Logo/><span className="workspace-label">Customer workspace</span><div className="workspace-utilities" ref={utilityRef}><button className="notification-button" aria-label="Notifications" aria-expanded={notifications} onClick={()=>{setNotifications(v=>!v);setAccountOpen(false)}}><Bell/>{unread.length>0&&<span>{unread.length}</span>}</button><Link to="/app/customers/new" className="button button-gold small"><Plus/> Add customer</Link><button className="user-badge" aria-label="Account menu" aria-expanded={accountOpen} onClick={()=>{setAccountOpen(v=>!v);setNotifications(false)}}>{initials}</button>{accountOpen&&<div className="account-popover"><strong>{displayName}</strong><small>{isAdmin?'Administrator':'Team member'}</small>{isAdmin&&<Link to="/app/settings"><Settings size={17}/> Settings</Link>}<button onClick={()=>signOut(auth)}><LogOut size={17}/> Logout</button></div>}{notifications&&<section className="notification-popover" aria-label="Birthday notifications"><div><strong>Notifications</strong><button className="icon-button" aria-label="Close notifications" onClick={()=>setNotifications(false)}><X size={17}/></button></div>{unread.length>0&&<button className="link-button mark-all" onClick={()=>markRead(unread.map(keyFor))}>Mark all as read</button>}{birthdays.length?birthdays.map(c=><div className={cx('birthday-notification',!readIds.includes(keyFor(c))&&'unread')} key={c.id}><Gift size={20}/><div><Link to={`/app/customers/${c.id}/edit`}>Today is {c.name}’s birthday</Link><small>Send your wishes and make their day.</small>{!readIds.includes(keyFor(c))?<button onClick={()=>markRead([keyFor(c)])}>Mark as read</button>:<span>Read</span>}</div></div>):<div className="empty-notification"><CalendarDays/><p>No birthdays today.</p></div>}</section>}</div></div><nav className="workspace-nav" aria-label="CRM navigation">{sideItems.filter(([,label])=>label!=='Add customer').map(([Icon,label,to])=><NavLink end={to==='/app'} key={to} to={to}><Icon size={17}/>{label}</NavLink>)}</nav></header><main className="app-content">{drawerOpen&&<div inert><CustomersPage workspace={{customers,user}}/></div>}<Outlet context={{user,customers,profile,setProfile,isAdmin}}/></main></div>
}

function PageTitle({ eyebrow, title, copy, action }) { return <div className="page-title"><div><span>{eyebrow}</span><h1>{title}</h1>{copy&&<p>{copy}</p>}</div>{action}</div> }

function DashboardPage() {
  const { customers } = useOutletContext()
  const active = customers.filter(c=>!c.archived)
  const birthdays = todaysBirthdays(customers)
  const productCounts = PRODUCTS.map(p=>[p,active.filter(c=>c.product===p).length])
  return <><PageTitle eyebrow="Overview" title="Customer overview" copy="View active customers, product totals and today’s birthdays." action={<Link className="button button-gold" to="/app/customers/new"><Plus/> Add customer</Link>}/><div className="stat-grid"><article><span>Active customers</span><strong>{active.length}</strong><Users/><small>Across all products</small></article><article><span>Mutual funds</span><strong>{productCounts.find(x=>x[0]==='Mutual Funds')[1]}</strong><PieChart/><small>Customer relationships</small></article><article><span>Shares</span><strong>{productCounts.find(x=>x[0]==='Shares')[1]}</strong><TrendingUp/><small>Customer relationships</small></article><article className="birthday-stat"><span>Birthdays today</span><strong>{birthdays.length}</strong><Gift/><small>{birthdays.length?birthdays.map(x=>x.name).join(', '):'No celebrations today'}</small></article></div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><span>Customer mix</span><h2>Products at a glance</h2></div><Link to="/app/customers">View all <ArrowRight size={16}/></Link></div><div className="product-bars">{productCounts.map(([p,n],i)=>{const pct=active.length?Math.max(5,(n/active.length)*100):0;return <div key={p}><span>{p}<b>{n}</b></span><i><em style={{width:`${pct}%`, '--i':i}}/></i></div>})}</div></section><section className="panel quick-panel"><div className="panel-head"><div><span>Quick actions</span><h2>Quick actions</h2></div></div><Link to="/app/customers/new"><UserPlus/><span><strong>Add a new customer</strong><small>Create a complete relationship record</small></span><ChevronRight/></Link><Link to="/app/import"><Upload/><span><strong>Import a customer list</strong><small>Use the guided CSV template</small></span><ChevronRight/></Link><Link to="/app/customers"><Printer/><span><strong>Prepare a printout</strong><small>Select customers and preview A4 pages</small></span><ChevronRight/></Link></section></div></>
}

function EmptyCustomers({ archived }) { return <div className="empty-state"><span><Users/></span><h3>{archived?'No archived customers':'No customers yet'}</h3><p>{archived?'Archived customer records will remain safely stored here.':'Add your first customer or import an existing list to get started.'}</p>{!archived&&<Link to="/app/customers/new" className="button button-gold"><Plus/> Add first customer</Link>}</div> }

export function CustomersPage({ archived = false, workspace }) {
  const context = useOutletContext()
  const { customers, user } = workspace || context
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(new Set())
  const [preview, setPreview] = useState(false)
  const [bulkAction, setBulkAction] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState({ text: '', success: true })
  const visible = useMemo(()=>filterCustomers(customers,search,filter,archived),[customers,search,filter,archived])
  useEffect(()=>{setSelected(new Set());setMessage({text:'',success:true})},[search,filter,archived])
  const toggleAll=()=>setSelected(selected.size===visible.length?new Set():new Set(visible.map(c=>c.id)))
  const chosen=visible.filter(c=>selected.has(c.id))
  const restore=async(c)=>updateDoc(doc(db,'customers',c.id),{archived:false,archivedAt:null,updatedAt:serverTimestamp(),updatedBy:user.uid})
  const updateSelected=async(nextArchived)=>{
    const ids=[...selected]
    setBusy(true);setMessage({text:'',success:true})
    try{
      for(let index=0;index<ids.length;index+=450){
        const batch=writeBatch(db)
        ids.slice(index,index+450).forEach(id=>batch.update(doc(db,'customers',id),{archived:nextArchived,archivedAt:nextArchived?serverTimestamp():null,updatedAt:serverTimestamp(),updatedBy:user.uid}))
        await batch.commit()
      }
      setSelected(new Set());setBulkAction('')
      setMessage({text:`${ids.length} ${ids.length===1?'customer':'customers'} ${nextArchived?'archived':'restored'} successfully.`,success:true})
    }catch{
      setMessage({text:`We could not ${nextArchived?'archive':'restore'} the selected customers. Please try again.`,success:false})
    }finally{setBusy(false)}
  }
  return <><PageTitle eyebrow={archived?'Protected records':'Simple CRM'} title={archived?'Customer archive':'Customer details'} copy={archived?'Records are retained here and can be restored at any time.':'Search, filter, update, export or prepare customer details for print.'} action={!archived&&<Link to="/app/customers/new" className="button button-gold"><Plus/> Add customer</Link>}/><div className="customer-toolbar"><label className="search-box"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, PAN or email…"/><kbd>⌘ K</kbd></label><div className="filter-tabs">{FILTERS.map(f=><button key={f} className={filter===f?'active':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>{message.text&&<div role="status" className={cx('form-message',message.success&&'success','bulk-message')}>{message.text}</div>}{visible.length?<div className="table-panel"><div className="selection-bar"><label><input type="checkbox" checked={visible.length>0&&selected.size===visible.length} onChange={toggleAll}/><span>{selected.size?`${selected.size} selected`:'Select visible customers'}</span></label>{selected.size>0&&<div className="selection-actions"><button onClick={()=>setPreview(true)}><Eye/> Print preview</button>{archived?<button className="bulk-restore" onClick={()=>setBulkAction('restore')}><RotateCcw/> Restore selected</button>:<button className="bulk-archive" onClick={()=>setBulkAction('archive')}><Archive/> Archive selected</button>}</div>}<span>{visible.length} {visible.length===1?'customer':'customers'}</span></div><div className="responsive-table"><table><thead><tr><th className="check-col"></th><th>Name</th><th>Phone</th><th>Email</th><th>PAN</th><th>Product</th><th>Referred by</th><th></th></tr></thead><tbody>{visible.map(c=><tr key={c.id}><td><input type="checkbox" aria-label={`Select ${c.name}`} checked={selected.has(c.id)} onChange={()=>setSelected(prev=>{const n=new Set(prev);n.has(c.id)?n.delete(c.id):n.add(c.id);return n})}/></td><td data-label="Name"><div className="customer-name"><span>{c.name.charAt(0).toUpperCase()}</span><strong>{c.name}</strong></div></td><td data-label="Phone">{c.phone}</td><td data-label="Email">{c.email||'—'}</td><td data-label="PAN"><code>{c.pan||'—'}</code></td><td data-label="Product"><span className={`product-pill p-${PRODUCTS.indexOf(c.product)}`}>{c.product}{c.product==='Cibil'&&c.cibilType?` · ${c.cibilType}`:''}</span></td><td data-label="Referred by">{c.referredBy||'—'}</td><td className="row-actions">{archived?<button onClick={()=>restore(c)} title="Restore customer"><RotateCcw size={17}/> Restore</button>:<><Link className="row-icon" aria-label={`Edit ${c.name}`} title="Edit customer" to={`/app/customers/${c.id}/edit`}><Edit3 size={17}/></Link><button className="row-icon" aria-label={`Archive ${c.name}`} title="Archive customer" onClick={()=>{setSelected(new Set([c.id]));setBulkAction('archive')}}><Archive size={17}/></button></>}</td></tr>)}</tbody></table></div></div>:<EmptyCustomers archived={archived}/>} {preview&&<PrintPreview customers={chosen} onClose={()=>setPreview(false)}/>} {bulkAction&&<ConfirmModal title={`${bulkAction==='archive'?'Archive':'Restore'} ${selected.size} ${selected.size===1?'customer':'customers'}?`} copy={bulkAction==='archive'?'The selected records will remain securely stored and can be restored from the archive at any time.':'The selected records will return to the active customer list.'} confirm={busy?'Please wait…':`${bulkAction==='archive'?'Archive':'Restore'} selected`} dangerous={bulkAction==='archive'} busy={busy} onCancel={()=>setBulkAction('')} onConfirm={()=>updateSelected(bulkAction==='archive')}/>}</>
}

const emptyCustomer = { name:'', phone:'', email:'', aadhaar:'', address:'', pincode:'', voterId:'', rationCardNo:'', pan:'', tradingCode:'', referredBy:'', product:'', cibilType:'', dob:'' }

export function CustomerFormPage() {
  const { id } = useParams(); const editing=Boolean(id); const nav=useNavigate(); const { customers,user }=useOutletContext()
  const current=customers.find(c=>c.id===id)
  const drawerRef=useRef(null)
  useEffect(()=>{const previous=document.activeElement;const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';const close=e=>{if(e.key==='Escape')nav('/app/customers');if(e.key==='Tab'){const items=drawerRef.current?.querySelectorAll('a[href],button:not(:disabled),input,select,textarea');if(!items?.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};document.addEventListener('keydown',close);drawerRef.current?.querySelector('button')?.focus();return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',close);previous?.focus()}},[nav])
  const [form,setForm]=useState(emptyCustomer); const [errors,setErrors]=useState({}); const [saving,setSaving]=useState(false); const [archiveConfirm,setArchiveConfirm]=useState(false)
  useEffect(()=>{if(current)setForm(Object.fromEntries(Object.keys(emptyCustomer).map(k=>[k,k==='dob'?dobToIso(current.dob):(current[k]||'')])))},[current])
  const change=(key,val)=>{setForm(f=>({...f,[key]:val}));setErrors(e=>({...e,[key]:''}))}
  const submit=async(e)=>{e.preventDefault();const result=validateCustomer(form);setErrors(result.errors);if(!result.valid)return;setSaving(true);try{const payload={...result.customer,dob:Timestamp.fromDate(new Date(`${result.customer.dob}T12:00:00`)),updatedAt:serverTimestamp(),updatedBy:user.uid};if(editing)await updateDoc(doc(db,'customers',id),payload);else await addDoc(collection(db,'customers'),{...payload,archived:false,archivedAt:null,createdAt:serverTimestamp(),createdBy:user.uid});nav('/app/customers')}finally{setSaving(false)}}
  const archiveCustomer=async()=>{await updateDoc(doc(db,'customers',id),{archived:true,archivedAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:user.uid});nav('/app/customers')}
  if(editing&&!current)return <div className="app-loading inline"><p>Loading customer…</p></div>
  return <div className="customer-drawer-backdrop" onClick={e=>{if(e.target===e.currentTarget)nav('/app/customers')}}><section className="customer-drawer" role="dialog" aria-modal="true" aria-label={editing?'Edit customer':'Add customer'} ref={drawerRef}><header className="drawer-heading"><strong>{editing?'Edit customer':'Add customer'}</strong><button className="icon-button" aria-label="Close customer form" onClick={()=>nav('/app/customers')}><X/></button></header><PageTitle eyebrow={editing?'Update relationship':'New relationship'} title={editing?'Edit customer':'Add customer'} copy="Add contact details, select a product and save the customer record."/><form className="customer-form" onSubmit={submit}><section><div className="form-section-head"><span>01</span><div><h2>Personal details</h2><p>The essential identity and contact information for this customer relationship.</p></div></div><div className="field-grid"><Field label="Full name" required error={errors.name}><input value={form.name} onChange={e=>change('name',e.target.value)} placeholder="e.g. Arjun Kumar" autoFocus required/></Field><Field label="Phone number" required error={errors.phone}><input value={form.phone} onChange={e=>change('phone',e.target.value)} placeholder="e.g. +91 91503 28704" inputMode="tel" required/></Field><Field label="Email ID" hint="Optional" error={errors.email}><input value={form.email} onChange={e=>change('email',e.target.value)} placeholder="customer@example.com" type="email"/></Field><Field label="Date of birth" required error={errors.dob}><input value={form.dob} onChange={e=>change('dob',e.target.value)} type="date" max={new Date().toISOString().slice(0,10)} required/></Field><Field label="Aadhaar number" hint="Optional" error={errors.aadhaar}><input value={form.aadhaar} onChange={e=>change('aadhaar',e.target.value)} placeholder="12-digit Aadhaar number" inputMode="numeric" maxLength={12}/></Field><Field label="Pincode" hint="Optional" error={errors.pincode}><input value={form.pincode} onChange={e=>change('pincode',e.target.value)} placeholder="6-digit pincode" inputMode="numeric" maxLength={6}/></Field><Field label="Voter ID number" hint="Optional" error={errors.voterId}><input value={form.voterId} onChange={e=>change('voterId',e.target.value.toUpperCase())} placeholder="Voter ID number" maxLength={20}/></Field><Field label="Ration card number" hint="Optional" error={errors.rationCardNo}><input value={form.rationCardNo} onChange={e=>change('rationCardNo',e.target.value.toUpperCase())} placeholder="Ration card number" maxLength={30}/></Field><Field label="Address" hint="Optional" error={errors.address} wide><textarea value={form.address} onChange={e=>change('address',e.target.value)} placeholder="Complete residential address" rows="3"/></Field></div></section><section><div className="form-section-head"><span>02</span><div><h2>Investment relationship</h2><p>Choose the primary product and add the available identifiers.</p></div></div><div className="field-grid"><Field label="Product" required error={errors.product}><select value={form.product} onChange={e=>change('product',e.target.value)} required><option value="">Select a product</option>{PRODUCTS.map(p=><option key={p}>{p}</option>)}</select></Field>{form.product==='Cibil'&&<Field label="Cibil type" required error={errors.cibilType}><select value={form.cibilType} onChange={e=>change('cibilType',e.target.value)} required><option value="">Select a Cibil type</option>{CIBIL_TYPES.map(type=><option key={type}>{type}</option>)}</select></Field>}<Field label="PAN card number" hint={form.product==='Shares'||form.product==='Mutual Funds'?'Required for this product':'Optional'} error={errors.pan}><input value={form.pan} onChange={e=>change('pan',e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10}/></Field><Field label="Trading code" hint="Optional"><input value={form.tradingCode} onChange={e=>change('tradingCode',e.target.value)} placeholder="Customer trading code"/></Field><Field label="Referred by" hint="Optional"><input value={form.referredBy} onChange={e=>change('referredBy',e.target.value)} placeholder="Referrer name or source"/></Field></div></section><div className="form-actions">{editing&&<button type="button" className="archive-button" onClick={()=>setArchiveConfirm(true)}><Archive/> Archive customer</button>}<div><button type="button" className="button button-ghost" onClick={()=>nav('/app/customers')}>Cancel</button><button className="button button-gold" disabled={saving}><Check/> {saving?'Saving…':editing?'Save changes':'Create customer'}</button></div></div></form>{archiveConfirm&&<ConfirmModal title="Archive this customer?" copy="The record will not be deleted. It will remain securely stored and can be restored from the archive at any time." confirm="Archive customer" onCancel={()=>setArchiveConfirm(false)} onConfirm={archiveCustomer}/>}</section></div>
}

function Field({label,hint,required,error,wide=false,children}) { return <label className={cx('field',wide&&'field-wide',error&&'has-error')}><span>{label}{required&&<b>*</b>}{hint&&<em>{hint}</em>}</span>{children}{error&&<small>{error}</small>}</label> }

function ConfirmModal({title,copy,confirm,onCancel,onConfirm,dangerous=true,busy=false}) { return <div className="modal-backdrop"><div className="confirm-modal"><span className="modal-icon">{dangerous?<Archive/>:<RotateCcw/>}</span><h2>{title}</h2><p>{copy}</p><div><button className="button button-ghost" disabled={busy} onClick={onCancel}>Cancel</button><button className={cx('button',dangerous?'button-danger':'button-dark')} disabled={busy} onClick={onConfirm}>{confirm}</button></div></div></div> }

function PrintPreview({customers,onClose}) {
  const pages=[]; for(let i=0;i<customers.length;i+=8)pages.push(customers.slice(i,i+8))
  const print=()=>window.print()
  return <div className="print-overlay"><header><div><span>Print preview</span><strong>{customers.length} customers · {pages.length} A4 landscape {pages.length===1?'page':'pages'}</strong></div><div><button onClick={onClose}><X/> Close</button><button className="button button-gold" onClick={print}><Printer/> Print</button></div></header><main className="print-preview">{pages.map((page,p)=><section className="print-page" key={p}><div className="print-heading"><div className="print-brand"><img src="/akshaya-logo-transparent.png" alt="Akshaya Stocks & Shares"/></div><div><h1>Customer Details</h1><p>Generated {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p></div></div><table><thead><tr><th>S. No</th><th>Name</th><th>Phone No</th><th>Email Id</th><th>Pan Card No</th><th>Trading Code</th><th>Product</th><th>Ref by</th></tr></thead><tbody>{page.map((c,i)=><tr key={c.id}><td>{p*8+i+1}</td><td>{c.name}</td><td>{c.phone}</td><td>{c.email||'—'}</td><td>{c.pan||'—'}</td><td>{c.tradingCode||'—'}</td><td>{c.product}{c.product==='Cibil'&&c.cibilType?` · ${c.cibilType}`:''}</td><td>{c.referredBy||'—'}</td></tr>)}</tbody></table><footer>1/31-A, First Floor, Anna Salai, Swarnapuri, Salem – 636004 <span>Page {p+1} of {pages.length}</span></footer></section>)}</main></div>
}

function ImportExportPage() {
  const { customers,user }=useOutletContext(); const fileRef=useRef(); const [rows,setRows]=useState([]); const [importErrors,setImportErrors]=useState([]); const [busy,setBusy]=useState(false); const [done,setDone]=useState('')
  const download=(data,name)=>{const blob=new Blob([data],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
  const template=()=>download(Papa.unparse([{'Name':'','Phone No':'','Email Id':'','Aadhaar':'','Address':'','Pincode':'','Voter ID No':'','Ration Card No':'','Pan Card No':'','Trading Code':'','Product':'Shares','Cibil Type':'','Ref by':'','DOB':'YYYY-MM-DD'}]),'akshaya-customer-import-template.csv')
  const exportAll=()=>download(Papa.unparse(rowsToCsv(customers)),'akshaya-customers.csv')
  const pick=(file)=>{setDone('');Papa.parse(file,{header:true,skipEmptyLines:true,complete:({data,errors})=>{const parsed=[];const issues=errors.map(e=>`Row ${e.row+2}: ${e.message}`);data.forEach((row,index)=>{const result=validateCustomer(csvRowToCustomer(row));if(result.valid)parsed.push(result.customer);else issues.push(`Row ${index+2}: ${Object.values(result.errors).join(' ')}`)});setRows(parsed);setImportErrors(issues)}})}
  const importRows=async()=>{setBusy(true);try{for(const c of rows)await addDoc(collection(db,'customers'),{...c,dob:Timestamp.fromDate(new Date(`${c.dob}T12:00:00`)),archived:false,archivedAt:null,createdAt:serverTimestamp(),updatedAt:serverTimestamp(),createdBy:user.uid,updatedBy:user.uid});setDone(`${rows.length} customer records imported successfully.`);setRows([]);if(fileRef.current)fileRef.current.value=''}finally{setBusy(false)}}
  return <><PageTitle eyebrow="Data tools" title="Import & export" copy="Move customer information safely with a guided CSV workflow."/><div className="transfer-grid"><section className="panel transfer-card"><span className="transfer-icon"><Download/></span><div><span>Bulk download</span><h2>Export customer details</h2><p>Download active and archived customer records in a clean CSV file for your secure offline records.</p></div><button className="button button-dark" onClick={exportAll}><FileSpreadsheet/> Download CSV</button><small>{customers.length} records ready</small></section><section className="panel transfer-card"><span className="transfer-icon gold"><Upload/></span><div><span>Bulk import</span><h2>Import customer details</h2><p>Start with our template. Identity and address fields are optional; PAN is required for shares and mutual funds, and Cibil Type is required for Cibil records.</p></div><button className="button button-ghost" onClick={template}><Download/> Download template</button><label className="file-drop"><CloudUpload/><strong>Choose a completed CSV file</strong><small>CSV up to 5 MB</small><input ref={fileRef} type="file" accept=".csv,text/csv" onChange={e=>e.target.files[0]&&pick(e.target.files[0])}/></label></section></div>{(rows.length>0||importErrors.length>0||done)&&<section className="panel import-review"><div className="panel-head"><div><span>Import review</span><h2>{done||`${rows.length} valid records ready`}</h2></div>{rows.length>0&&<button className="button button-gold" disabled={busy} onClick={importRows}><Upload/> {busy?'Importing…':'Import valid records'}</button>}</div>{importErrors.length>0&&<div className="import-errors"><strong>Please fix these rows and upload again:</strong>{importErrors.slice(0,8).map((e,i)=><p key={i}>{e}</p>)}</div>}{rows.length>0&&<div className="responsive-table compact-table"><table><thead><tr><th>Name</th><th>Phone</th><th>Product</th><th>DOB</th></tr></thead><tbody>{rows.slice(0,5).map((r,i)=><tr key={i}><td>{r.name}</td><td>{r.phone}</td><td>{r.product}{r.product==='Cibil'&&r.cibilType?` · ${r.cibilType}`:''}</td><td>{r.dob}</td></tr>)}</tbody></table>{rows.length>5&&<small>And {rows.length-5} more records…</small>}</div>}</section>}</>
}

function SettingsPage() {
  const {user,profile,setProfile}=useOutletContext(); const [current,setCurrent]=useState('');const [next,setNext]=useState('');const [confirm,setConfirm]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false)
  const change=async(e)=>{e.preventDefault();setMessage('');if(next.length<8){setMessage('Use at least 8 characters.');return}if(next!==confirm){setMessage('New passwords do not match.');return}setBusy(true);try{await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,current));await updatePassword(user,next);const data={mustChangePassword:false,changeDeferred:false,lastUpdatedAt:serverTimestamp()};await setDoc(doc(db,'users',user.uid),data,{merge:true});setProfile(p=>({...p,...data}));setMessage('Password changed successfully.');setCurrent('');setNext('');setConfirm('')}catch(e){setMessage(e.code==='auth/wrong-password'||e.code==='auth/invalid-credential'?'Your current password is incorrect.':e.message)}finally{setBusy(false)}}
  return <><PageTitle eyebrow="Account" title="Settings" copy="Manage the administrator account, workspace security and team access."/><div className="settings-grid"><section className="panel account-card"><div className="user-avatar-large">AS</div><div><span>Administrator account</span><h2>Akshaya Stocks & Shares</h2><p>{user.email}</p><em>{user.emailVerified?'Email verified':'Email verification pending'}</em></div></section><form className="panel password-card" onSubmit={change}><div className="panel-head"><div><span>Security</span><h2>Change password</h2></div><LockKeyhole/></div><Field label="Current password" required><input type="password" value={current} onChange={e=>setCurrent(e.target.value)} autoComplete="current-password"/></Field><Field label="New password" required><input type="password" value={next} onChange={e=>setNext(e.target.value)} autoComplete="new-password"/></Field><Field label="Confirm new password" required><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/></Field>{message&&<div className={cx('form-message',message.includes('successfully')&&'success')}>{message}</div>}<button className="button button-dark" disabled={busy}>{busy?'Updating…':'Update password'}</button><button type="button" className="link-button align-left" onClick={async()=>{await sendPasswordResetEmail(auth,user.email);setMessage('Password reset email sent.')}}>Send a password reset email instead</button></form></div><TeamMembersPanel user={user}/></>
}

function TeamMembersPanel({user}) {
  const [members,setMembers]=useState([]);const [username,setUsername]=useState('');const [password,setPassword]=useState('');const [showPassword,setShowPassword]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState({text:'',success:false})
  useEffect(()=>onSnapshot(collection(db,'teamMembers'),snapshot=>setMembers(snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>a.username.localeCompare(b.username))),()=>setMessage({text:'Team members could not be loaded.',success:false})),[])
  const createMember=async(e)=>{e.preventDefault();const clean=normalizeUsername(username);setMessage({text:'',success:false});if(!/^[a-z0-9._-]{3,30}$/.test(clean)){setMessage({text:'Use 3–30 lowercase letters, numbers, dots, underscores or hyphens.',success:false});return}if(password.length<8){setMessage({text:'Use a password with at least 8 characters.',success:false});return}setBusy(true);const secondaryAuth=getTeamCreatorAuth();let createdUser=null;try{await setPersistence(secondaryAuth,inMemoryPersistence);if(secondaryAuth.currentUser)await signOut(secondaryAuth);const credential=await createUserWithEmailAndPassword(secondaryAuth,teamEmailForUsername(clean),password);createdUser=credential.user;await setDoc(doc(db,'teamMembers',createdUser.uid),{username:clean,authEmail:teamEmailForUsername(clean),role:'staff',active:true,createdAt:serverTimestamp(),createdBy:user.uid,updatedAt:serverTimestamp(),updatedBy:user.uid});await signOut(secondaryAuth);setUsername('');setPassword('');setMessage({text:`Team member “${clean}” was created successfully.`,success:true})}catch(error){if(createdUser)await deleteUser(createdUser).catch(()=>{});if(secondaryAuth.currentUser)await signOut(secondaryAuth).catch(()=>{});setMessage({text:error.code==='auth/email-already-in-use'?'That username is already in use.':'The team member could not be created. Please try again.',success:false})}finally{setBusy(false)}}
  const toggleMember=async(member)=>{setMessage({text:'',success:false});try{await updateDoc(doc(db,'teamMembers',member.id),{active:!member.active,updatedAt:serverTimestamp(),updatedBy:user.uid});setMessage({text:`${member.username} has been ${member.active?'deactivated':'reactivated'}.`,success:true})}catch{setMessage({text:'The team member status could not be updated.',success:false})}}
  return <section className="panel team-card"><div className="panel-head"><div><span>Role-based access</span><h2>Team members</h2><p>Create username-and-password access for staff. Team members can use customer tools but cannot open Settings or manage accounts.</p></div><Users/></div><form className="team-create-form" onSubmit={createMember}><Field label="Username" required><input value={username} onChange={e=>setUsername(normalizeUsername(e.target.value))} placeholder="e.g. salem.team1" autoComplete="off" pattern="[a-z0-9._-]{3,30}" required/></Field><Field label="Temporary password" required><span className="password-input"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 characters" minLength={8} autoComplete="new-password" required/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff/>:<Eye/>}</button></span></Field><button className="button button-gold" disabled={busy}><UserPlus/> {busy?'Creating…':'Add team member'}</button></form>{message.text&&<div role="status" className={cx('form-message',message.success&&'success')}>{message.text}</div>}<div className="team-list"><div className="team-list-head"><strong>Current team</strong><span>{members.filter(member=>member.active).length} active</span></div>{members.length?members.map(member=><article key={member.id}><div className="team-avatar">{member.username.slice(0,2).toUpperCase()}</div><div><strong>{member.username}</strong><small>Team member · {member.active?'Active':'Inactive'}</small></div><span className={cx('member-status',member.active&&'active')}>{member.active?'Active':'Inactive'}</span><button type="button" className={cx('button','small',member.active?'button-ghost':'button-dark')} onClick={()=>toggleMember(member)}>{member.active?'Deactivate':'Reactivate'}</button></article>):<div className="empty-team">No team members have been added yet.</div>}</div></section>
}

function AdminRoute({profile,children}) { return profile?.role==='administrator'?children:<Navigate to="/app" replace/> }

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
  useEffect(()=>onAuthStateChanged(auth,next=>{setUser(next);setProfile(null);setCustomers([]);setAuthLoading(Boolean(next))}),[])
  useEffect(()=>{
    if(!user){setAuthLoading(false);return}
    let active=true
    setAuthLoading(true)
    if(user.email===ADMIN_EMAIL){
      const loadAdmin=async()=>{
        if(!user.emailVerified){if(active){setProfile({role:'administrator'});setAuthLoading(false)};return}
        const ref=doc(db,'users',user.uid)
        const snap=await getDoc(ref).catch(()=>null)
        if(!active)return
        if(snap?.exists())setProfile({...snap.data(),role:'administrator'})
        else{
          const initial={mustChangePassword:true,changeDeferred:false,onboardingCreatedAt:serverTimestamp(),lastUpdatedAt:serverTimestamp()}
          try{await setDoc(ref,initial);if(active)setProfile({...initial,role:'administrator'})}
          catch{if(active){setProfile(null);await signOut(auth)}}
        }
        if(active)setAuthLoading(false)
      }
      loadAdmin()
      return()=>{active=false}
    }
    const memberRef=doc(db,'teamMembers',user.uid)
    return onSnapshot(memberRef,snapshot=>{
      const data=snapshot.exists()?snapshot.data():null
      if(data?.role==='staff'&&data.active===true){setProfile(data);setAuthLoading(false)}
      else{setProfile(null);setAuthLoading(false);signOut(auth)}
    },()=>{setProfile(null);setAuthLoading(false);signOut(auth)})
  },[user])
  useEffect(()=>{
    const canAccess=user&&profile&&((profile.role==='administrator'&&user.emailVerified)||(profile.role==='staff'&&profile.active===true))
    if(!canAccess){setCustomers([]);return}
    return onSnapshot(collection(db,'customers'),snap=>setCustomers(snap.docs.map(d=>({id:d.id,...d.data()}))),()=>setCustomers([]))
  },[user,profile])
  const adminNeedsVerification=Boolean(user&&profile?.role==='administrator'&&!user.emailVerified)
  const appShell=<><AppShell user={user} customers={customers} profile={profile} setProfile={setProfile}/>{profile?.role==='administrator'&&<FirstLoginPrompt user={user} profile={profile} setProfile={setProfile}/>}</>
  return <Routes><Route path="/" element={<HomePage/>}/><Route path="/about" element={<ContentPage type="about"/>}/><Route path="/services" element={<ContentPage type="services"/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/auth/action" element={<AuthActionPage/>}/><Route path="/login" element={<LoginPage user={user}/>}/><Route element={<AuthGate user={user} loading={authLoading}/>}>{adminNeedsVerification?<Route path="/app/*" element={<VerifyEmail user={user}/>}/>:<Route path="/app" element={appShell}><Route index element={<DashboardPage/>}/><Route path="customers" element={<CustomersPage/>}/><Route path="customers/new" element={<CustomerFormPage/>}/><Route path="customers/:id/edit" element={<CustomerFormPage/>}/><Route path="import" element={<ImportExportPage/>}/><Route path="archive" element={<CustomersPage archived/>}/><Route path="settings" element={<AdminRoute profile={profile}><SettingsPage/></AdminRoute>}/></Route>}</Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
