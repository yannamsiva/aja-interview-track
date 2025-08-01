import { jwtDecode } from 'jwt-decode';

/**
 * Debug utility to check authentication status and token details
 */
export const debugAuthStatus = () => {
  const token = localStorage.getItem('jwt_token');
  const userRole = localStorage.getItem('userRole');
  
  console.log('=== Authentication Debug Info ===');
  console.log('Token exists:', !!token);
  console.log('User role from localStorage:', userRole);
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log('JWT Token decoded:', {
        email: decoded.sub || decoded.email,
        role: decoded.role,
        employeeId: decoded.employeeId,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiration',
        iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : 'No issued at'
      });
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        console.warn('⚠️ JWT token is expired!');
      } else {
        console.log('✅ JWT token is valid');
      }
    } catch (error) {
      console.error('❌ Failed to decode JWT token:', error.message);
    }
  } else {
    console.warn('⚠️ No JWT token found in localStorage');
  }
  
  console.log('=== End Debug Info ===');
};

/**
 * Check if user has required role for sales team operations
 */
export const checkSalesTeamPermission = () => {
  const token = localStorage.getItem('jwt_token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return { hasPermission: false, reason: 'No authentication token' };
  }
  
  let roleFromToken = null;
  try {
    const decoded = jwtDecode(token);
    roleFromToken = decoded.role;
  } catch (error) {
    return { hasPermission: false, reason: 'Invalid token format' };
  }
  
  const effectiveRole = userRole || roleFromToken;
  const hasPermission = effectiveRole === 'ROLE_SALES' || effectiveRole === 'ROLE_ADMIN';
  
  return {
    hasPermission,
    reason: hasPermission ? 'Valid role' : `Insufficient role: ${effectiveRole}`,
    effectiveRole,
    tokenRole: roleFromToken,
    localStorageRole: userRole
  };
}; 