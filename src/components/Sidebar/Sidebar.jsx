import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome, FaChartLine, FaTruck, FaShoppingCart, FaInfoCircle,
  FaChevronLeft, FaChevronRight, FaSignInAlt, FaUserPlus, FaCog,
  FaSignOutAlt, FaMoon, FaSun, FaBook
} from "react-icons/fa";
import {
  FiHome, FiBarChart2, FiTruck, FiShoppingCart, FiInfo,
  FiLogIn, FiUserPlus, FiSettings, FiLogOut, FiBook
} from "react-icons/fi";
import styles from './Sidebar.module.css';

const Sidebar = ({ darkMode, toggleDarkMode, onToggle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');

  // Filter menu items based on role
  const menuItems = [
    // { path: "/", icon: <FiHome size={20} />, activeIcon: <FaHome size={20} />, label: "Home" },
    // ...(userRole === 'ROLE_EMPLOYEE' ? [
    //   { path: "/dashboard/employee", icon: <FiBarChart2 size={20} />, activeIcon: <FaChartLine size={20} />, label: "Employee" },
    // ] : []),
    ...(userRole === 'ROLE_DELIVERY' ? [
      { path: "/dashboard/delivery-team", icon: <FiHome size={20} />, activeIcon: <FaHome size={20} />, label: "Dashboard" },
    ] : []),
    ...(userRole === 'ROLE_SALES' ? [
      { path: "/dashboard/sales-team", icon: <FiShoppingCart size={20} />, activeIcon: <FaShoppingCart size={20} />, label: "Sales" },
    ] : []),
    ...(userRole === 'ROLE_EMPLOYEE' ? [
      { path: "/dashboard/employee", icon: <FiHome size={20} />, activeIcon: <FaHome size={20} />, label: "Dashboard" },
      { path: "/dashboard/employee/questions", icon: <FiBook size={20} />, activeIcon: <FaBook size={20} />, label: "Interview Questions" },
    ] : []),
    // { path: "/about", icon: <FiInfo size={20} />, activeIcon: <FaInfoCircle size={20} />, label: "About" },
    // { path: "/dashboard/admin", icon: <FiBarChart2 size={20} />, activeIcon: <FaChartLine size={20} />, label: "Admin" }
  ];

  const authItems = [
    { path: "/login", icon: <FiLogIn size={20} />, activeIcon: <FaSignInAlt size={20} />, label: "Login" },
    { path: "/register", icon: <FiUserPlus size={20} />, activeIcon: <FaUserPlus size={20} />, label: "Register" }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    // Remove any other user-related data if needed
    navigate('/login');
  };

  const bottomItems = [
    { path: "/settings", icon: <FiSettings size={20} />, activeIcon: <FaCog size={20} />, label: "Settings" },
    { action: handleLogout, icon: <FiLogOut size={20} />, activeIcon: <FaSignOutAlt size={20} />, label: "Logout" }
  ];

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  return (
    <motion.div 
      className={`${styles.sidebar} ${darkMode ? styles.dark : ''} ${isCollapsed ? styles.collapsed : ''}`}
      initial={{ width: 250 }}
      animate={{ width: isCollapsed ? 70 : 250 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className={styles.header}>
        {!isCollapsed && (
          <motion.div 
            className={styles.logo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            AJA Interview Prep
          </motion.div>
        )}
        <button
          className={styles.toggleButton}
          onClick={handleToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </div>

      <div className={styles.menuSection}>
        {!isCollapsed && <p className={styles.menuTitle}>Navigation</p>}
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <motion.li
              key={item.path}
              className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={item.path} className={styles.menuLink}>
                <span className={styles.menuIcon}>
                  {location.pathname === item.path ? item.activeIcon : item.icon}
                </span>
                {!isCollapsed && <span className={styles.menuLabel}>{item.label}</span>}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* <div className={styles.menuSection}>
        {!isCollapsed && <p className={styles.menuTitle}>Account</p>}
        <ul className={styles.menu}>
          {authItems.map((item) => (
            <motion.li
              key={item.path}
              className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={item.path} className={styles.menuLink}>
                <span className={styles.menuIcon}>
                  {location.pathname === item.path ? item.activeIcon : item.icon}
                </span>
                {!isCollapsed && <span className={styles.menuLabel}>{item.label}</span>}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div> */}

      <div className={styles.bottomMenu}>
        <ul className={styles.menu}>
          <motion.li
            className={styles.menuItem}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button onClick={toggleDarkMode} className={styles.menuLink}>
              <span className={styles.menuIcon}>
                {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </span>
              {!isCollapsed && (
                <span className={styles.menuLabel}>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </button>
          </motion.li>

          {bottomItems.map((item, index) => (
            <motion.li
              key={index}
              className={styles.menuItem}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.path ? (
                <Link to={item.path} className={styles.menuLink}>
                  <span className={styles.menuIcon}>
                    {location.pathname === item.path ? item.activeIcon : item.icon}
                  </span>
                  {!isCollapsed && <span className={styles.menuLabel}>{item.label}</span>}
                </Link>
              ) : (
                <button onClick={item.action} className={styles.menuLink}>
                  <span className={styles.menuIcon}>{item.icon}</span>
                  {!isCollapsed && <span className={styles.menuLabel}>{item.label}</span>}
                  </button>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default Sidebar;