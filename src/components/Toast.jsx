// src/components/Toast.jsx
import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

// Wrap App with this in main.jsx, or use a simpler global approach:
let _showToast = null
export function setGlobalToast(fn) { _showToast = fn }
export function toast(message, type) { _showToast?.(message, type) }

export default function Toast() {
  const [toastData, setToastData] = useState(null)

  // Expose globally
  useState(() => {
    setGlobalToast((message, type = 'success') => {
      setToastData({ message, type })
      setTimeout(() => setToastData(null), 3000)
    })
  })

  if (!toastData) return null

  return (
    <div className={`toast ${toastData.type}`}>
      <span>{toastData.type === 'success' ? '✓' : '✕'}</span>
      {toastData.message}
    </div>
  )
}
