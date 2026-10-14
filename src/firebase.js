import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  projectId: 'akshayass-crm',
  appId: '1:61093418526:web:45e963ceb445567789c00f',
  storageBucket: 'akshayass-crm.firebasestorage.app',
  apiKey: 'AIzaSyC8XWtRJBoOzOLp6eA_hju3FXJcmTFV4Sw',
  authDomain: 'akshayass-crm.firebaseapp.com',
  messagingSenderId: '61093418526',
  measurementId: 'G-1QNP84DZ2N',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export function getTeamCreatorAuth() {
  const name = 'akshaya-team-user-creator'
  const secondaryApp = getApps().some((candidate) => candidate.name === name) ? getApp(name) : initializeApp(firebaseConfig, name)
  return getAuth(secondaryApp)
}
export default app
