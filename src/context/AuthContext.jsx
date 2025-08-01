import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isAuthenticated, 
  getToken, 
  getUserRole, 
  getEmployeeId, 
  setEmployeeId, 
  setUserRole,
  logoutUser 
} from '../API/auth';
import { getEmployeeDetails } from '../API/employee';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isAuthenticated()) {
          const token = getToken();
          const role = getUserRole();

          if (token && role) {
            setUser({ token, role });
            
            // Try to extract employee ID and role from JWT token first
            let empId = null;
            let userRole = null;
            try {
              const decodedToken = jwtDecode(token);
              empId = decodedToken.employeeId || getEmployeeId();
              userRole = decodedToken.role || getUserRole();
              // Update localStorage with role from token if available
              if (userRole && userRole !== getUserRole()) {
                setUserRole(userRole);
              }
            } catch (error) {
              console.warn('Could not decode JWT token:', error.message);
              empId = getEmployeeId();
              userRole = getUserRole();
            }
            
            // If we have an employee ID, fetch employee details
            if (empId) {
              try {
                const employeeData = await getEmployeeDetails(empId);
                setEmployee(employeeData);
                setEmployeeId(empId); // Ensure it's stored in localStorage
              } catch (error) {
                console.warn('Could not fetch employee details:', error.message);
                // Clear invalid employee ID
                setEmployeeId(null);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logoutUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (userData) => {
    try {
      setUser(userData);
      setUserRole(userData.role);
      
      // If this is an employee and we have employee data, set it
      if (userData.role === 'ROLE_EMPLOYEE' && userData.employee) {
        setEmployee(userData.employee);
        if (userData.employeeId) {
          setEmployeeId(userData.employeeId);
        }
      } else if (userData.role === 'ROLE_EMPLOYEE' && userData.employeeId) {
        // If we have employee ID but no employee data, fetch it
        setEmployeeId(userData.employeeId);
        const employeeData = await getEmployeeDetails(userData.employeeId);
        setEmployee(employeeData);
      } else if (userData.role === 'ROLE_EMPLOYEE') {
        console.warn('Employee login but no employee data or ID provided');
      }
      
      // Also try to extract role from JWT token for consistency
      try {
        const decodedToken = jwtDecode(userData.token);
        if (decodedToken.role && decodedToken.role !== userData.role) {
          console.warn('Role mismatch between response and token:', userData.role, 'vs', decodedToken.role);
          // Prefer the role from the response as it's more reliable
        }
      } catch (error) {
        console.warn('Could not decode JWT token during login:', error.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setEmployee(null);
    logoutUser();
  };

  const updateEmployeeData = async (employeeId) => {
    try {
      const employeeData = await getEmployeeDetails(employeeId);
      setEmployee(employeeData);
      setEmployeeId(employeeId);
      return employeeData;
    } catch (error) {
      console.error('Error updating employee data:', error);
      throw error;
    }
  };

  const value = {
    user,
    employee,
    loading,
    login,
    logout,
    updateEmployeeData,
    isAuthenticated: !!user,
    getEmployeeId: () => employee?.id || getEmployeeId()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 