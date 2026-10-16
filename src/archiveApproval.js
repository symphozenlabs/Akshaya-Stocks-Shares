import {useEffect,useState} from 'react'
import {addDoc,collection,doc,onSnapshot,query,where,runTransaction,serverTimestamp} from 'firebase/firestore'
import {db} from './firebase'

export function useArchiveRequests(user,isAdmin){
  const [state,setState]=useState({requests:[],error:''})
  useEffect(()=>{
    setState({requests:[],error:''})
    if(!user)return
    const source=isAdmin?collection(db,'archiveRequests'):query(collection(db,'archiveRequests'),where('requestedBy','==',user.uid))
    return onSnapshot(source,snapshot=>setState({requests:snapshot.docs.map(item=>({id:item.id,...item.data()})),error:''}),()=>setState({requests:[],error:'Archive requests could not be loaded. Please refresh and try again.'}))
  },[user?.uid,isAdmin])
  return state
}

export async function requestCustomerArchive(customerId,user,username){
  return addDoc(collection(db,'archiveRequests'),{customerId,requestedBy:user.uid,requestedByName:username,status:'pending',requestedAt:serverTimestamp(),reviewedBy:null,reviewedAt:null})
}

export async function reviewArchiveRequest(requestId,approve,user){
  await runTransaction(db,async transaction=>{
    const ref=doc(db,'archiveRequests',requestId),snapshot=await transaction.get(ref)
    if(!snapshot.exists()||snapshot.data().status!=='pending')throw new Error('This request has already been reviewed. Refresh the list.')
    const customerRef=doc(db,'customers',snapshot.data().customerId)
    const customer=await transaction.get(customerRef)
    if(approve&&!customer.exists())throw new Error('The customer could not be found.')
    if(approve&&!customer.data().archived)transaction.update(customerRef,{archived:true,archivedAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:user.uid})
    transaction.update(ref,{status:approve?'approved':'rejected',reviewedBy:user.uid,reviewedAt:serverTimestamp()})
  })
}
