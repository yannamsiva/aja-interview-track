// AJA_Interview_Track\aja-interview-track\src\pages\Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaLock, 
  FaSignInAlt, 
  FaArrowLeft,
  FaGoogle,
  FaGithub,
  FaLinkedin
} from 'react-icons/fa';
import { FiMail, FiKey } from 'react-icons/fi';
import styles from './Login.module.css';
import { loginUser } from '../API/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Use the updated loginUser function that returns complete user data
      const userData = await loginUser(formData.email.trim(), formData.password);
      
      // Use the AuthContext login function to properly set the user and employee data
      await login(userData);
      
      // Normalize role for routing (remove 'ROLE_' prefix and convert to lowercase)
      const normalizedRole = userData.role.replace('ROLE_', '').toLowerCase();
      
      // Redirect based on role
      switch(normalizedRole.toLowerCase()) {
        case 'employee':
          navigate('/dashboard/employee');
          break;
        case 'delivery':
          navigate('/dashboard/delivery-team');
          break;
        case 'sales':
          navigate('/dashboard/sales-team');
          break;
        default:
          navigate('/dashboard');
      }
      
    } catch (err) {
      // Display the error message from the backend
      setLoginError(err.message || 'Invalid email or password. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className={styles.loginContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.loginWrapper}>
        <motion.button 
          className={styles.backButton}
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft /> Back
        </motion.button>

        <motion.div 
          className={styles.loginCard}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.loginHeader}>
            <div className={styles.logo}>
              <span>AJA</span> Interview Prep
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to access your dashboard</p>
          </div>

          {loginError && (
            <motion.div 
              className={styles.errorMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loginError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <div className={`${styles.inputWrapper} ${errors.email ? styles.error : ''}`}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={`${styles.inputWrapper} ${errors.password ? styles.error : ''}`}>
                <FiKey className={styles.inputIcon} />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>

            <div className={styles.forgotPassword}>
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <motion.button
              type="submit"
              className={styles.loginButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.spinner}></span>
              ) : (
                <>
                  <FaSignInAlt /> Sign In
                </>
              )}
            </motion.button>
          </form>

          <div className={styles.socialLogin}>
            <p className={styles.divider}>Or sign in with</p>
            <div className={styles.socialButtons}>
              <button type="button" className={styles.socialButton}>
                <FaGoogle /> Google
              </button>
              <button type="button" className={styles.socialButton}>
                <FaGithub /> GitHub
              </button>
              <button type="button" className={styles.socialButton}>
                <FaLinkedin /> LinkedIn
              </button>
            </div>
          </div>

          <div className={styles.signupLink}>
            Don't have an account? <Link to="/register">Sign up</Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;