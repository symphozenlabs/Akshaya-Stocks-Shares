import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest'
const mocks=vi.hoisted(()=>({listen:vi.fn(),stop:vi.fn()}))
vi.mock('firebase/firestore',()=>({collection:()=> 'customers',onSnapshot:mocks.listen}))
import {watchCustomers,customerLoadError} from './customerSubscription'
let data,status,success,failure
beforeEach(()=>{vi.useFakeTimers();vi.clearAllMocks();data=vi.fn();status=vi.fn();mocks.listen.mockImplementation((ref,options,next,error)=>{success=next;failure=error;return mocks.stop})})
afterEach(()=>vi.useRealTimers())
const snap=(cached,rows)=>({metadata:{fromCache:cached},empty:!rows.length,docs:rows.map(id=>({id,data:()=>({name:'Example'})}))})
describe('shared customer loading',()=>{
  it('does not mistake an empty local cache for an empty shared database',()=>{
    watchCustomers({},data,status);success(snap(true,[]));expect(data).not.toHaveBeenCalled();expect(status).toHaveBeenLastCalledWith(expect.objectContaining({loading:true}))
    success(snap(false,['c1']));expect(data).toHaveBeenCalledWith([{id:'c1',name:'Example'}]);expect(status).toHaveBeenLastCalledWith({loading:false,error:'',cached:false})
  })
  it('allows a confirmed empty server result',()=>{watchCustomers({},data,status);success(snap(false,[]));expect(data).toHaveBeenCalledWith([]);expect(status).toHaveBeenLastCalledWith({loading:false,error:'',cached:false})})
  it('shows an actionable timeout instead of silently displaying no customers',()=>{watchCustomers({},data,status);vi.advanceTimersByTime(15000);expect(status).toHaveBeenLastCalledWith(expect.objectContaining({loading:false,error:expect.stringContaining('taking longer')}));expect(data).not.toHaveBeenCalled()})
  it('surfaces permission problems and removes inaccessible cached records',()=>{watchCustomers({},data,status);failure({code:'permission-denied'});expect(data).toHaveBeenCalledWith([]);expect(status).toHaveBeenLastCalledWith(expect.objectContaining({error:expect.stringContaining('access was denied')}))})
  it('retains already loaded records on a transient connection failure',()=>{watchCustomers({},data,status);success(snap(false,['c1']));failure({code:'unavailable'});expect(data).toHaveBeenCalledTimes(1);expect(status).toHaveBeenLastCalledWith(expect.objectContaining({error:expect.stringContaining('connection')}))})
  it('cancels timers and ignores callbacks after sign-out or retry',()=>{const stop=watchCustomers({},data,status);stop();vi.advanceTimersByTime(15000);success(snap(false,['old-user']));expect(mocks.stop).toHaveBeenCalled();expect(data).not.toHaveBeenCalled();expect(status).toHaveBeenCalledTimes(1)})
  it('does not expose raw backend error details',()=>expect(customerLoadError({message:'internal information'})).not.toContain('internal information'))
})
