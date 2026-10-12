import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
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
export default app
