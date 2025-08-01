import axiosInstance from './axiosConfig';

// Base URL for sales-related endpoints
const BASE_URL = '/api/sales';



/**
 * Get candidates with optional filters
 * @param {string} technology - Optional technology filter (default: 'all')
 * @param {string} status - Optional status filter (default: 'all')
 * @param {string} resourceType - Optional resource type filter (default: 'all')
 * @returns {Promise<Array<Employee>>} List of candidates
 */
export const getCandidates = async (technology = 'all', status = 'all', resourceType = 'all') => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/candidates`, {
      params: { technology, status, resourceType },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Schedule a client interview
 * @param {string} empId - Employee ID
 * @param {string} client - Client name
 * @param {string} date - Interview date in ISO format (YYYY-MM-DD)
 * @param {string} time - Interview time in HH:mm:ss format
 * @param {number} level - Interview level
 * @param {string} jobDescriptionTitle - Job description title
 * @param {string} meetingLink - Meeting link
 * @param {string} interviewerEmail - Interviewer email (REQUIRED)
 * @param {boolean} deployedStatus - Deployment status
 * @param {File} file - File to upload (REQUIRED)
 * @returns {Promise<ClientInterview>} Scheduled interview object
 */
export const scheduleClientInterview = async (
  empId,
  client,
  date,
  time,
  level,
  jobDescriptionTitle,
  meetingLink,
  interviewerEmail,
  deployedStatus = false,
  file = null
) => {
  try {
    // Validate inputs - ALL fields are required according to backend
    if (!empId || !client || !date || !time || level == null || !jobDescriptionTitle || !meetingLink || !interviewerEmail || !file) {
      throw new Error('All required fields must be provided: empId, client, date, time, level, jobDescriptionTitle, meetingLink, interviewerEmail, and file');
    }
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      throw new Error('File must be a PDF, JPEG, or PNG');
    }

    // Ensure time includes seconds (HH:mm:ss)
    const formattedTime = time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;

    const formData = new FormData();
    formData.append('empId', empId);
    formData.append('interviewType', 'client'); // Must be "client" for sales team
    formData.append('date', date);
    formData.append('time', formattedTime);
    formData.append('client', client);
    formData.append('level', level);
    formData.append('jobDescriptionTitle', jobDescriptionTitle);
    formData.append('meetingLink', meetingLink);
    formData.append('interviewerEmail', interviewerEmail);
    formData.append('deployedStatus', deployedStatus);
    formData.append('file', file);

    console.debug('Scheduling client interview with data:', {
      empId, client, date, time: formattedTime, level, jobDescriptionTitle, meetingLink, interviewerEmail, deployedStatus, fileName: file.name
    });

    const response = await axiosInstance.post(`${BASE_URL}/interviews/schedule`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error scheduling client interview:', error);
    if (error.response?.status === 400) {
      throw new Error(error.response.data || 'Invalid request data');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to schedule interviews.');
    }
    throw handleApiError(error);
  }
};

/**
 * Schedule multiple client interviews for an employee
 * @param {string} empId - Employee ID
 * @param {Array<ClientInterviewSchedule>} schedules - Array of interview schedules
 * @returns {Promise<Array<ClientInterview>>} Array of scheduled interviews
 */
export const scheduleMultipleClientInterviews = async (empId, schedules) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      throw new Error('Schedules must be a non-empty array');
    }
    const response = await axiosInstance.post(`${BASE_URL}/employees/${empId}/interviews`, schedules);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Update client interview feedback
 * @param {number} interviewId - Interview ID
 * @param {Object} feedbackData - Feedback data
 * @param {string} feedbackData.result - Interview result (pass/fail)
 * @param {string} feedbackData.feedback - Feedback text
 * @param {number} feedbackData.technicalScore - Technical score (0-10)
 * @param {number} feedbackData.communicationScore - Communication score (0-10)
 * @param {boolean} feedbackData.deployedStatus - Deployment status
 * @returns {Promise<Object>} Updated interview object
 */
export const updateClientInterview = async (interviewId, feedbackData, file = null) => {
  try {
    const techScore = Number(feedbackData.technicalScore);
    const commScore = Number(feedbackData.communicationScore);

    if (isNaN(techScore) || techScore < 0 || techScore > 10) {
      throw new Error('Technical score must be a number between 0 and 10');
    }
    if (isNaN(commScore) || commScore < 0 || commScore > 10) {
      throw new Error('Communication score must be a number between 0 and 10');
    }
    if (!feedbackData.result || !feedbackData.feedback) {
      throw new Error('Result and feedback are required');
    }

    // Validate file if provided
    if (file && !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      throw new Error('File must be a PDF, JPEG, or PNG');
    }

    // Create FormData for multipart request
    const formData = new FormData();
    formData.append('result', String(feedbackData.result));
    formData.append('feedback', String(feedbackData.feedback));
    formData.append('technicalScore', techScore);
    formData.append('communicationScore', commScore);
    
    // Add deployedStatus if provided
    if (feedbackData.deployedStatus !== undefined) {
      formData.append('deployedStatus', Boolean(feedbackData.deployedStatus));
    }

    // Add file if provided
    if (file) {
      formData.append('file', file);
    }

    // Debug logging
    console.log('Updating client interview:', {
      interviewId,
      feedbackData,
      hasFile: !!file,
      fileName: file ? file.name : 'No file'
    });

    const response = await axiosInstance.put(`${BASE_URL}/client-interviews/${interviewId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Update client interview response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating client interview:', error);
    
    // Enhanced error handling for 403 errors
    if (error.response?.status === 403) {
      const token = localStorage.getItem('jwt_token');
      const userRole = localStorage.getItem('userRole');
      console.error('403 Forbidden - Authentication details:', {
        hasToken: !!token,
        userRole,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
      
      throw new Error('Access denied. You do not have permission to update client interviews. Please ensure you are logged in with the correct role (ROLE_SALES or ADMIN).');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data || 'Invalid request data');
    }
    
    throw handleApiError(error);
  }
};

