import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail,
  MapPin, ShieldCheck, Sparkles, UserRound, Waves
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { authRequest } from '../../utils/authApi';

const features = [
  'AI-powered issue detection',
  'Real-time complaint tracking',
  'Transparent civic solutions'
];

const CityIllustration = () => (
  <svg
    className="auth-city-art"
    viewBox="0 0 720 410"
    role="img"
    aria-label="Illustration of a greener, connected city"
  >
    <defs>
      <linearGradient id="city-sky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#e4f5e9" />
        <stop offset="100%" stopColor="#b9e3ca" />
      </linearGradient>
      <linearGradient id="city-road" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#425d50" />
        <stop offset="100%" stopColor="#263e34" />
      </linearGradient>
    </defs>
    <rect width="720" height="410" rx="24" fill="url(#city-sky)" />
    <circle cx="590" cy="73" r="34" fill="#f8d98d" opacity=".9" />
    <path d="M0 246 Q160 218 318 247 T720 236 V410 H0Z" fill="#9acba4" />
    <path d="M0 282 Q168 253 331 281 T720 272 V410 H0Z" fill="#70ad80" />
    <g stroke="#fff" strokeOpacity=".35" strokeWidth="2">
      <path d="M29 180h87M29 197h87M29 214h87M535 157h83M535 174h83M535 191h83" />
    </g>
    <g>
      <rect x="52" y="113" width="93" height="151" rx="5" fill="#f7faf5" />
      <path d="M52 132h93v10H52z" fill="#65a77a" />
      <g fill="#a8d7b3">
        <rect x="66" y="155" width="14" height="20" rx="2" />
        <rect x="91" y="155" width="14" height="20" rx="2" />
        <rect x="117" y="155" width="14" height="20" rx="2" />
        <rect x="66" y="190" width="14" height="20" rx="2" />
        <rect x="91" y="190" width="14" height="20" rx="2" />
        <rect x="117" y="190" width="14" height="20" rx="2" />
      </g>
      <rect x="176" y="80" width="119" height="185" rx="5" fill="#f8fbf6" />
      <path d="M176 101h119v11H176z" fill="#498d65" />
      <g fill="#a8d7b3">
        <rect x="192" y="127" width="18" height="25" rx="2" />
        <rect x="225" y="127" width="18" height="25" rx="2" />
        <rect x="260" y="127" width="18" height="25" rx="2" />
        <rect x="192" y="169" width="18" height="25" rx="2" />
        <rect x="225" y="169" width="18" height="25" rx="2" />
        <rect x="260" y="169" width="18" height="25" rx="2" />
      </g>
      <rect x="319" y="143" width="84" height="122" rx="5" fill="#ecf5eb" />
      <path d="M319 160h84v9h-84z" fill="#76ad81" />
      <g fill="#a8d7b3">
        <rect x="332" y="182" width="15" height="20" rx="2" />
        <rect x="358" y="182" width="15" height="20" rx="2" />
        <rect x="384" y="182" width="7" height="20" rx="2" />
      </g>
      <rect x="438" y="105" width="105" height="160" rx="5" fill="#f9fbf5" />
      <path d="M438 124h105v10H438z" fill="#55976c" />
      <g fill="#a8d7b3">
        <rect x="452" y="148" width="16" height="23" rx="2" />
        <rect x="482" y="148" width="16" height="23" rx="2" />
        <rect x="512" y="148" width="16" height="23" rx="2" />
        <rect x="452" y="187" width="16" height="23" rx="2" />
        <rect x="482" y="187" width="16" height="23" rx="2" />
        <rect x="512" y="187" width="16" height="23" rx="2" />
      </g>
      <path d="M579 263V116" stroke="#456750" strokeWidth="5" />
      <path d="M561 118q18-39 36 0z" fill="#fff2c9" stroke="#b18f4f" strokeWidth="3" />
      <circle cx="579" cy="115" r="29" fill="#fff3ca" opacity=".25" />
    </g>
    <path d="M0 330 Q172 288 360 331 T720 318 V410 H0Z" fill="url(#city-road)" />
    <path d="M0 359 Q180 323 360 359 T720 344" fill="none" stroke="#d8e7bd" strokeWidth="4" strokeDasharray="20 17" />
    <g fill="#3e8055">
      <circle cx="46" cy="285" r="22" /><circle cx="46" cy="268" r="14" />
      <circle cx="627" cy="285" r="25" /><circle cx="627" cy="265" r="17" />
      <circle cx="673" cy="292" r="18" /><circle cx="673" cy="278" r="13" />
    </g>
    <g fill="#eff8ec">
      <rect x="43" y="282" width="5" height="18" rx="2" />
      <rect x="624" y="282" width="6" height="20" rx="2" />
      <rect x="671" y="289" width="5" height="15" rx="2" />
    </g>
    <g transform="translate(365 272)">
      <rect x="0" y="13" width="83" height="33" rx="10" fill="#f7fbf6" />
      <path d="M14 12 23 0h37l13 12z" fill="#2e7450" />
      <rect x="26" y="4" width="14" height="9" rx="2" fill="#d6eee0" />
      <rect x="44" y="4" width="14" height="9" rx="2" fill="#d6eee0" />
      <circle cx="20" cy="46" r="7" fill="#253c32" />
      <circle cx="64" cy="46" r="7" fill="#253c32" />
    </g>
    <g transform="translate(598 213)">
      <path d="M18 0c10 0 18 8 18 18 0 14-18 32-18 32S0 32 0 18C0 8 8 0 18 0z" fill="#287c51" />
      <circle cx="18" cy="18" r="6" fill="#e9f5ec" />
    </g>
  </svg>
);

