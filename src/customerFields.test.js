import {describe,it,expect} from 'vitest'
import {DEFAULT_PRINT_FIELDS,paginateLabelRows,customerFieldValue} from './customerFields'
describe('customer field and label printing',()=>{
  it('defaults to the requested three fields',()=>expect(DEFAULT_PRINT_FIELDS).toEqual(['name','address','phone']))
  it('keeps pairs together and moves overflowing rows to the next page',()=>expect(paginateLabelRows([{index:0,height:60},{index:1,height:50},{index:2,height:40}],100)).toEqual([[0],[1,2]]))
  it('handles no customers',()=>expect(paginateLabelRows([],100)).toEqual([]))
  it('shows a placeholder for missing optional data',()=>expect(customerFieldValue({},'address')).toBe('—'))
})
