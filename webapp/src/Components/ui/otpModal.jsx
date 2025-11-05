import React, { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog'
import { requestOtp } from '../../Utils/userUtil'

export default function OTPModal({ open, onOpenChange, email, onVerify, expire = 0 }) {
  const [code, setCode] = useState(new Array(6).fill(''))
  const [error, setError] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [loading, setLoading] = useState(false)
  const [expireAt, setExpireAt] = useState(null) // timestamp in ms from server
  const inputsRef = useRef([])
  const intervalRef = useRef(null)

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return
    const next = [...code]
    next[index] = value
    setCode(next)
    if (value !== '' && index < 5) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const submit = async () => {
    const value = code.join('')
    if (value.length !== 6) {
      setError('Vui lòng nhập mã gồm 6 chữ số')
      return
    }
    setError('')
    try {
      if (onVerify) await onVerify(value); 
      onOpenChange(false)
    } catch (err) {
      console.error('OTP verify error', err)
      setError(err?.message || 'Xác thực thất bại. Vui lòng thử lại.')
    }
  }

  const resend = async () => {
    try {
      if (remaining > 0) return
      setLoading(true)
      const res = await requestOtp(email)
      const expiresAt = res?.data?.requestOtp?.expiresAt || res?.requestOtp?.expiresAt
      if (expiresAt) {
        setExpireAt(Number(expiresAt))
      } else if (expire && typeof expire === 'number' && expire > 0) {
        setExpireAt(Date.now() + expire * 1000)
      }
    } catch (err) {
      console.error('resend error', err)
    }
    finally {
      setLoading(false)
    }
  }

  const formatTime = (s) => {
    const mm = Math.floor(s / 60)
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  useEffect(() => {
    let mounted = true
    if (open && remaining <= 0) {
      setLoading(true)
      requestOtp(email)
        .then((res) => {
          if (!mounted) return
          const expiresAt = res?.data?.requestOtp?.expiresAt || res?.requestOtp?.expiresAt
          if (expiresAt) {
            setExpireAt(Number(expiresAt))
          } else if (expire && typeof expire === 'number' && expire > 0) {
            setExpireAt(Date.now() + expire * 1000)
          }
        })
        .catch((err) => {
          if (!mounted) return
          console.error('requestOtp error', err)
          setError(err?.message || 'Không thể gửi mã')
        })
        .finally(() => {
          if (!mounted) return
          setLoading(false)
        })
    }
    return () => {
      mounted = false
    }
  }, [open, email])

  useEffect(() => {
    if (!expireAt) {
      setRemaining(0)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const tick = () => {
      const diff = Math.max(0, Math.ceil((expireAt - Date.now()) / 1000))
      setRemaining(diff)
      if (diff <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    tick()
    if (!intervalRef.current) intervalRef.current = setInterval(tick, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [expireAt])


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-white text-black">
        <DialogHeader>
          <DialogTitle>Nhập mã OTP</DialogTitle>
          <DialogDescription>Vui lòng nhập mã 6 chữ số được gửi tới email <strong>{email}</strong></DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex justify-center gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={c}
              onChange={(e) => handleChange(i, e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength={1}
              className="w-12 h-12 text-center border rounded-md text-lg"
              inputMode="numeric"
            />
          ))}
        </div>

        {error && <div className="text-sm text-red-600 mt-3">{error}</div>}

        <DialogFooter className="mt-6">
          <div className="flex items-center justify-between w-full">
            {remaining > 0 ? (
              <div className="text-sm text-gray-600">{formatTime(remaining)}</div>
            ) : (
              <button
                type="button"
                onClick={resend}
                disabled={loading}
                className={`text-sm ${loading ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:underline'}`}>
                {loading ? 'Đang gửi...' : 'Gửi lại mã'}
              </button>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => onOpenChange(false)} className="px-3 py-1 rounded border">Hủy</button>
              <button type="button" onClick={submit} className="px-4 py-1 rounded bg-black text-white">Xác nhận</button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
