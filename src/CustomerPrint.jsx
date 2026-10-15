import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {Printer,X} from 'lucide-react'
import {CUSTOMER_FIELDS,DEFAULT_PRINT_FIELDS,customerFieldValue,paginateLabelRows,readFieldPreference} from './customerFields'

export default function CustomerPrint({customers,onClose,preferenceKey='akshaya-print-fields'}){
  const [fields,setFields]=useState(()=>readFieldPreference(preferenceKey,DEFAULT_PRINT_FIELDS))
  const [pages,setPages]=useState([])
  const [scales,setScales]=useState({})
  const measure=useRef(null)
  const rowCount=Math.ceil(customers.length/2)
  useEffect(()=>{localStorage.setItem(preferenceKey,JSON.stringify(fields))},[fields,preferenceKey])
  useEffect(()=>{const overflow=document.body.style.overflow;document.body.style.overflow='hidden';const keyboard=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',keyboard);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keyboard)}},[onClose])
  useLayoutEffect(()=>{
    const node=measure.current
    if(!node)return
    const capacity=node.querySelector('.print-label-space').clientHeight-2
    const heights=[...node.querySelectorAll('.print-label-row')].map((row,index)=>({index,height:Math.ceil(row.getBoundingClientRect().height)}))
    const nextScales={}
    const fitted=heights.map(row=>{if(row.height>capacity){nextScales[row.index]=capacity/row.height;return {...row,height:capacity}}return row})
    setScales(nextScales);setPages(paginateLabelRows(fitted,capacity))
  },[customers,fields])
  const heading=<div className="print-heading"><div className="print-brand"><img src="/akshaya-logo-transparent.png" alt="Akshaya Stocks & Shares"/></div><div><h1>Customer Details</h1></div></div>
  const row=(index,measuring=false)=><div className="print-label-row" key={index} style={!measuring&&scales[index]?{zoom:scales[index]}:undefined}>{customers.slice(index*2,index*2+2).map(customer=><article className="print-customer-label" key={customer.id}>{fields.map(key=><p key={key}><span>{CUSTOMER_FIELDS.find(field=>field.key===key).label} - </span>{customerFieldValue(customer,key)}</p>)}</article>)}</div>
  const toggle=key=>setFields(previous=>previous.includes(key)?previous.length>1?previous.filter(field=>field!==key):previous:[...previous,key])
  return <div className="print-overlay customer-label-print"><header><div><span>Print preview</span><strong>{customers.length} customers · {pages.length} A4 landscape {pages.length===1?'page':'pages'}</strong></div><div><button onClick={onClose}><X/> Close</button><button className="button button-gold" disabled={!pages.length} onClick={()=>window.print()}><Printer/> Print</button></div></header><section className="print-options"><div><strong>Details to print</strong><button className="link-button" onClick={()=>setFields(DEFAULT_PRINT_FIELDS)}>Reset to Name, Address, Phone No</button></div><div className="field-picker-options">{CUSTOMER_FIELDS.map(field=><label key={field.key}><input type="checkbox" checked={fields.includes(field.key)} disabled={fields.length===1&&fields.includes(field.key)} onChange={()=>toggle(field.key)}/>{field.label}</label>)}</div></section><section ref={measure} className="print-page label-print-page print-measure" aria-hidden="true">{heading}<div className="print-label-space">{Array.from({length:rowCount},(_,index)=>row(index,true))}</div><footer>Page 1</footer></section><main className="print-preview">{pages.map((page,index)=><section className="print-page label-print-page" key={index}>{heading}<div className="print-label-space">{page.map(rowIndex=>row(rowIndex))}</div><footer>Akshaya Stocks & Shares <span>Page {index+1} of {pages.length}</span></footer></section>)}</main></div>
}
