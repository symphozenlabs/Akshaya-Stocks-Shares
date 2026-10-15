import {useEffect,useRef} from 'react'
import {X} from 'lucide-react'
import {CUSTOMER_FIELDS,customerFieldValue} from './customerFields'

export default function CustomerDetails({customer,onClose}){
  const ref=useRef(null)
  useEffect(()=>{
    const previous=document.activeElement,overflow=document.body.style.overflow
    document.body.style.overflow='hidden';ref.current?.querySelector('button')?.focus()
    const keyboard=e=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){e.preventDefault();ref.current?.querySelector('button')?.focus()}}
    document.addEventListener('keydown',keyboard)
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keyboard);previous?.focus()}
  },[onClose])
  return <div className="customer-drawer-backdrop" onClick={event=>{if(event.target===event.currentTarget)onClose()}}><section ref={ref} className="customer-drawer customer-view" role="dialog" aria-modal="true" aria-labelledby="customer-view-title"><header className="drawer-heading"><strong id="customer-view-title">Customer details</strong><button className="icon-button" aria-label="Close customer details" onClick={onClose}><X/></button></header><h2>{customer.name}</h2><span className="product-pill">{customer.archived?'Archived':'Active'}</span><dl className="customer-details-list">{CUSTOMER_FIELDS.map(field=><div key={field.key}><dt>{field.label}</dt><dd>{customerFieldValue(customer,field.key)}</dd></div>)}</dl></section></div>
}
