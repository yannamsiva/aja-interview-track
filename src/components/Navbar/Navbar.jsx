// AJA_Interview_Track\aja-interview-track\src\components\Navbar\Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import styles from './Navbar.module.css';

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeHash, setActiveHash] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { path: '/', name: 'Home' },
    { path: '/#process', name: 'Process' },
    { path: '/#technologies', name: 'Technologies' },
    { path: '/#testimonials', name: 'Testimonials' },
    { path: '/about', name: 'About' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    if (path.startsWith('/#')) {
      const hash = path.substring(2);
      if (location.pathname === '/') {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveHash(path);
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${darkMode ? styles.dark : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.navContainer}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <img src="/images/logo-aja.png" alt="AJA Logo" className={styles.navLogo} />
            <span className={styles.logoText}>AJA Interview Prep</span>
          </Link>
        </div>

        <div className={styles.desktopNav}>
          <ul className={styles.navLinks}>
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  className={`${styles.navLink} ${
                    location.pathname === item.path.split('#')[0] && 
                    (item.path.includes('#') ? activeHash === item.path : true) 
                      ? styles.active 
                      : ''
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.name}
                  {(location.pathname === item.path.split('#')[0] && 
                    (item.path.includes('#') ? activeHash === item.path : true)) && (
                    <motion.div className={styles.underline} layoutId="underline" />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className={styles.controls}>
            <button 
              className={styles.themeToggle}
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <div className={styles.authButtons}>
              <button 
                className={styles.loginButton}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className={styles.registerButton}
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        </div>

        <button 
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className={styles.mobileMenu}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={styles.mobileMenuHeader}>
              <h3>Menu</h3>
              <button 
                className={styles.mobileMenuClose}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <ul className={styles.mobileNavLinks}>
              {navItems.map((item) => (
                <li key={item.name}>
                  <button
                    className={`${styles.mobileNavLink} ${
                      location.pathname === item.path.split('#')[0] && 
                      (item.path.includes('#') ? activeHash === item.path : true) 
                        ? styles.active 
                        : ''
                    }`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.mobileAuthButtons}>
              <button 
                className={styles.mobileLoginButton}
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Login
              </button>
              <button 
                className={styles.mobileRegisterButton}
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Register
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;