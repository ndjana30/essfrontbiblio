import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function App() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear alerts on input change
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Invalid username or password');
      }

      const data = await response.json();

      // Expecting { token: "..." } or { jwt: "..." } or similar
      const token = data.token;

      if (token) {
        // Store JWT token locally
        localStorage.setItem('jwt_token', token);
        setSuccess('Authentication successful! Welcome back.');
        setFormData({ username: '', password: '' });
        navigate('/transaction-form');
      } else {
        setSuccess('Login successful!');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Embedded CSS Styles */}
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%);
          padding: 20px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          color: #fff;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h2 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          background: linear-gradient(to right, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #cbd5e1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: all 0.25s ease;
        }

        .form-group input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
          background: rgba(15, 23, 42, 0.8);
        }

        .form-group input::placeholder {
          color: #64748b;
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          margin-top: 10px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
          line-height: 1.4;
          word-break: break-word;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .alert-success {
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #86efac;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to log in</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}