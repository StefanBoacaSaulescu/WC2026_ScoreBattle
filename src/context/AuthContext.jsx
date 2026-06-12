// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ensure user document exists in Firestore
        const ref = doc(db, 'users', firebaseUser.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Player',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || null,
            createdAt: serverTimestamp(),
          })
        }
      }
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  async function registerWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      displayName,
      email,
      photoURL: null,
      createdAt: serverTimestamp(),
    })
    return cred
  }

  async function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    return signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGoogle, registerWithEmail, loginWithEmail, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
