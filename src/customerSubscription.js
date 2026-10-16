import {collection,onSnapshot} from 'firebase/firestore'

export function customerLoadError(error){
  if(error?.code==='permission-denied')return 'Customer access was denied. Ask the administrator to check that this team account is active, then sign out and sign in again.'
  if(error?.code==='unauthenticated')return 'Your sign-in session could not be verified. Please sign out and sign in again.'
  return 'Customer records could not be loaded. Check the internet connection or any VPN/firewall restrictions, then retry.'
}

export function watchCustomers(database,onData,onStatus){
  let active=true
  onStatus({loading:true,error:'',cached:false})
  const timer=setTimeout(()=>{if(active)onStatus({loading:false,error:'The customer connection is taking longer than expected. Check your internet connection and retry.',cached:false})},15000)
  const stop=onSnapshot(collection(database,'customers'),{includeMetadataChanges:true},snapshot=>{
    if(!active)return
    const cached=snapshot.metadata.fromCache
    // An initial empty cache is not evidence that the shared database is empty.
    if(cached&&snapshot.empty)return
    clearTimeout(timer)
    onData(snapshot.docs.map(item=>({id:item.id,...item.data()})))
    onStatus({loading:false,error:'',cached})
  },error=>{
    if(!active)return
    clearTimeout(timer)
    if(error?.code==='permission-denied'||error?.code==='unauthenticated')onData([])
    onStatus({loading:false,error:customerLoadError(error),cached:false})
  })
  return()=>{active=false;clearTimeout(timer);stop()}
}
