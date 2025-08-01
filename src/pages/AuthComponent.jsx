import React, { useState } from 'react';
import styles from './AuthComponent.module.css';

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuth = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className={styles.authWrapper}>
      <div 
        className={`${styles.formSide} ${isLogin ? '' : styles.active}`} 
        id="registerSide"
      >
        <h2>Register</h2>
        <form>
          <input type="text" placeholder="Username" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Register</button>
        </form>
      </div>
      <div 
        className={`${styles.formSide} ${isLogin ? styles.active : ''}`} 
        id="loginSide"
      >
        <h2>Login</h2>
        <form>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
      <div 
        className={`${styles.overlay} ${isLogin ? '' : styles.left}`} 
        id="mainOverlay"
      >
        <button 
          className={styles.overlayBtn} 
          id="loginBtn" 
          style={{ marginLeft: '10vw', display: isLogin ? 'block' : 'none' }}
          onClick={toggleAuth}
        >
          Login
        </button>
        <span style={{ flex: 1 }}></span>
        <button 
          className={styles.overlayBtn} 
          id="registerBtn" 
          style={{ 
            marginRight: '10vw', 
            display: isLogin ? 'none' : 'block',
            transform: 'rotate(180deg)' 
          }}
          onClick={toggleAuth}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default AuthComponent;