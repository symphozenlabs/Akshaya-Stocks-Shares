import {useEffect,useRef} from 'react'
import {CUSTOMER_FIELDS} from './customerFields'
export default function FieldSelection({value,onChange}){
  const all=useRef(null)
  useEffect(()=>{if(all.current)all.current.indeterminate=value.length>0&&value.length<CUSTOMER_FIELDS.length},[value])
  return <div className="field-picker-options"><label className="select-all-fields"><input ref={all} type="checkbox" checked={value.length===CUSTOMER_FIELDS.length} onChange={e=>onChange(e.target.checked?CUSTOMER_FIELDS.map(field=>field.key):[])}/>Select all</label>{CUSTOMER_FIELDS.map(field=><label key={field.key}><input type="checkbox" checked={value.includes(field.key)} onChange={()=>onChange(value.includes(field.key)?value.filter(key=>key!==field.key):[...value,field.key])}/>{field.label}</label>)}</div>
}
