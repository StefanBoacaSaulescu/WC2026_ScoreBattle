// src/hooks/usePredictions.js
import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

// prediction doc id = uid_matchId
function predictionId(uid, matchId) {
  return `${uid}_${matchId}`
}

export function usePredictions() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState({}) // { matchId: { homeScore, awayScore } }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPredictions({})
      setLoading(false)
      return
    }
    async function fetchPredictions() {
      setLoading(true)
      const q = query(collection(db, 'predictions'), where('uid', '==', user.uid))
      const snap = await getDocs(q)
      const map = {}
      snap.forEach((d) => {
        const data = d.data()
        map[data.matchId] = { homeScore: data.homeScore, awayScore: data.awayScore }
      })
      setPredictions(map)
      setLoading(false)
    }
    fetchPredictions()
  }, [user])

  async function savePrediction(matchId, homeScore, awayScore) {
    if (!user) return
    const id = predictionId(user.uid, matchId)
    await setDoc(doc(db, 'predictions', id), {
      uid: user.uid,
      matchId,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      updatedAt: serverTimestamp(),
    })
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { homeScore: Number(homeScore), awayScore: Number(awayScore) },
    }))
  }

  return { predictions, loading, savePrediction }
}

// Fetch ALL predictions for leaderboard calculation
export async function getAllPredictions() {
  const snap = await getDocs(collection(db, 'predictions'))
  const map = {} // { uid: { matchId: { homeScore, awayScore } } }
  snap.forEach((d) => {
    const data = d.data()
    if (!map[data.uid]) map[data.uid] = {}
    map[data.uid][data.matchId] = { homeScore: data.homeScore, awayScore: data.awayScore }
  })
  return map
}

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'))
  const users = {}
  snap.forEach((d) => {
    users[d.id] = d.data()
  })
  return users
}
