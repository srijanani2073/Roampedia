import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Lock, User, Eye, EyeOff, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setMessage({ type: 'error', text: 'Please enter your full name.' });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return false;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        setMessage({ type: 'success', text: 'Login successful!' });
        setUser(data.user);
        setTimeout(() => onClose(), 1500);
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { 
              full_name: formData.name,
              name: formData.name // for compatibility
            }
          }
        });

        if (error) throw error;

        setMessage({ 
          type: 'success', 
          text: 'Account created! Please check your email to verify your account.' 
        });
        
        // If email confirmation is disabled, user will be automatically logged in
        if (data.user && !data.user.email_confirmed_at) {
          setTimeout(() => {
            setIsLogin(true);
            setMessage({ type: 'info', text: 'Please sign in with your new account.' });
          }, 2000);
        } else if (data.user) {
          setUser(data.user);
          setTimeout(() => onClose(), 1500);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
      setMessage({ type: 'info', text: 'Redirecting to Google...' });
    } catch (error) {
      console.error('Google login error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to connect with Google. Please try again.' 
      });
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setMessage({ type: '', text: '' });
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} disabled={isLoading}>
          <X size={24} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-logo">
            <Globe size={32} />
            <span>Roampedia</span>
          </div>
          <h2 className="auth-modal-title">
            {isLogin ? 'Welcome Back!' : 'Join Roampedia'}
          </h2>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`auth-message auth-message-${message.type}`}>
            {message.type === 'error' && <AlertCircle size={16} />}
            {message.type === 'success' && <CheckCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-input-group">
              <User className="auth-input-icon" size={20} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="auth-input"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="auth-input-group">
            <Mail className="auth-input-icon" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="auth-input"
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-input-group">
            <Lock className="auth-input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="auth-input"
              disabled={isLoading}
              required
            />
            <button 
              type="button" 
              className="auth-password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isLogin && (
            <div className="auth-input-group">
              <Lock className="auth-input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="auth-input"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-social-section">
          <div className="auth-divider"><span>or continue with</span></div>
          <div className="auth-social-buttons">
            <button 
              className="auth-social-btn" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
              Google
            </button>
          </div>
        </div>

        <div className="auth-switch-mode">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              type="button" 
              className="auth-link" 
              onClick={switchMode}
              disabled={isLoading}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;