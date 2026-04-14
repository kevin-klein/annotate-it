import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { authService } from '../services/auth';

const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [location, setLocation] = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.requestLoginCode(email);
      setCodeSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send login code');
    } finally {
      setLoading(false);
    }
  };

  if (codeSent) {
    return (
      <div className="auth-page">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2 className="login-form-title">Check Your Email</h2>
          </div>
          {error && <div className="login-form-error">{error}</div>}
          <p className="login-form-message">
            We've sent a 6-digit login code to <strong>{email}</strong>.
            Please enter it below to verify.
          </p>
          <VerifyLoginCode email={email} onVerifySuccess={onLoginSuccess} onCancel={() => setCodeSent(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="login-form-container">
        <div className="login-form-header">
          <h2 className="login-form-title">Login</h2>
        </div>
        {error && <div className="login-form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="email" className="login-form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-form-input"
              placeholder="your@email.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="login-form-button"
          >
            {loading ? 'Sending code...' : 'Send Login Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Component to verify login code
const VerifyLoginCode = ({ email, onVerifySuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.verifyLoginCode(email, code);
      onVerifySuccess?.();
      setLocation('/projects');
    } catch (err) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <div className="login-form-group">
        <label htmlFor="code" className="login-form-label">
          Login Code
        </label>
        <input
          type="text"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="login-form-input"
          placeholder="123456"
          required
        />
      </div>
      {error && <div className="login-form-error">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="login-form-button"
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="login-form-button secondary"
      >
        Back to Email
      </button>
    </form>
  );
};

export default LoginForm;
