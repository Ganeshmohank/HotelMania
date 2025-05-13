import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      const rolePath = role === 'RestaurantManager' ? 'manager' : role.toLowerCase();
      navigate(`/${rolePath}`, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('userId', res.data.userId);

      const rolePath = res.data.role === 'RestaurantManager'
        ? 'manager'
        : res.data.role.toLowerCase();
      navigate(`/${rolePath}`, { replace: true });
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>HOTEL MANIA</h1>
        </div>
        
        <div style={styles.cardBody}>
          <div style={styles.welcomeSection}>
            <h2 style={styles.welcomeTitle}>Welcome Back</h2>
            <p style={styles.welcomeText}>Sign in to your account</p>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <input
              id="email"
              style={styles.input}
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.formGroup}>
            {/* <div style={styles.labelRow}>
              <label style={styles.label} htmlFor="password">Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div> */}
            <input
              id="password"
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button 
            style={isLoading ? {...styles.button, ...styles.buttonLoading} : styles.button}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div style={styles.footerSection}>
            <p style={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/register" style={styles.link}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #EBF4FF 0%, #E6FFFA 100%)'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    borderRadius: '12px',
    background: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  header: {
    background: '#2C7A7B',
    padding: '1rem',
    textAlign: 'center'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: '0.05em',
    margin: '0'
  },
  cardBody: {
    padding: '1.5rem'
  },
  welcomeSection: {
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  welcomeTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: '0.25rem'
  },
  welcomeText: {
    fontSize: '0.875rem',
    color: '#718096',
    margin: '0'
  },
  formGroup: {
    marginBottom: '1.25rem'
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
    background: 'white !important',
    color: 'black'
  },
  forgotLink: {
    fontSize: '0.75rem',
    color: '#2C7A7B',
    textDecoration: 'none',
    transition: 'color 0.2s ease'
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    background: '#2C7A7B',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '0.75rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  buttonLoading: {
    opacity: '0.7',
    cursor: 'not-allowed'
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    borderTop: '2px solid rgba(255, 255, 255, 0.2)',
    borderRight: '2px solid rgba(255, 255, 255, 0.2)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
    borderLeft: '2px solid white',
    animation: 'spin 1s linear infinite',
    marginRight: '0.5rem'
  },
  footerSection: {
    marginTop: '1.5rem',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '0.875rem',
    color: '#4A5568',
    margin: '0'
  },
  link: {
    color: '#2C7A7B',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
};

export default Login;