const BrandMark = () => (
  <div className="flex items-center gap-3">
    <div className="auth-brand-mark" aria-hidden="true">
      <Eye className="h-6 w-6" strokeWidth={2.1} />
      <span />
    </div>
    <div>
      <div className="text-[17px] font-extrabold tracking-tight text-[#173e2c]">CivicEye <span className="text-[#36875b]">AI</span></div>
      <div className="text-[10px] font-semibold tracking-[.12em] text-[#71877a] uppercase">Better cities, together</div>
    </div>
  </div>
);

export const AuthPage = ({ blockedAccess = false, defaultAccountType = 'citizen' }) => {
  const { setActiveTab, setUser } = useApp();
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('resetToken') || '');
  const [mode, setMode] = useState(() => (
    new URLSearchParams(window.location.search).has('resetToken') ? 'reset-password' : 'login'
  ));
  const [accountType, setAccountType] = useState(defaultAccountType);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const isSignup = mode === 'signup';
  const isResetRequest = mode === 'reset';
  const isResetPassword = mode === 'reset-password';
  const isReset = isResetRequest || isResetPassword;

  useEffect(() => {
    if (resetToken) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [resetToken]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (isSignup || isResetPassword) {
      if (formData.get('password') !== formData.get('confirmPassword')) {
        setMessage({ type: 'error', text: 'Your passwords do not match. Please try again.' });
        return;
      }
    }

    setMessage(null);
    setIsSubmitting(true);
    try {
      if (isResetRequest) {
        const result = await authRequest('forgot-password', { email: formData.get('email') });
        setMessage({ type: 'success', text: result.message });
        return;
      }

      if (isResetPassword) {
        const result = await authRequest('reset-password', {
          token: resetToken,
          password: formData.get('password')
        });
        setMessage({ type: 'success', text: result.message });
        form.reset();
        setResetToken('');
        setMode('login');
        return;
      }

      const body = isSignup
        ? {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            mobile: formData.get('mobile'),
            password: formData.get('password'),
            accountType
          }
        : {
            email: formData.get('email'),
            password: formData.get('password'),
            remember: formData.get('remember') === 'on',
            accountType
          };
      const result = await authRequest(isSignup ? 'register' : 'login', body);
      setUser(result.user);
      setActiveTab(result.user.role === 'authority' ? 'authority-dashboard' : 'citizen-dashboard');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page min-h-screen">
      <section className="auth-visual-panel" aria-label="About CivicEye AI">
        <div className="auth-visual-inner">
          <BrandMark />
          <div className="auth-hero-copy">
            <div className="auth-eyebrow"><Sparkles className="h-3.5 w-3.5" /> INTELLIGENT CIVIC PLATFORM</div>
            <h1>Building Better<br /><span>Cities, Together.</span></h1>
            <p>Report civic issues. Track progress. Make your community better.</p>
          </div>
          <div className="auth-city-wrap">
            <CityIllustration />
            <div className="auth-city-badge"><span className="auth-live-dot" /> A clearer view of your city</div>
          </div>
          <ul className="auth-feature-list">
            {features.map((feature) => (
              <li key={feature}><span><Check className="h-3.5 w-3.5" /></span>{feature}</li>
            ))}
          </ul>
          <div className="auth-visual-footer"><MapPin className="h-3.5 w-3.5" /> Civic insight for every neighborhood</div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-mobile-brand"><BrandMark /></div>
        <div className="auth-form-content">
          <button className="auth-back-link" type="button" onClick={() => setActiveTab('landing')}>
            <ArrowLeft className="h-4 w-4" /> Back to CivicEye
          </button>

          <div className="auth-heading">
            <div className="auth-heading-icon"><Waves className="h-5 w-5" /></div>
            <h2>{isSignup ? 'Create your account' : isReset ? 'Reset your password' : 'Welcome Back'}</h2>
            <p>
              {isSignup
                ? 'Join your community and help make a difference.'
                : isResetPassword
                  ? 'Choose a new password for your account.'
                  : isResetRequest
                  ? 'Enter your email and we’ll help you get back in.'
                  : 'Sign in to your CivicEye account.'}
            </p>
          </div>

          {blockedAccess && (
            <div className="auth-message auth-message-warning" role="alert">
              Sign-in is required to access this dashboard. No account is currently authenticated.
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isReset && (
              <fieldset className="auth-role-field">
                <legend>Account type</legend>
                <div className="auth-role-options">
                  <label className={accountType === 'citizen' ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="accountType"
                      value="citizen"
                      checked={accountType === 'citizen'}
                      onChange={() => { setAccountType('citizen'); setMessage(null); }}
                    />
                    <UserRound className="h-4 w-4" /> Citizen
                  </label>
                  <label className={accountType === 'authority' ? 'selected authority-selected' : ''}>
                    <input
                      type="radio"
                      name="accountType"
                      value="authority"
                      checked={accountType === 'authority'}
                      onChange={() => { setAccountType('authority'); setMessage(null); }}
                    />
                    <ShieldCheck className="h-4 w-4" /> Municipal Authority
                  </label>
                </div>
                {accountType === 'authority' && (
                  <p className="auth-role-note">Authority accounts require municipal approval. Role selection alone never grants dashboard access.</p>
                )}
              </fieldset>
            )}

            {isSignup && (
              <label className="auth-field">
                <span>Full name</span>
                <div className="auth-input-wrap">
                  <UserRound className="auth-input-icon h-[18px] w-[18px]" />
                  <input name="fullName" type="text" autoComplete="name" placeholder="Your full name" required />
                </div>
              </label>
            )}

            {!isResetPassword && <label className="auth-field">
              <span>Email address</span>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon h-[18px] w-[18px]" />
                <input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
              </div>
            </label>}

            {isSignup && (
              <label className="auth-field">
                <span>Mobile number <span className="auth-optional">Optional</span></span>
                <div className="auth-input-wrap">
                  <input name="mobile" type="tel" autoComplete="tel" inputMode="tel" placeholder="Your mobile number" />
                </div>
              </label>
            )}

            {!isResetRequest && (
              <label className="auth-field">
                <span>Password</span>
                <div className="auth-input-wrap">
                  <LockKeyhole className="auth-input-icon h-[18px] w-[18px]" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    placeholder={isSignup || isResetPassword ? 'At least 8 characters' : 'Enter your password'}
                    minLength={8}
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </label>
            )}

            {(isSignup || isResetPassword) && (
              <label className="auth-field">
                <span>Confirm password</span>
                <div className="auth-input-wrap">
                  <LockKeyhole className="auth-input-icon h-[18px] w-[18px]" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    minLength={8}
                    required
                  />
                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </label>
            )}

            {mode === 'login' && (
              <div className="auth-form-options">
                <label className="auth-remember"><input type="checkbox" name="remember" /> <span>Remember me</span></label>
                <button className="auth-text-button" type="button" onClick={() => changeMode('reset')}>Forgot password?</button>
              </div>
            )}

            {isSignup && (
              <label className="auth-terms">
                <input type="checkbox" name="terms" required />
                <span>I agree to CivicEye’s Terms of Service and Privacy Policy.</span>
              </label>
            )}

            {message && (
              <div className={`auth-message ${message.type === 'success' ? 'auth-message-success' : message.type === 'setup' ? 'auth-message-warning' : 'auth-message-error'}`} role="alert" aria-live="polite">
                {message.text}
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Please wait…' : isSignup ? 'Create Account' : isResetPassword ? 'Reset Password' : isResetRequest ? 'Send recovery instructions' : 'Sign In'}</span>
              {!isReset && <ArrowRight className="h-[18px] w-[18px]" />}
            </button>
          </form>

          {mode === 'login' || isSignup ? (
            <p className="auth-switch">
              {isSignup ? 'Already have an account?' : 'Don’t have an account?'}
              {' '}
              <button type="button" onClick={() => changeMode(isSignup ? 'login' : 'signup')}>
                {isSignup ? 'Sign in' : 'Create one'}
              </button>
            </p>
          ) : (
            <p className="auth-switch"><button type="button" onClick={() => changeMode('login')}>Back to sign in</button></p>
          )}

          <div className="auth-security-note"><LockKeyhole className="h-3.5 w-3.5" /> Your password is never stored by this page.</div>
        </div>
        <footer className="auth-page-footer">© {new Date().getFullYear()} CivicEye AI <span>·</span> Thoughtful technology for thriving communities</footer>
      </section>
    </main>
  );
};
