import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, User, Phone, Lock } from 'lucide-react'

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

const Login = ({ onLogin, onBack }) => {
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({ name: '', phone: '', pin: '', confirmPin: '' })

  const set = (field) => (e) => {
    setError('')
    setForm(f => ({ ...f, [field]: e.target.value }))
  }

  const validatePhone = (p) => /^\d{10}$/.test(p)
  const validatePin = (p) => /^\d{4,6}$/.test(p)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    if (!validatePhone(form.phone)) return setError('Enter a valid 10-digit SA phone number')
    if (!validatePin(form.pin)) return setError('PIN must be 4–6 digits')
    onLogin?.({ phone: form.phone, name: form.name || form.phone })
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Please enter your name')
    if (!validatePhone(form.phone)) return setError('Enter a valid 10-digit SA phone number')
    if (!validatePin(form.pin)) return setError('PIN must be 4–6 digits')
    if (form.pin !== form.confirmPin) return setError('PINs do not match')
    // Demo: auto-login after register
    onLogin?.({ phone: form.phone, name: form.name })
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-dark-400 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/pulse-icon.svg" alt="PulseAI" className="w-8 h-8" />
            <span className="font-bold text-white text-xl tracking-tight">PulseAI</span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-dark-900 rounded-xl p-1 mb-8">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess('') }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  tab === t ? 'bg-white text-black' : 'text-dark-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form key="login" onSubmit={handleLogin} className="space-y-4" {...fadeUp}>
                <div>
                  <label className="block text-xs text-dark-400 mb-1.5 font-medium">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      className="input-field pl-10"
                      placeholder="0XX XXX XXXX"
                      value={form.phone}
                      onChange={set('phone')}
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-dark-400 mb-1.5 font-medium">PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      className="input-field pl-10 pr-10"
                      placeholder="4–6 digit PIN"
                      type={showPin ? 'text' : 'password'}
                      value={form.pin}
                      onChange={set('pin')}
                      inputMode="numeric"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
                    {error}
                  </motion.p>
                )}

                <button type="submit" className="btn-primary w-full mt-2 py-3.5 text-base">
                  Sign in
                </button>

                <p className="text-center text-sm text-dark-500 pt-2">
                  No account?{' '}
                  <button type="button" onClick={() => setTab('register')} className="text-white hover:underline">
                    Create one
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form key="register" onSubmit={handleRegister} className="space-y-4" {...fadeUp}>
                <div>
                  <label className="block text-xs text-dark-400 mb-1.5 font-medium">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      className="input-field pl-10"
                      placeholder="Your name"
                      value={form.name}
                      onChange={set('name')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-dark-400 mb-1.5 font-medium">Phone number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      className="input-field pl-10"
                      placeholder="0XX XXX XXXX"
                      value={form.phone}
                      onChange={set('phone')}
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-dark-400 mb-1.5 font-medium">Create PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      className="input-field pl-10 pr-10"
                      placeholder="4–6 digit PIN"
                      type={showPin ? 'text' : 'password'}
                      value={form.pin}
                      onChange={set('pin')}
                      inputMode="numeric"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(s => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-dark-400 mb-1.5 font-medium">Confirm PIN</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      className="input-field pl-10"
                      placeholder="Repeat PIN"
                      type={showPin ? 'text' : 'password'}
                      value={form.confirmPin}
                      onChange={set('confirmPin')}
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
                    {error}
                  </motion.p>
                )}

                <button type="submit" className="btn-primary w-full mt-2 py-3.5 text-base">
                  Create account
                </button>

                <p className="text-center text-sm text-dark-500 pt-2">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-white hover:underline">
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-xs text-dark-600 text-center mt-6">
            Demo only — no data is stored or transmitted
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
