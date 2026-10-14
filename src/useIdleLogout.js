import {useEffect} from 'react'
import {signOut} from 'firebase/auth'
import {auth} from './firebase'

export const IDLE_TIMEOUT_MS=6*60*60*1000

export function remainingIdleTime(lastActivity,now=Date.now()){
  return Math.max(0,IDLE_TIMEOUT_MS-(now-lastActivity))
}

export default function useIdleLogout(user){
  useEffect(()=>{
    if(!user)return
    const key='akshaya-last-activity-'+user.uid
    let last=Number(localStorage.getItem(key))
    if(!Number.isFinite(last)||last<=0||last>Date.now()){last=Date.now();localStorage.setItem(key,String(last))}
    let timer
    let signingOut=false
    const check=()=>{
      if(signingOut)return false
      const shared=Number(localStorage.getItem(key))
      if(Number.isFinite(shared)&&shared>0)last=shared
      const remaining=remainingIdleTime(last)
      clearTimeout(timer)
      if(remaining===0){
        signingOut=true
        signOut(auth).catch(()=>{signingOut=false;timer=setTimeout(check,30000)})
        return false
      }
      timer=setTimeout(check,remaining)
      return true
    }
    const activity=event=>{
      // Check expiry before accepting activity after a sleeping tab resumes.
      if(!check()||!event.isTrusted||document.visibilityState!=='visible'||!location.pathname.startsWith('/app'))return
      const now=Date.now()
      if(now-last<15000)return
      last=now;localStorage.setItem(key,String(last));check()
    }
    const storage=event=>{if(event.key===key)check()}
    const events=['pointerdown','pointermove','keydown','touchstart','scroll']
    events.forEach(name=>window.addEventListener(name,activity,{passive:true,capture:true}))
    window.addEventListener('storage',storage)
    window.addEventListener('focus',check)
    document.addEventListener('visibilitychange',check)
    const heartbeat=setInterval(check,30000)
    check()
    return()=>{
      clearTimeout(timer);clearInterval(heartbeat)
      events.forEach(name=>window.removeEventListener(name,activity,true))
      window.removeEventListener('storage',storage)
      window.removeEventListener('focus',check)
      document.removeEventListener('visibilitychange',check)
    }
  },[user])
}
