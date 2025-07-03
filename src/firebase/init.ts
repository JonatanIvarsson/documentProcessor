import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Only for local use, will never publish or send data to the web
const firebaseConfig = {
  apiKey: 'demo-local',
  authDomain: 'demo-local',
  projectId: 'demo-local',
  storageBucket: 'demo-local',
  messagingSenderId: 'demo-local',
  appId: 'demo-local',
  measurementId: 'demo-local',
}

const firebaseApp = initializeApp(firebaseConfig)

const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}

export default firebaseApp
