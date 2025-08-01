import axios from 'axios';

const baseURL = 'http://18.215.231.246:8080';

// Create a clean axios instance for authentication (without JWT token)
const authAxios = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response with token and role
 */
export const registerUser = async (userData) => {
  try {
    const response = await authAxios.post('/api/auth/register', null, {
      params: {
        fullName: userData.fullName,
        empId: userData.empId,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        technology: userData.technology || '',
        resourceType: userData.resourceType || ''
      }
    });
    
    // Handle the AuthResponse from backend
    const { token, role } = response.data;
    
    // Store the token in localStorage
    if (token) {
      localStorage.setItem('jwt_token', token);
    }
    
    // Store user role
    if (role) {
      setUserRole(role);
    }
    
    return { token, role, user: response.data };
  } catch (error) {
    if (error.response) {
      // Server responded with error
      throw {
        message: error.response.data || 'Registration failed',
        status: error.response.status
      };
    } else if (error.request) {
      // No response received
      throw {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Request setup error
      throw {
        message: 'An error occurred while setting up the request.',
        status: 0
      };
    }
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login response with token, role, and employee info
 */
export const loginUser = async (email, password) => {
  try {
    const response = await authAxios.post('/api/auth/login', null, {
      params: {
        email: email,
        password: password
      }
    });
    
    // Handle the complex response structure from backend
    const { token, role, user, employee, employeeId } = response.data;
    
    // Store the token in localStorage
    if (token) {
      localStorage.setItem('jwt_token', token);
    }
    
    // Store user role
    if (role) {
      setUserRole(role);
    }
    
    // Store employee ID if available
    if (employeeId) {
      setEmployeeId(employeeId);
    }
    
    return { token, role, user, employee, employeeId };
  } catch (error) {
    if (error.response) {
      // Server responded with error (e.g., "Invalid email or password")
      throw {
        message: error.response.data || 'Authentication failed',
        status: error.response.status
      };
    } else if (error.request) {
      // No response received
      throw {
        message: 'No response from server. Please check your connection.',
        status: 0
      };
    } else {
      // Request setup error
      throw {
        message: 'An error occurred while setting up the request.',
        status: 0
      };
    }
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('employeeId');
  localStorage.removeItem('userRole');
  window.location.href = '/login';
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('jwt_token');
  return !!token;
};

/**
 * Get current user token
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem('jwt_token');
};

/**
 * Get current user role
 * @returns {string|null} User role or null
 */
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

/**
 * Set user role in localStorage
 * @param {string} role - User role
 */
export const setUserRole = (role) => {
  localStorage.setItem('userRole', role);
};

/**
 * Get employee ID from localStorage
 * @returns {string|null} Employee ID or null
 */
export const getEmployeeId = () => {
  return localStorage.getItem('employeeId');
};

/**
 * Set employee ID in localStorage
 * @param {string} employeeId - Employee ID
 */
export const setEmployeeId = (employeeId) => {
  localStorage.setItem('employeeId', employeeId);
}; 