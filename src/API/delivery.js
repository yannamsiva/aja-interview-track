// delivery.js
// API service functions for interacting with the delivery backend APIs

import axiosInstance from './axiosConfig';

// Base URL for API endpoints
const API_BASE_URL = '/api/delivery';

// Debug function to check current user's role and token
export const debugUserInfo = () => {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('userRole');
    
    console.log('=== DEBUG USER INFO ===');
    console.log('Token exists:', !!token);
    console.log('Role from localStorage:', role);
    
    if (token) {
        try {
            // Decode JWT token to see what's inside
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('JWT Token payload:', payload);
            console.log('Role from JWT:', payload.role);
        } catch (error) {
            console.error('Error decoding JWT token:', error);
        }
    }
    
    return { token: !!token, role, hasToken: !!token };
};

// Get current user information
export const getCurrentUser = async () => {
    try {
        console.debug('Fetching current user information');
        const response = await axiosInstance.get(`${API_BASE_URL}/me`);
        if (typeof response.data !== 'object' || response.data === null) {
            throw new Error('Expected a user object');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Please log in to access user information');
        } else if (error.response?.status === 404) {
            throw new Error('User not found');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Get employees with optional technology and resource type filters
export const getEmployees = async (technology = 'all', resourceType = 'all') => {
    try {
        console.debug('Fetching employees with params:', { technology, resourceType });
        const response = await axiosInstance.get(`${API_BASE_URL}/employees`, {
            params: { technology, resourceType }
        });
        if (!Array.isArray(response.data)) {
            throw new Error('Expected an array of employees');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Get employee details by ID
export const getEmployeeById = async (employeeId) => {
    try {
        if (!employeeId) {
            throw new Error('Employee ID is required');
        }
        console.debug('Fetching employee details for ID:', employeeId);
        const response = await axiosInstance.get(`/api/employee/${employeeId}`);
        if (typeof response.data !== 'object' || response.data === null) {
            throw new Error('Expected an employee object');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Employee not found');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data || 'Invalid employee ID');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Schedule a mock interview
export const scheduleInterview = async ({
    empId,
    date,
    time,
    interviewerId,
    files
}) => {
    try {
        if (!empId || !date || !time || !interviewerId) {
            throw new Error('Missing required fields: empId, date, time, and interviewerId are required');
        }
        console.debug('Scheduling interview with params:', { empId, date, time, interviewerId, files });
        const formData = new FormData();
        formData.append('empId', empId);
        formData.append('interviewType', 'mock');
        formData.append('date', date);
        formData.append('time', time);
        formData.append('interviewerId', interviewerId);
        if (files && files.length > 0) {
            files.forEach((file, index) => {
                formData.append('files', file);
            });
        }

        const response = await axiosInstance.post(`${API_BASE_URL}/schedule`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (typeof response.data !== 'object' || response.data === null) {
            throw new Error('Expected an interview object');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Please log in to schedule interviews');
        } else if (error.response?.status === 403) {
            throw new Error('You are not authorized to schedule this type of interview');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data || 'Invalid interview data. Please check all required fields.');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Update mock interview feedback
export const updateMockInterviewFeedback = async (interviewId, technicalFeedback, communicationFeedback, technicalScore, communicationScore, sentToSales, file) => {
    try {
        if (!interviewId || !technicalFeedback || !communicationFeedback || 
            !Number.isInteger(technicalScore) || !Number.isInteger(communicationScore) || 
            typeof sentToSales !== 'boolean') {
            throw new Error('Invalid feedback data: All fields are required, scores must be integers, and sentToSales must be a boolean');
        }
        console.debug('Updating feedback for interview:', { interviewId, technicalFeedback, communicationFeedback, technicalScore, communicationScore, sentToSales, file });
        const formData = new FormData();
        formData.append('technicalFeedback', technicalFeedback);
        formData.append('communicationFeedback', communicationFeedback);
        formData.append('technicalScore', technicalScore);
        formData.append('communicationScore', communicationScore);
        formData.append('sentToSales', sentToSales);
        if (file) {
            formData.append('file', file);
        }

        const response = await axiosInstance.put(`${API_BASE_URL}/mock-interviews/${interviewId}/feedback`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (typeof response.data !== 'object' || response.data === null) {
            throw new Error('Expected an interview object');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Please log in to update feedback');
        } else if (error.response?.status === 403) {
            throw new Error('You do not have permission to update feedback');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data || 'Invalid feedback data or interview not found');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Get upcoming interviews
export const getUpcomingInterviews = async () => {
    try {
        console.debug('Fetching upcoming interviews');
        const response = await axiosInstance.get(`${API_BASE_URL}/interviews/upcoming`);
        if (!Array.isArray(response.data)) {
            throw new Error('Expected an array of interviews');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Get completed interviews
export const getCompletedInterviews = async () => {
    try {
        console.debug('Fetching completed interviews');
        const response = await axiosInstance.get(`${API_BASE_URL}/interviews/completed`);
        if (!Array.isArray(response.data)) {
            throw new Error('Expected an array of interviews');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Update interview status
export const updateInterviewStatus = async (interviewId) => {
    try {
        if (!interviewId) {
            throw new Error('Interview ID is required');
        }
        console.debug('Updating interview status for:', { interviewId });
        const response = await axiosInstance.put(`${API_BASE_URL}/mock-interviews/${interviewId}/update-status`);
        if (typeof response.data !== 'object' || response.data === null) {
            throw new Error('Expected an interview object');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Please log in to update interview status');
        } else if (error.response?.status === 403) {
            throw new Error('You do not have permission to update interview status');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data || 'Invalid interview status update request');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Update profile picture for the authenticated user
export const updateProfilePicture = async (userId, file) => {
    try {
        if (!file) {
            throw new Error('Profile picture file is required');
        }
        if (!userId) {
            throw new Error('User ID is required');
        }
        console.debug('Updating profile picture for user ID:', userId);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('Id', userId);

        const response = await axiosInstance.put(`${API_BASE_URL}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (typeof response.data !== 'object' || response.data === null) {
            throw new Error('Expected a user object');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Please log in to update profile picture');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data || 'Invalid file format. Please use JPEG or PNG');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Get profile picture for a specific employee
export const getProfilePicture = async (employeeId) => {
    try {
        if (!employeeId) {
            throw new Error('Employee ID is required');
        }
        console.debug('Fetching profile picture for employee ID:', employeeId);
        const response = await axiosInstance.get(`${API_BASE_URL}/profile-picture/${employeeId}`, {
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 400) {
            throw new Error('Profile picture not found');
        } else if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Get mock interview performance data
export const getMockInterviewPerformance = async () => {
    try {
        console.debug('Fetching mock interview performance data');
        const response = await axiosInstance.get(`${API_BASE_URL}/mock-interviews/performance`);
        if (!Array.isArray(response.data)) {
            throw new Error('Expected an array of performance data');
        }
        return response.data;
    } catch (error) {
        if (error.response?.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        } else if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error.response?.data || error.message;
    }
};

// Export all functions as a single object
export default {
    getEmployees,
    getEmployeeById,
    scheduleInterview,
    updateMockInterviewFeedback,
    getUpcomingInterviews,
    getCompletedInterviews,
    updateInterviewStatus,
    updateProfilePicture,
    getProfilePicture,
    getMockInterviewPerformance,
    getCurrentUser,
    debugUserInfo
};