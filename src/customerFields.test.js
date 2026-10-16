import {describe,it,expect,vi} from 'vitest'
import {DEFAULT_PRINT_FIELDS,paginateLabelRows,customerFieldValue,readFieldPreference} from './customerFields'
describe('customer field and label printing',()=>{
  it('defaults to the requested four fields',()=>expect(DEFAULT_PRINT_FIELDS).toEqual(['name','address','phone','pincode']))
  it('keeps pairs together and moves overflowing rows to the next page',()=>expect(paginateLabelRows([{index:0,height:60},{index:1,height:50},{index:2,height:40}],100)).toEqual([[0],[1,2]]))
  it('handles no customers',()=>expect(paginateLabelRows([],100)).toEqual([]))
  it('retains an intentionally cleared field selection',()=>{vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify([])});try{expect(readFieldPreference('fields',DEFAULT_PRINT_FIELDS)).toEqual([])}finally{vi.unstubAllGlobals()}})
  it('shows a placeholder for missing optional data',()=>expect(customerFieldValue({},'address')).toBe('—'))
  it('displays the legacy product as CIC without renaming its bureau type',()=>{expect(customerFieldValue({product:'Cibil'},'product')).toBe('CIC');expect(customerFieldValue({cibilType:'Cibil'},'cibilType')).toBe('Cibil')})
})
