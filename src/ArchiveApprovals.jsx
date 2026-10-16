import {useState} from 'react'
import {reviewArchiveRequest} from './archiveApproval'

export default function ArchiveApprovals({requests,customers,user,isAdmin,error}){
  const [busy,setBusy]=useState(''),[message,setMessage]=useState('')
  const pending=requests.filter(item=>item.status==='pending')
  const ordered=[...requests].sort((a,b)=>(b.requestedAt?.toMillis?.()||0)-(a.requestedAt?.toMillis?.()||0))
  const review=async(request,approve)=>{
    if(!window.confirm(approve?'Approve this request and archive the customer?':'Reject this archive request?'))return
    setBusy(request.id);setMessage('')
    try{await reviewArchiveRequest(request.id,approve,user);setMessage(approve?'Request approved. Customer archived.':'Request rejected. Customer remains active.')}catch(e){setMessage(e.message)}finally{setBusy('')}
  }
  return <section className="panel archive-approvals" aria-label="Archive requests"><details open={pending.length>0}><summary><strong>{isAdmin?'Archive approvals':'My archive requests'}</strong><span>{pending.length} pending</span></summary>{error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}{!requests.length&&!error&&<p>No archive requests yet.</p>}<div className="archive-request-list">{ordered.map(item=><article key={item.id}><div><strong>{customers.find(c=>c.id===item.customerId)?.name||'Customer unavailable'}</strong><small>Requested by {item.requestedByName} · {item.requestedAt?.toDate?.().toLocaleString('en-IN')||'Just now'}</small><span className="product-pill">{item.status}</span></div>{isAdmin&&item.status==='pending'&&<div className="archive-review-actions"><button className="button button-ghost" disabled={Boolean(busy)} onClick={()=>review(item,false)}>Reject</button><button className="button button-dark" disabled={Boolean(busy)} onClick={()=>review(item,true)}>{busy===item.id?'Please wait…':'Approve archive'}</button></div>}</article>)}</div></details></section>
}
