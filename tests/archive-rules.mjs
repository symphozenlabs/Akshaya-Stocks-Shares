import {readFileSync} from 'node:fs'
import {before,after,beforeEach,test} from 'node:test'
import {initializeTestEnvironment,assertSucceeds,assertFails} from '@firebase/rules-unit-testing'
import {doc,setDoc,updateDoc,deleteDoc,getDoc,getDocs,collection,query,where,serverTimestamp,Timestamp,writeBatch} from 'firebase/firestore'
let env
const adminClaims={email:'akshayastocksshares@gmail.com',email_verified:true}
const now=Timestamp.fromMillis(Date.now()-10000)
const customer={name:'Test Customer',nameLower:'test customer',phone:'9150328704',email:'',pan:'',tradingCode:'',referredBy:'',product:'Other Investments',dob:Timestamp.fromMillis(946684800000),archived:false,archivedAt:null,createdAt:now,updatedAt:now,createdBy:'admin',updatedBy:'admin',aadhaar:'',address:'',pincode:'',voterId:'',rationCardNo:'',cibilType:''}
const request={customerId:'c1',requestedBy:'staff',requestedByName:'staff.one',requestedAt:now,status:'pending',reviewedBy:null,reviewedAt:null}
const staff=()=>env.authenticatedContext('staff',{email:'staff.one@team.akshaya-ss.app'}).firestore()
const admin=()=>env.authenticatedContext('admin',adminClaims).firestore()
const archive={archived:true,archivedAt:serverTimestamp(),updatedAt:serverTimestamp(),updatedBy:'staff'}
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-akshaya-rbac',firestore:{rules:readFileSync('firestore.rules','utf8')}})})
after(async()=>env?.cleanup())
beforeEach(async()=>{await env.clearFirestore();await env.withSecurityRulesDisabled(async ctx=>{
  const db=ctx.firestore()
  await setDoc(doc(db,'customers','c1'),customer)
  await setDoc(doc(db,'teamMembers','staff'),{username:'staff.one',role:'staff',active:true})
  await setDoc(doc(db,'archiveRequests','r1'),request)
})})
test('staff cannot archive, restore, delete, or create archived customers',async()=>{
  const db=staff();await assertFails(updateDoc(doc(db,'customers','c1'),archive));await assertFails(deleteDoc(doc(db,'customers','c1')))
  await assertFails(setDoc(doc(db,'customers','new'),{...customer,...archive,createdAt:serverTimestamp(),createdBy:'staff'}))
  await env.withSecurityRulesDisabled(ctx=>updateDoc(doc(ctx.firestore(),'customers','c1'),{archived:true,archivedAt:now}))
  await assertFails(updateDoc(doc(db,'customers','c1'),{archived:false,archivedAt:null,updatedAt:serverTimestamp(),updatedBy:'staff'}))
})
test('staff may edit normal customer details without changing archive state',async()=>assertSucceeds(updateDoc(doc(staff(),'customers','c1'),{name:'Updated Customer',nameLower:'updated customer',updatedAt:serverTimestamp(),updatedBy:'staff'})))
test('active staff may request archive with own identity and server timestamp',async()=>assertSucceeds(setDoc(doc(staff(),'archiveRequests','new'),{...request,requestedAt:serverTimestamp()})))
test('request cannot spoof identity, target missing/archived customer or inject fields',async()=>{
  for(const changes of [{requestedBy:'admin'},{requestedByName:'admin'},{customerId:'missing'},{customerId:'nested/path'},{status:'approved'},{requestedAt:now},{extra:'bad'},{customerId:'x'.repeat(129)}])await assertFails(setDoc(doc(staff(),'archiveRequests','bad'),{...request,requestedAt:serverTimestamp(),...changes}))
  await env.withSecurityRulesDisabled(ctx=>updateDoc(doc(ctx.firestore(),'customers','c1'),{archived:true,archivedAt:now}))
  await assertFails(setDoc(doc(staff(),'archiveRequests','bad'),{...request,requestedAt:serverTimestamp()}))
})
test('staff cannot approve, reject, change target or delete requests',async()=>{
  const ref=doc(staff(),'archiveRequests','r1')
  for(const changes of [{status:'approved',reviewedBy:'staff',reviewedAt:serverTimestamp()},{status:'rejected',reviewedBy:'staff',reviewedAt:serverTimestamp()},{customerId:'other'}])await assertFails(updateDoc(ref,changes))
  await assertFails(deleteDoc(ref))
})
test('admin approval and customer archive commit atomically; replay denied',async()=>{
  const db=admin(),ref=doc(db,'archiveRequests','r1'),decision={status:'approved',reviewedBy:'admin',reviewedAt:serverTimestamp()}
  await assertFails(updateDoc(ref,decision))
  const batch=writeBatch(db);batch.update(doc(db,'customers','c1'),{...archive,updatedBy:'admin'});batch.update(ref,decision);await assertSucceeds(batch.commit())
  await assertFails(updateDoc(ref,{status:'rejected',reviewedBy:'admin',reviewedAt:serverTimestamp()}))
})
test('admin may reject without archiving, but cannot change request origin',async()=>{
  const ref=doc(admin(),'archiveRequests','r1')
  await assertFails(updateDoc(ref,{status:'rejected',requestedBy:'admin',reviewedBy:'admin',reviewedAt:serverTimestamp()}))
  await assertSucceeds(updateDoc(ref,{status:'rejected',reviewedBy:'admin',reviewedAt:serverTimestamp()}))
})
test('administrator can directly archive and restore; permanent delete denied',async()=>{
  const ref=doc(admin(),'customers','c1');await assertSucceeds(updateDoc(ref,{...archive,updatedBy:'admin'}));await assertSucceeds(updateDoc(ref,{archived:false,archivedAt:null,updatedAt:serverTimestamp(),updatedBy:'admin'}));await assertFails(deleteDoc(ref))
})
test('staff query limited to own requests; public and inactive access denied',async()=>{
  await assertSucceeds(getDocs(query(collection(staff(),'archiveRequests'),where('requestedBy','==','staff'))))
  await assertFails(getDocs(collection(staff(),'archiveRequests')))
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'archiveRequests','r1')))
  await assertFails(getDocs(collection(env.authenticatedContext('imposter').firestore(),'customers')))
  await env.withSecurityRulesDisabled(ctx=>updateDoc(doc(ctx.firestore(),'teamMembers','staff'),{active:false}))
  await assertFails(setDoc(doc(staff(),'archiveRequests','new'),{...request,requestedAt:serverTimestamp()}))
})
test('unverified administrator cannot approve or archive',async()=>{
  const db=env.authenticatedContext('admin',{...adminClaims,email_verified:false}).firestore()
  await assertFails(updateDoc(doc(db,'customers','c1'),{...archive,updatedBy:'admin'}))
})
