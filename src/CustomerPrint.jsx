import {useEffect,useLayoutEffect,useRef,useState} from 'react'
import {Printer,X} from 'lucide-react'
import FieldSelection from './FieldSelection'
import {CUSTOMER_FIELDS,DEFAULT_PRINT_FIELDS,customerFieldValue,paginateLabelRows,readFieldPreference} from './customerFields'

export default function CustomerPrint({customers,onClose,preferenceKey='akshaya-print-fields'}){
  const [fields,setFields]=useState(()=>{const saved=readFieldPreference(preferenceKey,DEFAULT_PRINT_FIELDS);return !localStorage.getItem(preferenceKey+'-pincode-added')&&saved.length&&!saved.includes('pincode')?[...saved,'pincode']:saved})
  const [pages,setPages]=useState([])
  const [scales,setScales]=useState({})
  const measure=useRef(null)
  const rowCount=Math.ceil(customers.length/2)
  useEffect(()=>{localStorage.setItem(preferenceKey,JSON.stringify(fields));localStorage.setItem(preferenceKey+'-pincode-added','true')},[fields,preferenceKey])
  useEffect(()=>{const overflow=document.body.style.overflow;document.body.style.overflow='hidden';const keyboard=e=>{if(e.key==='Escape')onClose()};document.addEventListener('keydown',keyboard);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keyboard)}},[onClose])
  useLayoutEffect(()=>{
    const node=measure.current
    if(!node)return
    if(!fields.length){setPages([]);setScales({});return}
    const capacity=node.querySelector('.print-label-space').clientHeight-2
    const heights=[...node.querySelectorAll('.print-label-row')].map((row,index)=>({index,height:Math.ceil(row.getBoundingClientRect().height)}))
    const nextScales={}
    const fitted=heights.map(row=>{if(row.height>capacity){nextScales[row.index]=capacity/row.height;return {...row,height:capacity}}return row})
    setScales(nextScales);setPages(paginateLabelRows(fitted,capacity))
  },[customers,fields])
  const row=(index,measuring=false)=><div className="print-label-row" key={index} style={!measuring&&scales[index]?{zoom:scales[index]}:undefined}>{customers.slice(index*2,index*2+2).map(customer=><article className="print-customer-label" key={customer.id}>{fields.map(key=><p key={key}><span>{CUSTOMER_FIELDS.find(field=>field.key===key).label}</span><span>{customerFieldValue(customer,key)}</span></p>)}</article>)}</div>
  return <div className="print-overlay customer-label-print"><header><div><span>Print preview</span><strong>{customers.length} customers · {pages.length} A4 portrait {pages.length===1?'page':'pages'}</strong></div><div><button onClick={onClose}><X/> Close</button><button className="button button-gold" disabled={!pages.length} onClick={()=>window.print()}><Printer/> Print</button></div></header><section className="print-options"><div><strong>Details to print</strong><button className="link-button" onClick={()=>setFields(DEFAULT_PRINT_FIELDS)}>Reset to Name, Address, Phone No, Pincode</button></div><FieldSelection value={fields} onChange={setFields}/>{!fields.length&&<p role="status">Select at least one detail to print.</p>}</section><section ref={measure} className="print-page label-print-page print-measure" aria-hidden="true"><div className="print-label-space">{Array.from({length:rowCount},(_,index)=>row(index,true))}</div><footer>Page 1</footer></section><main className="print-preview">{pages.map((page,index)=><section className="print-page label-print-page" key={index}><div className="print-label-space">{page.map(rowIndex=>row(rowIndex))}</div><footer>Page {index+1} of {pages.length}</footer></section>)}</main></div>
}
