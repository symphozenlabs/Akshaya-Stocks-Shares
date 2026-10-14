import {cert,getApps,initializeApp} from 'firebase-admin/app'
import {getAuth} from 'firebase-admin/auth'
import {getFirestore} from 'firebase-admin/firestore'

const PROJECT_ID='akshayass-crm'
const ADMIN_EMAIL='akshayastocksshares@gmail.com'

function services(){
  const existing=getApps().find(app=>app.name==='team-management')
  const config=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON||'null')
  if(!existing&&(!config||config.project_id!==PROJECT_ID))throw new Error('Server configuration unavailable')
  const app=existing||initializeApp({credential:cert(config),projectId:PROJECT_ID},'team-management')
  return {auth:getAuth(app),db:getFirestore(app)}
}

export function createTeamPasswordHandler(getServices=services){
  return async function handler(req,res){
    res.setHeader('Cache-Control','no-store')
    res.setHeader('X-Content-Type-Options','nosniff')
    const origin=req.headers.origin
    if(origin){
      try{if(new URL(origin).host!==req.headers.host&&!['https://akshayass-crm.web.app','https://akshayass-crm.firebaseapp.com'].includes(origin))return res.status(403).json({error:'Request not allowed.'})}
      catch{return res.status(403).json({error:'Request not allowed.'})}
      res.setHeader('Access-Control-Allow-Origin',origin)
      res.setHeader('Vary','Origin')
      res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type')
      res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS')
    }
    if(req.method==='OPTIONS')return res.status(204).end()
    if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed.'})}
    const authorization=req.headers.authorization||''
    if(!authorization.startsWith('Bearer '))return res.status(401).json({error:'Please sign in again.'})
    let auth,db,identity
    try{
      ;({auth,db}=getServices())
      identity=await auth.verifyIdToken(authorization.slice(7),true)
    }catch{return res.status(401).json({error:'Your session could not be verified. Please sign in again.'})}
    if(identity.email!==ADMIN_EMAIL||identity.email_verified!==true)return res.status(403).json({error:'Only the administrator can change team passwords.'})
    const {uid,password}=req.body||{}
    if(typeof uid!=='string'||!uid||uid.length>128||uid.includes('/')||typeof password!=='string'||password.length<8||password.length>128)return res.status(400).json({error:'Choose a password between 8 and 128 characters.'})
    if(uid===identity.uid)return res.status(400).json({error:'Use account settings to change your own password.'})
    try{
      const profile=await db.collection('teamMembers').doc(uid).get()
      if(!profile.exists||profile.data().role!=='staff')return res.status(404).json({error:'Team member not found.'})
      const member=await auth.getUser(uid)
      if(member.email!==profile.data().authEmail||!member.email?.endsWith('@team.akshaya-ss.app'))return res.status(403).json({error:'This account is not an authorised team member.'})
      await auth.updateUser(uid,{password})
      return res.status(200).json({message:'Team member password changed successfully.'})
    }catch{return res.status(500).json({error:'The password could not be changed. Please try again.'})}
  }
}

export default createTeamPasswordHandler()
