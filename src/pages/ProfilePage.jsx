// src/pages/ProfilePage.jsx
import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'

// Resize/compress an image file to a square JPEG data URL so it stays small
// enough to live inside the Firestore user document.
function fileToResizedDataURL(file, size = 256, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const sx = (img.width - side) / 2
      const sy = (img.height - side) / 2
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function ProfilePage() {
  const { user, profile, updateUserProfile } = useAuth()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [displayName, setDisplayName] = useState(profile?.displayName || user?.displayName || '')
  const [saving, setSaving] = useState(false)

  const currentPhoto = preview || profile?.photoURL || user?.photoURL || null
  const initials = (profile?.displayName || user?.displayName || user?.email || '?')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file', 'error')
      return
    }
    try {
      const dataUrl = await fileToResizedDataURL(file)
      setPreview(dataUrl)
    } catch {
      toast('Could not read that image', 'error')
    } finally {
      e.target.value = '' // allow re-selecting the same file
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const fields = {}
      if (preview) fields.photoURL = preview
      const trimmed = displayName.trim()
      if (trimmed && trimmed !== profile?.displayName) fields.displayName = trimmed

      if (Object.keys(fields).length === 0) {
        toast('Nothing to update', 'error')
        return
      }
      await updateUserProfile(fields)
      setPreview(null)
      toast('Profile updated')
    } catch (err) {
      console.error('Failed to update profile:', err)
      toast('Failed to save profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemovePhoto() {
    setSaving(true)
    try {
      await updateUserProfile({ photoURL: null })
      setPreview(null)
      toast('Photo removed')
    } catch {
      toast('Failed to remove photo', 'error')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = preview || (displayName.trim() && displayName.trim() !== profile?.displayName)

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">MY PROFILE</h1>
        <p className="page-subtitle">Customize how you appear on the leaderboard</p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
        {/* Avatar */}
        <div className="profile-avatar">
          {currentPhoto
            ? <img src={currentPhoto} alt={displayName || 'avatar'} referrerPolicy="no-referrer" />
            : <span>{initials}</span>
          }
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} disabled={saving}>
            {currentPhoto ? 'Change photo' : 'Add photo'}
          </button>
          {(profile?.photoURL || user?.photoURL) && (
            <button className="btn btn-danger" onClick={handleRemovePhoto} disabled={saving}>
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />

        {/* Display name */}
        <div className="form-field" style={{ width: '100%', maxWidth: 360 }}>
          <label className="form-label" htmlFor="displayName">Display name</label>
          <input
            id="displayName"
            className="form-input"
            type="text"
            value={displayName}
            maxLength={40}
            placeholder="Your name"
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="form-field" style={{ width: '100%', maxWidth: 360 }}>
          <label className="form-label">Email</label>
          <input className="form-input" type="text" value={user?.email || ''} disabled />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          style={{ width: '100%', maxWidth: 360 }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </main>
  )
}
