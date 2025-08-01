// AJA_Interview_Track\aja-interview-track\src\components\Footer\Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaLinkedin, 
  FaTwitter, 
  FaGithub, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.footer 
      className={`${styles.footer} ${darkMode ? styles.dark : ''}`}
      initial="hidden"
      animate="visible"
      variants={footerVariants}
    >
      <div className={styles.footerContainer}>
        {/* Company Info */}
        <motion.div 
          className={styles.footerSection}
          variants={footerVariants}
          transition={{ delay: 0.1 }}
        >
          <h3 className={styles.footerHeading}>AJA Interview Prep</h3>
          <p className={styles.footerText}>
            Empowering professionals with comprehensive interview preparation and career advancement solutions.
          </p>
          <div className={styles.socialLinks}>
            <motion.a 
              href="https://linkedin.com/company/aja" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
            >
              <FaLinkedin className={styles.socialIcon} />
            </motion.a>
            <motion.a 
              href="https://twitter.com/aja" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
            >
              <FaTwitter className={styles.socialIcon} />
            </motion.a>
            <motion.a 
              href="https://github.com/aja" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
            >
              <FaGithub className={styles.socialIcon} />
            </motion.a>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          className={styles.footerSection}
          variants={footerVariants}
          transition={{ delay: 0.2 }}
        >
          <h3 className={styles.footerHeading}>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <motion.li whileHover={{ x: 5 }}>
              <Link to="/" className={styles.footerLink}>Home</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link to="/about" className={styles.footerLink}>About Us</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link to="/dashboard/employee" className={styles.footerLink}>Employee Dashboard</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link to="/dashboard/delivery-team" className={styles.footerLink}>Delivery Team</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link to="/dashboard/sales-team" className={styles.footerLink}>Sales Team</Link>
            </motion.li>
            <motion.li whileHover={{ x: 5 }}>
              <Link to="/training" className={styles.footerLink}>Training Programs</Link>
            </motion.li>
          </ul>
        </motion.div>

        {/* Technology Specializations */}
        <motion.div 
          className={styles.footerSection}
          variants={footerVariants}
          transition={{ delay: 0.3 }}
        >
          <h3 className={styles.footerHeading}>Technologies</h3>
          <ul className={styles.techList}>
            <motion.li whileHover={{ x: 5 }}>Java</motion.li>
            <motion.li whileHover={{ x: 5 }}>Python</motion.li>
            <motion.li whileHover={{ x: 5 }}>.NET</motion.li>
            <motion.li whileHover={{ x: 5 }}>DevOps</motion.li>
            <motion.li whileHover={{ x: 5 }}>SalesForce</motion.li>
            <motion.li whileHover={{ x: 5 }}>UI Development</motion.li>
            <motion.li whileHover={{ x: 5 }}>Testing</motion.li>
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          className={styles.footerSection}
          variants={footerVariants}
          transition={{ delay: 0.4 }}
        >
          <h3 className={styles.footerHeading}>Contact Us</h3>
          <div className={styles.contactInfo}>
            <motion.div 
              className={styles.contactItem}
              whileHover={{ x: 5 }}
            >
              <FaMapMarkerAlt className={styles.contactIcon} />
              <span>123 Tech Park, Hyderabad, Telangana 500081</span>
            </motion.div>
            <motion.div 
              className={styles.contactItem}
              whileHover={{ x: 5 }}
            >
              <FaEnvelope className={styles.contactIcon} />
              <a href="mailto:info@ajacs.in">info@ajacs.in</a>
            </motion.div>
            <motion.div 
              className={styles.contactItem}
              whileHover={{ x: 5 }}
            >
              <FaPhone className={styles.contactIcon} />
              <a href="tel:+919876543210">+91 98765 43210</a>
            </motion.div>
            <motion.div 
              className={styles.contactItem}
              whileHover={{ x: 5 }}
            >
              <FaClock className={styles.contactIcon} />
              <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Copyright */}
      <motion.div 
        className={styles.copyright}
        variants={footerVariants}
        transition={{ delay: 0.5 }}
      >
        <p>&copy; {currentYear} AJA Consulting Services. All Rights Reserved.</p>
        <div className={styles.legalLinks}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/privacy-policy" className={styles.legalLink}>Privacy Policy</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/terms-of-service" className={styles.legalLink}>Terms of Service</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/cookie-policy" className={styles.legalLink}>Cookie Policy</Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;