import {beforeEach,describe,it,expect,vi} from 'vitest'
const mocks=vi.hoisted(()=>({addDoc:vi.fn(),runTransaction:vi.fn(),get:vi.fn(),update:vi.fn()}))
vi.mock('./firebase',()=>({db:{}}))
vi.mock('firebase/firestore',()=>({addDoc:mocks.addDoc,runTransaction:mocks.runTransaction,collection:(_,name)=>name,doc:(_,collection,id)=>collection+'/'+id,serverTimestamp:()=> 'SERVER_TIME',onSnapshot:vi.fn(),query:vi.fn(),where:vi.fn()}))
import {requestCustomerArchive,reviewArchiveRequest} from './archiveApproval'
beforeEach(()=>{vi.clearAllMocks();mocks.runTransaction.mockImplementation((_,callback)=>callback({get:mocks.get,update:mocks.update}))})
describe('archive approval workflow',()=>{
  it('team request creates pending approval without mutating the customer',async()=>{
    await requestCustomerArchive('customer1',{uid:'staff'},'staff.one')
    expect(mocks.addDoc).toHaveBeenCalledWith('archiveRequests',expect.objectContaining({customerId:'customer1',status:'pending',requestedBy:'staff',reviewedBy:null,reviewedAt:null}))
    expect(mocks.update).not.toHaveBeenCalled()
  })
  it('approval archives customer and resolves request in the same transaction',async()=>{
    mocks.get.mockResolvedValueOnce({exists:()=>true,data:()=>({status:'pending',customerId:'c1'})}).mockResolvedValueOnce({exists:()=>true,data:()=>({archived:false})})
    await reviewArchiveRequest('r1',true,{uid:'admin'})
    expect(mocks.update).toHaveBeenNthCalledWith(1,'customers/c1',expect.objectContaining({archived:true,updatedBy:'admin'}))
    expect(mocks.update).toHaveBeenNthCalledWith(2,'archiveRequests/r1',expect.objectContaining({status:'approved',reviewedBy:'admin'}))
  })
  it('rejects request without changing customer',async()=>{
    mocks.get.mockResolvedValueOnce({exists:()=>true,data:()=>({status:'pending',customerId:'c1'})}).mockResolvedValueOnce({exists:()=>true,data:()=>({archived:false})})
    await reviewArchiveRequest('r1',false,{uid:'admin'})
    expect(mocks.update).toHaveBeenCalledTimes(1)
    expect(mocks.update).toHaveBeenCalledWith('archiveRequests/r1',expect.objectContaining({status:'rejected'}))
  })
  it('prevents replaying a reviewed request',async()=>{
    mocks.get.mockResolvedValueOnce({exists:()=>true,data:()=>({status:'approved'})})
    await expect(reviewArchiveRequest('r1',true,{uid:'admin'})).rejects.toThrow('already been reviewed')
    expect(mocks.update).not.toHaveBeenCalled()
  })
  it('resolves a duplicate pending request without re-archiving an archived customer',async()=>{
    mocks.get.mockResolvedValueOnce({exists:()=>true,data:()=>({status:'pending',customerId:'c1'})}).mockResolvedValueOnce({exists:()=>true,data:()=>({archived:true})})
    await reviewArchiveRequest('r2',true,{uid:'admin'})
    expect(mocks.update).toHaveBeenCalledTimes(1)
    expect(mocks.update).toHaveBeenCalledWith('archiveRequests/r2',expect.objectContaining({status:'approved'}))
  })
})
