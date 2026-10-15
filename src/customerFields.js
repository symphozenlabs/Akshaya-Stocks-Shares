import {dobToIso} from './lib'

export const CUSTOMER_FIELDS=[
  {key:'name',label:'Name'},{key:'address',label:'Address'},{key:'phone',label:'Phone No'},
  {key:'email',label:'Email ID'},{key:'pan',label:'PAN'},{key:'product',label:'Product'},
  {key:'cibilType',label:'Cibil type'},{key:'tradingCode',label:'Trading code'},
  {key:'referredBy',label:'Referred by'},{key:'dob',label:'Date of birth'},
  {key:'aadhaar',label:'Aadhaar'},{key:'pincode',label:'Pincode'},
  {key:'voterId',label:'Voter ID'},{key:'rationCardNo',label:'Ration card No.'}
]
export const DEFAULT_VISIBLE_FIELDS=['name','phone','email','pan','product','referredBy']
export const DEFAULT_PRINT_FIELDS=['name','address','phone']
export function customerFieldValue(customer,key){
  if(key==='dob')return dobToIso(customer.dob)||'—'
  return String(customer[key]||'—')
}
export function readFieldPreference(key,fallback){
  try{const stored=JSON.parse(localStorage.getItem(key));const valid=Array.isArray(stored)?stored.filter(field=>CUSTOMER_FIELDS.some(item=>item.key===field)):[];return valid.length?[...new Set(valid)]:fallback}catch{return fallback}
}
export function paginateLabelRows(rows,capacity){
  const pages=[];let page=[],used=0
  for(const row of rows){if(page.length&&used+row.height>capacity){pages.push(page);page=[];used=0}page.push(row.index);used+=row.height}
  if(page.length)pages.push(page)
  return pages
}