/**
 * Get client interviews with optional search
 * @param {string} search - Optional search term
 * @returns {Promise<Array<ClientInterview>>} List of client interviews
 */
export const getClientInterviews = async (search = null) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/client-interviews`, {
      params: { search },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a specific client interview by ID
 * @param {number} interviewId - Interview ID
 * @returns {Promise<ClientInterview>} Client interview object
 */
export const getClientInterviewById = async (interviewId) => {
  try {
    if (!interviewId) {
      throw new Error('Interview ID is required');
    }
    
    // First try to get the full interview details from the list
    const allInterviews = await getClientInterviews();
    const interview = allInterviews.find(i => i.id === interviewId);
    
    if (!interview) {
      throw new Error(`Interview not found with ID: ${interviewId}`);
    }
    
    return interview;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get client interview feedback by ID
 * @param {number} interviewId - Interview ID
 * @returns {Promise<Object>} Interview feedback object
 */
export const getClientInterviewFeedback = async (interviewId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/client-interviews/${interviewId}/feedback`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get total count of scheduled client interviews
 * @returns {Promise<number>} Total count of interviews
 */
export const getClientInterviewCount = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/get-all-scheduleclientinterview-count`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Add a new client
 * @param {Object} clientData - Client data
 * @param {string} clientData.name - Client name
 * @param {string} clientData.contactEmail - Contact email
 * @param {number} clientData.activePositions - Number of active positions
 * @param {Array<string>} clientData.technologies - List of technologies
 * @returns {Promise<Client>} Added client object
 */
export const addClient = async (clientData) => {
  try {
    if (!clientData.name || !clientData.contactEmail || clientData.activePositions == null || !clientData.technologies) {
      throw new Error('All client fields (name, contactEmail, activePositions, technologies) are required');
    }
    
    const formData = new FormData();
    formData.append('name', clientData.name);
    formData.append('contactEmail', clientData.contactEmail);
    formData.append('activePositions', clientData.activePositions);
    
    // Handle technologies array
    if (Array.isArray(clientData.technologies)) {
      clientData.technologies.forEach(tech => {
        formData.append('technologies', tech);
      });
    }
    
    const response = await axiosInstance.post(`${BASE_URL}/clients`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get clients with optional search
 * @param {string} search - Optional search term
 * @returns {Promise<Array<Client>>} List of clients
 */
export const getClients = async (search = null) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/clients`, {
      params: { search },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Add a new job description
 * @param {Object} jdData - Job description data
 * @param {string} jdData.title - Job title
 * @param {string} jdData.client - Client name
 * @param {string} jdData.receivedDate - Received date (YYYY-MM-DD)
 * @param {string} jdData.deadline - Deadline date (YYYY-MM-DD)
 * @param {string} jdData.technology - Technology
 * @param {string} jdData.resourceType - Resource type
 * @param {string} jdData.description - Job description
 * @param {File} jdData.file - Optional job description file
 * @returns {Promise<JobDescription>} Added job description object
 */
export const addJobDescription = async (jdData) => {
  try {
    console.log('Attempting to add job description with data:', jdData);
    
    if (!jdData.title || !jdData.client || !jdData.receivedDate || !jdData.deadline || !jdData.technology || !jdData.resourceType || !jdData.description) {
      throw new Error('All job description fields (title, client, receivedDate, deadline, technology, resourceType, description) are required');
    }
    if (jdData.file && !['application/pdf'].includes(jdData.file.type)) {
      throw new Error('Job description file must be a PDF');
    }

    const formData = new FormData();
    Object.entries(jdData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Log authentication details for debugging
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    console.log('Authentication details for addJobDescription:', {
      hasToken: !!token,
      userRole,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    });

    const response = await axiosInstance.post(`${BASE_URL}/job-descriptions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Job description added successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding job description:', error);
    if (error.response?.status === 403) {
      const token = localStorage.getItem('jwt_token');
      const userRole = localStorage.getItem('userRole');
      console.error('403 Forbidden - Authentication details:', {
        hasToken: !!token,
        userRole,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
      });
      throw new Error('Access denied. You do not have permission to add job descriptions. Please ensure you are logged in with the correct role (SALES_TEAM or ADMIN).');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.status === 400) {
      throw new Error(error.response.data || 'Invalid request data');
    }
    throw handleApiError(error);
  }
};

/**
 * Get all job descriptions
 * @returns {Promise<Array<JobDescription>>} List of all job descriptions
 */
export const getAllJobDescriptions = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/job-descriptions`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Download job description file
 * @param {number} jdId - Job description ID
 * @returns {Promise<Blob>} Job description file blob
 */
export const downloadJobDescription = async (jdId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/job-descriptions/${jdId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Delete job description
 * @param {number} jdId - Job description ID
 * @returns {Promise<void>}
 */
export const deleteJobDescription = async (jdId) => {
  try {
    await axiosInstance.delete(`${BASE_URL}/job-descriptions/${jdId}`);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Download feedback file for a client interview
 * @param {number} interviewId - Interview ID
 * @returns {Promise<Blob>} Feedback file as blob
 */
export const downloadFeedbackFile = async (interviewId) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/client-interviews/${interviewId}/feedback-file`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get all employee resumes
 * @returns {Promise<Array<Employee>>} List of employees with resume information
 */
export const getAllEmployeeResumes = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/resumes`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get filtered employee resumes
 * @param {string} technology - Optional technology filter (default: 'all')
 * @param {string} resourceType - Optional resource type filter (default: 'all')
 * @returns {Promise<Array<Employee>>} List of filtered employees with resume information
 */
export const getFilteredResumes = async (technology = 'all', resourceType = 'all') => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/resumes/filter`, {
      params: { technology, resourceType },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get deployed employees
 * @returns {Promise<Array<Employee>>} List of deployed employees
 */
export const getDeployedEmployees = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/employees/deployed`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get current user information
 * @returns {Promise<User>} Current user object
 */
export const getCurrentUser = async () => {
  try {
    console.debug('Fetching current user information');
    const response = await axiosInstance.get(`${BASE_URL}/me`);
    if (typeof response.data !== 'object' || response.data === null) {
      throw new Error('Expected a user object');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to access this resource.');
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Update profile picture for the authenticated user
 * @param {Long} userId - User ID
 * @param {File} file - Profile picture file (JPEG or PNG)
 * @returns {Promise<User>} Updated user object
 */
export const updateProfilePicture = async (userId, file) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!file || !['image/jpeg', 'image/png'].includes(file.type)) {
      throw new Error('Profile picture must be a JPEG or PNG file');
    }

    console.debug('Updating profile picture for user ID:', userId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('Id', userId); // Match backend parameter name

    const response = await axiosInstance.put(`${BASE_URL}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile picture:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to update profile pictures.');
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Get profile picture for a specific employee
 * @param {Long} employeeId - Employee ID
 * @returns {Promise<Blob>} Profile picture blob
 */
export const getProfilePicture = async (employeeId) => {
  try {
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }
    console.debug('Fetching profile picture for employee ID:', employeeId);
    const response = await axiosInstance.get(`${BASE_URL}/profile-picture/${employeeId}`, {
      responseType: 'blob',
    });
    return response.data; // Returns blob directly, not URL.createObjectURL
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to access profile pictures.');
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Helper function to handle API errors
 * @param {Error} error - The error object
 * @throws {Error} Formatted error message
 */
const handleApiError = (error) => {
  if (error.response) {
    const errorMessage = error.response.data?.message || error.response.data || 'An error occurred';
    switch (error.response.status) {
      case 400:
        return new Error(errorMessage || 'Invalid request data');
      case 401:
        return new Error('Unauthorized: Please login to access this resource');
      case 403:
        return new Error(errorMessage || 'Access denied: You do not have permission to perform this action');
      case 404:
        return new Error(errorMessage || 'Resource not found');
      case 500:
        return new Error(errorMessage || 'Internal server error. Please try again later.');
      default:
        return new Error(errorMessage);
    }
  } else if (error.message.includes('Failed to upload file') || error.message.includes('Failed to download file')) {
    return new Error('File operation failed. Please check the file and try again.');
  }
  return new Error(error.message || 'An error occurred while processing your request');
};

// Export all functions as a single object
export default {
  getCandidates,
  scheduleClientInterview,
  scheduleMultipleClientInterviews,
  updateClientInterview,
  getClientInterviews,
  getClientInterviewById,
  getClientInterviewCount,
  addClient,
  getClients,
  addJobDescription,
  getAllJobDescriptions,
  downloadJobDescription,
  deleteJobDescription,
  getClientInterviewFeedback,
  downloadFeedbackFile,
  getAllEmployeeResumes,
  getFilteredResumes,
  getDeployedEmployees,
  updateProfilePicture,
  getProfilePicture,
  getCurrentUser,
};