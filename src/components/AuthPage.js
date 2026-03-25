import React, { useState } from 'react';
import { Library, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AuthPage({ onSignInWithGoogle, onSignInWithEmail, onSignUpWithEmail }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        await onSignUpWithEmail(email, password);
        setMessage('Verifie tes emails pour confirmer ton compte !');
      } else {
        await onSignInWithEmail(email, password);
      }
    } catch (err) {
      const msg = err.message || 'Une erreur est survenue';
      if (msg.includes('Invalid login')) {
        setError('Email ou mot de passe incorrect.');
      } else if (msg.includes('already registered')) {
        setError('Cet email est deja utilise. Connecte-toi !');
      } else if (msg.includes('least 6')) {
        setError('Le mot de passe doit faire au moins 6 caracteres.');
      } else if (msg.includes('valid email')) {
        setError('Entre une adresse email valide.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await onSignInWithGoogle();
    } catch (err) {
      setError(err.message || 'Erreur de connexion Google');
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean to-accent shadow-2xl shadow-ocean/30 mb-4">
            <Library size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ocean-light to-accent-light bg-clip-text text-transparent">
            MyAnimeLog
          </h1>
          <p className="text-dark-300 text-sm mt-2">
            Ton tracker d'animes personnel
          </p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-600/30 rounded-2xl p-6 shadow-2xl shadow-black/30">
          <h2 className="text-lg font-bold text-dark-50 text-center mb-6">
            {isSignUp ? 'Creer un compte' : 'Se connecter'}
          </h2>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-dark-600/40" />
            <span className="text-xs text-dark-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-dark-600/40" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-ocean/50 focus:ring-1 focus:ring-ocean/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-11 py-3 bg-dark-700 border border-dark-600/50 rounded-xl text-sm text-white placeholder-dark-400 focus:outline-none focus:border-ocean/50 focus:ring-1 focus:ring-ocean/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-neon-red/10 border border-neon-red/20 text-neon-red text-xs">
                {error}
              </div>
            )}

            {message && (
              <div className="px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-ocean to-accent text-white hover:opacity-90 transition-opacity shadow-lg shadow-ocean/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                isSignUp ? 'Creer mon compte' : 'Se connecter'
              )}
            </button>
          </form>

          {/* Toggle sign up / sign in */}
          <p className="text-center text-xs text-dark-400 mt-5">
            {isSignUp ? 'Deja un compte ?' : 'Pas encore de compte ?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
              }}
              className="text-ocean-light hover:text-ocean font-medium transition-colors"
            >
              {isSignUp ? 'Se connecter' : 'Creer un compte'}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-dark-500 mt-6">
          Tes donnees sont stockees de maniere securisee sur Supabase
        </p>
      </div>
    </div>
  );
}
