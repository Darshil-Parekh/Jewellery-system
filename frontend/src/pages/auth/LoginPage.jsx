import { useState } from 'react'
import { Eye, EyeOff, Gem, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { getErrorMessage } from '../../services/api'

const currentYear = new Date().getFullYear()

export function LoginPage() {
  const { login, sessionError } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email: email.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (loginError) {
      setError(getErrorMessage(loginError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-aside" aria-label="Maison Ledger">
        <div className="login-brand">
          <span className="login-brand-mark"><Gem size={20} strokeWidth={1.5} /></span>
          <span>MAISON <strong>LEDGER</strong></span>
        </div>
        <div className="login-editorial">
          <span className="eyebrow">A MORE CONSIDERED WAY TO WORK</span>
          <h1>Every piece.<br /><em>Precisely</em> accounted for.</h1>
          <p>A quieter kind of clarity for the craft, care and detail behind every piece in your collection.</p>
        </div>
        <div className="jewel-art" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="jewel-glow" />
          <Gem className="jewel-gem" strokeWidth={0.8} />
          <span className="jewel-spark jewel-spark-one">✳</span>
          <span className="jewel-spark jewel-spark-two">✧</span>
        </div>
        <div className="login-aside-footer">
          <span>INDEPENDENT BY DESIGN</span>
          <span className="footer-rule" />
          <span>MADE FOR THE DETAILS</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-mobile-brand"><Gem size={20} /> <span>MAISON <b>LEDGER</b></span></div>
        <div className="login-card">
          <span className="login-step">YOUR PRIVATE WORKSPACE</span>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to continue to your inventory.</p>

          {(error || sessionError) && (
            <div className="login-error" role="alert">{error || sessionError}</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="email">Email address</label>
            <div className="form-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                autoComplete="email"
                id="email"
                name="email"
                type="email"
                placeholder="you@yourstore.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={254}
              />
            </div>

            <div className="password-label-row">
              <label className="form-label" htmlFor="password">Password</label>
            </div>
            <div className="form-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                autoComplete="current-password"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                maxLength={128}
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button className="login-submit" type="submit" disabled={submitting}>
              {submitting ? <><span className="button-spinner" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <div className="login-security">
            <ShieldCheck size={16} />
            <span>Your account is private and protected.</span>
          </div>
          <p className="admin-setup-note">
            First time here? Ask your administrator to complete the one-time setup in the project README.
          </p>
        </div>
        <div className="login-panel-footer">
          <span>© {currentYear} Maison Ledger</span>
          <span>Private workspace</span>
        </div>
      </section>
    </main>
  )
}
