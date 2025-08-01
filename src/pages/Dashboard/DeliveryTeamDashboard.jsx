/**
 * Delivery Team Dashboard Component
 * 
 * This component integrates with the delivery.js API service to provide:
 * - Employee management and filtering
 * - Interview scheduling with file uploads
 * - Feedback updates with file attachments
 * - Profile picture management
 * - Performance analytics
 * - File downloads for interview materials
 * 
 * API Integration:
 * - Uses all functions from delivery.js API service
 * - Handles file uploads for interviews and feedback
 * - Manages profile picture uploads
 * - Downloads files using presigned URLs from backend
 * - Provides comprehensive error handling and validation
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiUsers, FiCalendar, FiCheckCircle, FiClock, FiFileText, 
  FiSend, FiEdit, FiPlus, FiFilter, FiSearch, FiBarChart2,
  FiChevronDown, FiChevronUp, FiExternalLink, FiMail, FiUser, FiX, FiPlay, FiImage, FiUpload, FiDownload
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import styles from './DeliveryTeamDashboard.module.css';
import {
    getEmployees,
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
} from '../../API/delivery';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import EvaluationModal from '../../components/EvaluationModal';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const DeliveryTeamDashboard = () => {
  const { employee, user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [mockInterviews, setMockInterviews] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
  const [isScheduling, setIsScheduling] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [profilesSentToSales, setProfilesSentToSales] = useState([]);
  const [deployedEmployees, setDeployedEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewType, setInterviewType] = useState('mock');
  const [client, setClient] = useState('');
  const [level, setLevel] = useState('');
  const [jobDescriptionTitle, setJobDescriptionTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [isInterviewsLoading, setIsInterviewsLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [selectedEmployeeForScheduling, setSelectedEmployeeForScheduling] = useState(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    readyForSales: true,
    otherInterviews: true
  });
  const [completedTab, setCompletedTab] = useState('readyForSales');
  const [profilePic, setProfilePic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    empId: '',
    id: ''
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [feedbackFile, setFeedbackFile] = useState(null);
  const [roleError, setRoleError] = useState(null);

  const technologies = ['Java', 'Python', '.NET', 'DevOps', 'SalesForce', 'UI Development', 'Testing'];
  const resourceTypes = ['OM', 'TCT1', 'TCT2'];

  // Debug function to check current user's role and token
  const debugUserInfo = () => {
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
        
        // Check if user has required role
        if (payload.role !== 'ROLE_DELIVERY') {
          console.error('❌ USER ROLE MISMATCH:');
          console.error('Current role:', payload.role);
          console.error('Required role: ROLE_DELIVERY');
          console.error('To fix this:');
          console.error('1. Register a new user with role "delivery_team"');
          console.error('2. Or update the backend to allow your current role');
          console.error('3. Or update the frontend to use a different dashboard');
          
          setRoleError({
            currentRole: payload.role,
            requiredRole: 'ROLE_DELIVERY',
            message: `You need ROLE_DELIVERY to access this dashboard. Current role: ${payload.role}`
          });
        } else {
          console.log('✅ User has correct ROLE_DELIVERY role');
          setRoleError(null);
        }
      } catch (error) {
        console.error('Error decoding JWT token:', error);
      }
    }
    
    return { token: !!token, role, hasToken: !!token };
  };

  // Utility function to validate API responses
  const validateApiResponse = (data, expectedType, dataName) => {
    if (expectedType === 'array' && !Array.isArray(data)) {
      console.error(`Invalid ${dataName} data received:`, data);
      return false;
    }
    if (expectedType === 'object' && (typeof data !== 'object' || data === null)) {
      console.error(`Invalid ${dataName} data received:`, data);
      return false;
    }
    return true;
  };

  const LoadingSpinner = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading dashboard data...</p>
    </div>
  );

  const ErrorMessage = ({ message, onRetry }) => (
    <div className={styles.errorContainer}>
      <h3>Error</h3>
      <p>{message}</p>
      <button 
        className={styles.primaryButton}
        onClick={onRetry}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Try Again'}
      </button>
    </div>
  );

  const fetchData = async () => {
    // Don't fetch data if there's a role error
    if (roleError) {
      console.log('Skipping API calls due to role error:', roleError.message);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch employees data
      const employeesData = await getEmployees(technologyFilter, resourceTypeFilter);
      if (validateApiResponse(employeesData, 'array', 'employees')) {
        setEmployees(employeesData);
      } else {
        setEmployees([]);
      }

      // Fetch upcoming interviews
      let upcomingData = [];
      try {
        upcomingData = await getUpcomingInterviews();
        console.log('Raw upcoming interviews data:', upcomingData);
        if (validateApiResponse(upcomingData, 'array', 'upcoming interviews')) {
          // Data is valid, keep it
        } else {
          upcomingData = [];
        }
      } catch (error) {
        console.error('Error fetching upcoming interviews:', error);
        // Don't set error for upcoming interviews as it's not critical
        upcomingData = [];
      }

      // Fetch completed interviews
      let completedData = [];
      try {
        completedData = await getCompletedInterviews();
        console.log('Raw completed interviews data:', completedData);
        if (validateApiResponse(completedData, 'array', 'completed interviews')) {
          // Data is valid, keep it
        } else {
          completedData = [];
        }
      } catch (error) {
        console.error('Error fetching completed interviews:', error);
        // Don't set error for completed interviews as it's not critical
        completedData = [];
      }

      // Combine and process interview data with employee details
      const allInterviews = [];
      
      for (const interview of [...upcomingData, ...completedData]) {
        try {
          // The interview object should already contain the employee details
          const employee = interview.employee;
          console.log(`Processing interview ${interview.id}:`, interview);
          console.log('Interview employee object:', employee);
          console.log('Employee user object:', employee?.user);
          console.log('Employee user fullName:', employee?.user?.fullName);
          
          allInterviews.push({
            ...interview,
            employeeName: employee?.user?.fullName || 'Unknown Employee',
            employee: employee,
            // Add additional employee details for better display
            employeeId: employee?.empId || 'Unknown',
            employeeTechnology: employee?.technology || 'Unknown',
            employeeResourceType: employee?.resourceType || 'Unknown',
            employeeStatus: employee?.status || 'Unknown'
          });
        } catch (error) {
          console.error(`Error processing interview ${interview.id}:`, error);
          // Add interview with default values if processing fails
          allInterviews.push({
            ...interview,
            employeeName: 'Unknown Employee',
            employee: null,
            employeeId: 'Unknown',
            employeeTechnology: 'Unknown',
            employeeResourceType: 'Unknown',
            employeeStatus: 'Unknown'
          });
        }
      }
      
      setMockInterviews(allInterviews);

      // Process statistics
      const sentToSales = completedData
        .filter(i => i && i.sentToSales)
        .map(i => i.employeeId);
      setProfilesSentToSales(sentToSales);

      const deployed = completedData
        .filter(i => i && i.deployed)
        .map(i => i.employeeId);
      setDeployedEmployees(deployed);

      // Fetch performance data
      try {
        const performance = await getMockInterviewPerformance();
        if (validateApiResponse(performance, 'array', 'performance')) {
          setPerformanceData(performance);
        } else {
          setPerformanceData([]);
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
        toast.error('Could not load performance data.');
        setPerformanceData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to load dashboard data');
      setEmployees([]);
      setMockInterviews([]);
      setProfilesSentToSales([]);
      setDeployedEmployees([]);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  // First useEffect: Check user role and set roleError state
  useEffect(() => {
    debugUserInfo();
  }, []);

  // Second useEffect: Fetch data only if no role error
  useEffect(() => {
    if (roleError === null) {
      // roleError is null means debugUserInfo has run and found no issues
      fetchData();
    }
  }, [roleError, technologyFilter, resourceTypeFilter]);

  // Third useEffect: Fetch user data only if no role error
  useEffect(() => {
    if (roleError === null) {
      const fetchUserData = async () => {
        try {
          // Try to get current user from API first
          try {
            const currentUser = await getCurrentUser();
            const actualUserData = {
              name: currentUser.fullName || 'Delivery Team Member',
              email: currentUser.email || 'delivery@aja.com',
              role: currentUser.role || 'ROLE_DELIVERY',
              empId: currentUser.empId || 'DEL001',
              id: currentUser.id // Use actual user ID
            };
            setUserData(actualUserData);

            // Try to fetch profile picture using the user ID
            try {
              const picBlob = await getProfilePicture(currentUser.id);
              if (picBlob && picBlob.size > 0) {
                const picUrl = URL.createObjectURL(picBlob);
                setProfilePic(picUrl);
                console.log('Profile picture loaded successfully');
              } else {
                console.warn('Profile picture blob is empty or null');
                setProfilePic(null);
              }
            } catch (picError) {
              console.warn('Could not load profile picture:', picError.message);
              setProfilePic(null);
            }
          } catch (apiError) {
            console.warn('Could not fetch user from API, using AuthContext data:', apiError.message);
            
            // Fallback to AuthContext data
            if (employee && user) {
              const actualUserData = {
                name: employee.user?.fullName || 'Delivery Team Member',
                email: employee.user?.email || 'delivery@aja.com',
                role: user.role || 'ROLE_DELIVERY',
                empId: employee.empId || 'DEL001',
                id: employee.id // Use actual employee ID
              };
              setUserData(actualUserData);

              try {
                const picBlob = await getProfilePicture(employee.id);
                if (picBlob && picBlob.size > 0) {
                  const picUrl = URL.createObjectURL(picBlob);
                  setProfilePic(picUrl);
                  console.log('Profile picture loaded successfully');
                } else {
                  console.warn('Profile picture blob is empty or null');
                  setProfilePic(null);
                }
              } catch (picError) {
                console.warn('Could not load profile picture:', picError.message);
                setProfilePic(null);
              }
            } else {
              // Fallback to default data if no employee data available
              const defaultUserData = {
                name: 'Delivery Team Member',
                email: 'delivery@aja.com',
                role: 'ROLE_DELIVERY',
                empId: 'DEL001',
                id: 1
              };
              setUserData(defaultUserData);
              console.warn('No employee data available, using default user data');
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error(error.message || 'Failed to load user data');
        }
      };
      fetchUserData();
    }
  }, [roleError]);

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Don't proceed if there's a role error
      if (roleError) {
        toast.error('Cannot update profile picture due to role restrictions. Please fix the role issue first.');
        return;
      }

      try {
        // Validate file type
        if (!file.type.match(/^image\/(jpeg|png)$/)) {
          throw new Error('Please select a JPEG or PNG image file');
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }
        
        setSelectedFile(file);
        
        // Use the current user ID for profile picture update
        const userId = userData.id;
        if (!userId) {
          throw new Error('User ID not available. Please refresh the page and try again.');
        }
        
        console.log('Uploading profile picture for user ID:', userId);
        const updatedUser = await updateProfilePicture(userId, file);
        console.log('Profile picture upload response:', updatedUser);
        
        if (updatedUser) {
          try {
            const picBlob = await getProfilePicture(userId);
            if (picBlob && picBlob.size > 0) {
              const picUrl = URL.createObjectURL(picBlob);
              setProfilePic(picUrl);
              toast.success('Profile picture updated successfully!');
            } else {
              toast.error('Profile picture uploaded but could not be retrieved');
            }
          } catch (picError) {
            console.error('Error fetching updated profile picture:', picError);
            toast.error('Profile picture uploaded but could not be displayed. Please refresh the page.');
          }
        }
      } catch (error) {
        console.error('Error updating profile picture:', error);
        toast.error(error.message || 'Failed to update profile picture');
      }
    }
  };

  const handleFeedbackFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFeedbackFile(file);
    }
  };

  const downloadFile = async (s3Key) => {
    // Don't proceed if there's a role error
    if (roleError) {
      toast.error('Cannot download files due to role restrictions. Please fix the role issue first.');
      return;
    }

    try {
      // Check if s3Key is already a URL or needs to be processed
      let downloadUrl = s3Key;
      
      // If it's not a URL, it might be an S3 key that needs to be converted
      if (!s3Key.startsWith('http')) {
        console.warn('S3 key provided instead of presigned URL:', s3Key);
        // In a real implementation, you might need to call an API to get the presigned URL
        // For now, we'll assume it's already a presigned URL from the backend
        downloadUrl = s3Key;
      }
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = s3Key.split('/').pop() || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('File download started.');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file.');
    }
  };

  const filteredEmployees = Array.isArray(employees) ?
    employees.filter(employee => {
      if (!employee || !employee.user) return false;
      const matchesSearch = employee.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesTechnology = technologyFilter === 'all' || (employee.technology?.toLowerCase() === technologyFilter.toLowerCase());
      const matchesResourceType = resourceTypeFilter === 'all' || (employee.resourceType?.toLowerCase() === resourceTypeFilter.toLowerCase());
      return matchesSearch && matchesTechnology && matchesResourceType;
    })
    : [];

  const upcomingInterviews = Array.isArray(mockInterviews) 
    ? mockInterviews.filter(i => i && i.status === 'scheduled')
    : [];

  const completedInterviews = Array.isArray(mockInterviews)
    ? mockInterviews.filter(i => i && i.status === 'completed')
    : [];

  const techPerformanceData = technologies.map(tech => {
    const techInterviews = completedInterviews.filter(i => {
      const emp = (employees || []).find(e => e && e.empId === i.employeeId);
      return emp && emp.technology === tech;
    });
    const avgTechnical = techInterviews.length > 0 
      ? techInterviews.reduce((sum, i) => sum + (i.technicalRating || 0), 0) / techInterviews.length
      : 0;
    const avgCommunication = techInterviews.length > 0 
      ? techInterviews.reduce((sum, i) => sum + (i.communicationRating || 0), 0) / techInterviews.length
      : 0;
    return { 
      name: tech, 
      technical: parseFloat(avgTechnical.toFixed(1)), 
      communication: parseFloat(avgCommunication.toFixed(1)),
      count: techInterviews.length
    };
  });

  const resourcePerformanceData = resourceTypes.map(type => {
    const typeInterviews = completedInterviews.filter(i => {
      const emp = (employees || []).find(e => e && e.empId === i.employeeId);
      return emp && emp.resourceType === type;
    });
    const avgTechnical = typeInterviews.length > 0 
      ? typeInterviews.reduce((sum, i) => sum + (i.technicalRating || 0), 0) / typeInterviews.length
      : 0;
    const avgCommunication = typeInterviews.length > 0 
      ? typeInterviews.reduce((sum, i) => sum + (i.communicationRating || 0), 0) / typeInterviews.length
      : 0;
    return { 
      name: type, 
      technical: parseFloat(avgTechnical.toFixed(1)), 
      communication: parseFloat(avgCommunication.toFixed(1)),
      count: typeInterviews.length
    };
  });

  const topPerformers = performanceData.filter(p => p.totalRating >= 16);

  const totalCompleted = completedInterviews.length;
  const totalSentToSales = completedInterviews.filter(i => i.sentToSales).length;
  const totalDeployed = completedInterviews.filter(i => i.deployed).length;

  const conversionData = [
    { name: 'Completed Interviews', value: totalCompleted },
    { name: 'Sent to Sales', value: totalSentToSales },
    { name: 'Deployed', value: totalDeployed }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const handleScheduleInterviewSubmit = async (interviewData) => {
    // Don't proceed if there's a role error
    if (roleError) {
      toast.error('Cannot schedule interview due to role restrictions. Please fix the role issue first.');
      return;
    }

    setIsLoading(true);
    setIsInterviewsLoading(true);
    setError(null);
    try {
      // Validate required fields
      if (!interviewData.empId || !interviewData.date || !interviewData.time || !interviewData.interviewerId) {
        throw new Error('Missing required fields: Employee ID, Date, Time, and Interviewer ID are required');
      }

      const response = await scheduleInterview({
        empId: interviewData.empId,
        date: interviewData.date,
        time: interviewData.time,
        interviewerId: interviewData.interviewerId,
        files: interviewData.files || []
      });
      
      if (response) {
        // Update the interviews list with the new interview
        setMockInterviews(prev => {
          // The response should already contain the employee details
          const employee = response.employee;
          console.log('New interview response:', response);
          console.log('New interview employee object:', employee);
          console.log('Employee user object:', employee?.user);
          console.log('Employee user fullName:', employee?.user?.fullName);
          
          const newInterview = {
            ...response,
            employeeName: employee?.user?.fullName || 'Unknown Employee',
            employee: employee,
            employeeId: employee?.empId || 'Unknown',
            employeeTechnology: employee?.technology || 'Unknown',
            employeeResourceType: employee?.resourceType || 'Unknown',
            employeeStatus: employee?.status || 'Unknown'
          };
          return [...prev, newInterview];
        });
        
        setShowInterviewScheduler(false);
        setSelectedEmployeeForScheduling(null);
        toast.success('Interview scheduled successfully!');
        
        // Refresh data to get the latest state
        await fetchData();
      }
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error(error.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setIsLoading(false);
      setIsInterviewsLoading(false);
    }
  };

  const handleUpdateFeedback = async (data) => {
    // Don't proceed if there's a role error
    if (roleError) {
      toast.error('Cannot update feedback due to role restrictions. Please fix the role issue first.');
      return;
    }

    setIsFeedbackLoading(true);
    setError(null);
    try {
      // Validate required fields
      if (!data.interviewId || !data.technicalFeedback || !data.communicationFeedback || 
          !data.technicalRating || !data.communicationRating) {
        throw new Error('Missing required fields: Interview ID, feedback, and ratings are required');
      }

      const updatedInterview = await updateMockInterviewFeedback(
        data.interviewId,
        data.technicalFeedback,
        data.communicationFeedback,
        data.technicalRating,
        data.communicationRating,
        data.sentToSales || false,
        feedbackFile
      );
      
      // Update the interviews list with the updated interview
      const updatedInterviews = mockInterviews.map(interview => {
        if (interview.id === data.interviewId) {
          return {
            ...interview,
            ...updatedInterview,
            status: 'completed'
          };
        }
        return interview;
      });
      setMockInterviews(updatedInterviews);
      setSelectedInterviewId(null);
      setFeedbackFile(null);
      toast.success('Feedback updated successfully!');
      
      // Refresh data to get the latest state
      const completedData = await getCompletedInterviews();
      if (Array.isArray(completedData)) {
        const allInterviews = [];
        
        for (const interview of [...mockInterviews.filter(i => i.status === 'scheduled'), ...completedData]) {
          try {
            // The interview object should already contain the employee details
            const employee = interview.employee;
            console.log(`Processing interview ${interview.id}:`, interview);
            console.log('Interview employee object:', employee);
            console.log('Employee user object:', employee?.user);
            console.log('Employee user fullName:', employee?.user?.fullName);
            
            allInterviews.push({
              ...interview,
              employeeName: employee?.user?.fullName || 'Unknown Employee',
              employee: employee,
              employeeId: employee?.empId || 'Unknown',
              employeeTechnology: employee?.technology || 'Unknown',
              employeeResourceType: employee?.resourceType || 'Unknown',
              employeeStatus: employee?.status || 'Unknown'
            });
          } catch (error) {
            console.error(`Error processing interview ${interview.id}:`, error);
            allInterviews.push({
              ...interview,
              employeeName: 'Unknown Employee',
              employee: null,
              employeeId: 'Unknown',
              employeeTechnology: 'Unknown',
              employeeResourceType: 'Unknown',
              employeeStatus: 'Unknown'
            });
          }
        }
        
        setMockInterviews(allInterviews);
      }
      return updatedInterview;
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error(error.message || 'Failed to update feedback. Please try again.');
      throw error;
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const handleCloseFeedbackModal = () => {
    setSelectedInterviewId(null);
    setFeedbackFile(null);
    setError(null);
  };

  const sendToSales = async (interview) => {
    // Don't proceed if there's a role error
    if (roleError) {
      toast.error('Cannot send to sales due to role restrictions. Please fix the role issue first.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Validate interview data
      if (!interview.id || !interview.technicalFeedback || !interview.communicationFeedback || 
          !interview.technicalRating || !interview.communicationRating) {
        throw new Error('Interview data is incomplete. Please update feedback first.');
      }

      await updateMockInterviewFeedback(
        interview.id,
        interview.technicalFeedback,
        interview.communicationFeedback,
        interview.technicalRating,
        interview.communicationRating,
        true, // sentToSales = true
        null  // no additional file
      );
      toast.success('Profile sent to sales successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error sending to sales:', error);
      toast.error(error.message || 'Failed to send profile to sales. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInterviewStatus = async (interviewId) => {
    // Don't proceed if there's a role error
    if (roleError) {
      toast.error('Cannot update interview status due to role restrictions. Please fix the role issue first.');
      return;
    }

    try {
      if (!interviewId) {
        throw new Error('Interview ID is required');
      }
      
      setIsLoading(true);
      await updateInterviewStatus(interviewId);
      toast.success('Interview status updated successfully!');
      await fetchData();
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast.error(error.message || 'Failed to update interview status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = useCallback((score) => {
    if (score >= 8) return '#28a745';
    if (score >= 5) return '#ffc107';
    return '#dc3545';
  }, []);

  const renderTabContent = () => {
    if (isLoading && !isInitialLoading) {
      return <LoadingSpinner />;
    }

    if (error && !isInitialLoading) {
      return <ErrorMessage message={error} onRetry={fetchData} />;
    }

    switch (activeTab) {
      case 'employees':
        return (
          <div className={styles.sectionContainer}>
            <div className={styles.filterControls}>
              <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button 
                className={styles.filterToggle}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? <FiChevronUp /> : <FiChevronDown />} Filters
              </button>
              
              <button 
                className={styles.primaryButton}
                onClick={() => setShowInterviewScheduler(true)}
                disabled={roleError}
                title={roleError ? 'Disabled due to role restrictions' : 'Schedule a new interview'}
              >
                <FiPlus /> Schedule Interview
              </button>
            </div>
            
            {showFilters && (
              <div className={styles.advancedFilters}>
                <div className={styles.filterGroup}>
                  <label>Technology</label>
                  <select
                    value={technologyFilter}
                    onChange={(e) => setTechnologyFilter(e.target.value)}
                  >
                    <option value="all">All Technologies</option>
                    {technologies.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.filterGroup}>
                  <label>Resource Type</label>
                  <select
                    value={resourceTypeFilter}
                    onChange={(e) => setResourceTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    {resourceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className={styles.cardGrid}>
              {filteredEmployees.map(employee => (
                <motion.div
                  key={employee.id}
                  className={styles.card}
                  whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.userAvatar}>
                      {isLoading ? (
                        <div className={styles.loadingSpinner} />
                      ) : employee.profilePicS3Key ? (
                        <img
                          src={employee.profilePicS3Key}
                          alt={`${employee.user?.fullName || 'Employee'}'s profile`}
                          className={styles.profilePicture}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            console.error('Employee profile picture failed to load');
                          }}
                        />
                      ) : (
                        <FiUser />
                      )}
                    </div>
                    <div>
                      <h3>{employee.user?.fullName || 'Unknown Employee'}</h3>
                      <div className={styles.cardMeta}>
                        <span className={`${styles.techBadge} ${styles[employee.technology?.replace(' ', '')]}`}>
                          {employee.technology || 'Unknown'}
                        </span>
                        <span className={`${styles.resourceBadge} ${styles[employee.resourceType]}`}>
                          {employee.resourceType || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardDetails}>
                    <p><strong>Status:</strong> {employee.status || 'N/A'}</p>
                  </div>
                  <div className={styles.cardFooter}>
                    <button 
                      className={styles.secondaryButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployeeForScheduling(employee);
                        setShowInterviewScheduler(true);
                      }}
                      disabled={roleError}
                      title={roleError ? 'Disabled due to role restrictions' : 'Schedule interview for this employee'}
                    >
                      <FiCalendar /> Schedule
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'interviews':
        return (
          <div className={styles.sectionContainer}>
            <div className={styles.interviewTabs}>
              <button 
                className={`${styles.interviewTabButton} ${styles.active}`}
              >
                Upcoming Interviews
              </button>
            </div>
            
            <div className={styles.filterControls}>
              <div className={styles.filterGroup}>
                <label>Technology</label>
                <select
                  value={technologyFilter}
                  onChange={(e) => setTechnologyFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Technologies</option>
                  {technologies.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.filterGroup}>
                <label>Resource Type</label>
                <select
                  value={resourceTypeFilter}
                  onChange={(e) => setResourceTypeFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Types</option>
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.interviewSummary}>
              <div className={styles.summaryCard}>
                <h4>Upcoming Interviews</h4>
                <p>{upcomingInterviews.length}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Completed Interviews</h4>
                <p>{completedInterviews.length}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Sent to Sales</h4>
                <p>{profilesSentToSales.length}</p>
              </div>
              <div className={styles.summaryCard}>
                <h4>Deployed</h4>
                <p>{deployedEmployees.length}</p>
              </div>
            </div>
            
            <div className={styles.interviewList}>
              <div className={styles.interviewListHeader}>
                <h4>Upcoming Mock Interviews</h4>
              </div>
              
              {upcomingInterviews.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiCalendar size={48} />
                  <p>No upcoming interviews scheduled</p>
                </div>
              ) : (
                <div className={styles.employeeList}>
                  {upcomingInterviews
                    .filter(interview => {
                      const matchesTechnology = technologyFilter === 'all' || 
                        interview.employee?.technology === technologyFilter;
                      const matchesResourceType = resourceTypeFilter === 'all' || 
                        interview.employee?.resourceType === resourceTypeFilter;
                      return matchesTechnology && matchesResourceType;
                    })
                    .map(interview => (
                    <motion.div
                      key={interview.id}
                      className={styles.interviewCard}
                      whileHover={{ scale: 1.01 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.interviewHeader}>
                        <div className={styles.interviewHeaderLeft}>
                          <h4>{interview.employeeName || 'Unknown Employee'}</h4>
                          <div className={styles.interviewMeta}>
                            <span className={styles.employeeId}>
                              {interview.employeeId || 'N/A'}
                            </span>
                            <span className={`${styles.techBadge} ${styles[interview.employeeTechnology?.replace(' ', '')]}`}>
                              {interview.employeeTechnology || 'Unknown'}
                            </span>
                            <span className={`${styles.resourceBadge} ${styles[interview.employeeResourceType]}`}>
                              {interview.employeeResourceType || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.interviewDate}>
                          <FiCalendar /> {interview.date} at {interview.time}
                        </div>
                      </div>
                      
                      <div className={styles.interviewDetails}>
                        <div className={styles.detailRow}>
                          <p><strong>Status:</strong> {interview.status || 'N/A'}</p>
                        </div>
                        <div className={styles.detailRow}>
                          <p><strong>Interviewer:</strong> {interview.interviewer?.fullName || 'N/A'}</p>
                        </div>
                        {interview.fileS3Keys && interview.fileS3Keys.length > 0 && (
                          <div className={styles.detailRow}>
                            <p><strong>Files:</strong></p>
                            {interview.fileS3Keys.map((s3Key, index) => (
                              <button
                                key={index}
                                className={styles.downloadButton}
                                onClick={() => downloadFile(s3Key)}
                                disabled={roleError}
                                title={roleError ? 'Disabled due to role restrictions' : 'Download this file'}
                              >
                                <FiDownload /> Download File {index + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.interviewActions}>
                        <div className={styles.actionButtons}>
                                                  <button 
                          className={`${styles.button} ${styles.primary}`}
                          onClick={() => {/* handle start interview */}}
                          disabled={roleError}
                          title={roleError ? 'Disabled due to role restrictions' : 'Start the interview'}
                        >
                          <FiPlay /> Start Interview
                        </button>
                        <button 
                          className={`${styles.button} ${styles.secondary}`}
                          onClick={() => {/* handle reschedule */}}
                          disabled={roleError}
                          title={roleError ? 'Disabled due to role restrictions' : 'Reschedule the interview'}
                        >
                          <FiCalendar /> Reschedule
                        </button>
                        <button 
                          className={`${styles.button} ${styles.success}`}
                          onClick={() => handleUpdateInterviewStatus(interview.id)}
                          disabled={isLoading || roleError}
                          title={roleError ? 'Disabled due to role restrictions' : 'Update interview status'}
                        >
                          <FiCheckCircle /> Update Interview
                        </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className={styles.sectionContainer}>
            <div className={styles.interviewList}>
              <div className={styles.interviewListHeader}>
                <h4>Ready for Sales</h4>
                <p className={styles.sectionDescription}>Interviews with good ratings that can be sent to sales or need improvement</p>
              </div>
              
              {completedInterviews.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiCheckCircle size={48} />
                  <p>No completed interviews</p>
                </div>
              ) : (
                completedInterviews
                  .filter(interview => interview.status === 'completed')
                  .map(interview => (
                    <motion.div
                      key={interview.id}
                      className={styles.interviewCard}
                      whileHover={{ scale: 1.01 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.interviewHeader}>
                        <div>
                          <h4>{interview.employeeName || 'Unknown Employee'}</h4>
                          <div className={styles.interviewMeta}>
                            <span className={styles.employeeId}>
                              {interview.employeeId || 'N/A'}
                            </span>
                            <span className={`${styles.techBadge} ${styles[interview.employeeTechnology?.replace(' ', '')]}`}>
                              {interview.employeeTechnology || 'Unknown'}
                            </span>
                            <span className={`${styles.resourceBadge} ${styles[interview.employeeResourceType]}`}>
                              {interview.employeeResourceType || 'Unknown'}
                            </span>
                            <span className={styles.status}>
                              {interview.status}
                            </span>
                            {interview.sentToSales && (
                              <span className={styles.sentToSalesBadge}>
                                Sent to Sales
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={styles.interviewDate}>
                          <FiCalendar /> {interview.date} at {interview.time}
                        </div>
                      </div>
                      
                      <div className={styles.interviewDetails}>
                        <p><strong>Employee ID:</strong> {interview.employeeId || 'N/A'}</p>
                        <p><strong>Interviewer:</strong> {interview.interviewer?.fullName || 'N/A'}</p>
                        {interview.fileS3Keys && interview.fileS3Keys.length > 0 && (
                          <div className={styles.detailRow}>
                            <p><strong>Files:</strong></p>
                            {interview.fileS3Keys.map((s3Key, index) => (
                              <button
                                key={index}
                                className={styles.downloadButton}
                                onClick={() => downloadFile(s3Key)}
                                disabled={roleError}
                                title={roleError ? 'Disabled due to role restrictions' : 'Download this file'}
                              >
                                <FiDownload /> Download File {index + 1}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.interviewScores}>
                        <div className={styles.scoreMeter}>
                          <div className={styles.scoreLabel}>
                            Technical: {interview.technicalRating || 'N/A'}/10
                          </div>
                          <div className={styles.scoreBar}>
                            <div 
                              className={styles.scoreFill} 
                              style={{
                                width: `${(interview.technicalRating || 0) * 10}%`,
                                backgroundColor: getScoreColor(interview.technicalRating || 0)
                              }}
                            />
                          </div>
                        </div>
                        <div className={styles.scoreMeter}>
                          <div className={styles.scoreLabel}>
                            Communication: {interview.communicationRating || 'N/A'}/10
                          </div>
                          <div className={styles.scoreBar}>
                            <div 
                              className={styles.scoreFill} 
                              style={{
                                width: `${(interview.communicationRating || 0) * 10}%`,
                                backgroundColor: getScoreColor(interview.communicationRating || 0)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.feedback}>
                        <h5>Technical Feedback</h5>
                        <p>{interview.technicalFeedback || 'N/A'}</p>
                        
                        <h5>Communication Feedback</h5>
                        <p>{interview.communicationFeedback || 'N/A'}</p>
                      </div>
                      
                      <div className={styles.interviewActions}>
                        <button 
                          className={styles.secondaryButton}
                          onClick={() => {
                            setSelectedInterviewId(interview.id);
                            setFeedbackFile(null);
                          }}
                          disabled={roleError}
                          title={roleError ? 'Disabled due to role restrictions' : 'Edit feedback for this interview'}
                        >
                          <FiEdit /> Edit Feedback
                        </button>
                        
                        {!interview.sentToSales && (
                          <button
                            className={styles.successButton}
                            onClick={() => sendToSales(interview)}
                            disabled={isSubmitting || roleError}
                            title={roleError ? 'Disabled due to role restrictions' : 'Send this profile to sales team'}
                          >
                            <FiSend /> Send to Sales
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className={styles.analyticsContainer}>
            <div className={styles.statsGrid}>
              <motion.div 
                className={styles.statCard}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h5>Interviews Conducted</h5>
                <p className={styles.statValue}>{completedInterviews.length}</p>
                <p className={styles.statLabel}>This Month</p>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <h5>Avg Technical Score</h5>
                <p className={styles.statValue}>
                  {completedInterviews.length > 0 
                    ? (completedInterviews.reduce((sum, i) => sum + (i.technicalRating || 0), 0) / completedInterviews.length).toFixed(1)
                    : '0.0'}
                </p>
                <p className={styles.statLabel}>/ 10.0</p>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <h5>Avg Communication Score</h5>
                <p className={styles.statValue}>
                  {completedInterviews.length > 0 
                    ? (completedInterviews.reduce((sum, i) => sum + (i.communicationRating || 0), 0) / completedInterviews.length).toFixed(1)
                    : '0.0'}
                </p>
                <p className={styles.statLabel}>/ 10.0</p>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <h5>Profiles Sent</h5>
                <p className={styles.statValue}>
                  {profilesSentToSales.length}
                </p>
                <p className={styles.statLabel}>To Sales Team</p>
              </motion.div>
              <motion.div 
                className={styles.statCard}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <h5>Deployment Rate</h5>
                <p className={styles.statValue}>
                  {profilesSentToSales.length > 0 
                    ? Math.round((deployedEmployees.length / profilesSentToSales.length) * 100)
                    : '0'}%
                </p>
                <p className={styles.statLabel}>Hired by Clients</p>
              </motion.div>
            </div>
            
            <div className={styles.chartRow}>
              <div className={styles.chartCard}>
                <h4>Performance by Technology</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={techPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="technical" fill="#8884d8" name="Technical" />
                    <Bar dataKey="communication" fill="#82ca9d" name="Communication" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className={styles.chartCard}>
                <h4>Performance by Resource Type</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourcePerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="technical" fill="#8884d8" name="Technical" />
                    <Bar dataKey="communication" fill="#82ca9d" name="Communication" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className={styles.chartRow}>
              <div className={styles.chartCard}>
                <h4>Interview Conversion</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} interviews`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className={styles.chartCard}>
                <h4>Top Performers</h4>
                <div className={styles.topPerformersList}>
                  {topPerformers.length > 0 ? (
                    topPerformers.map((performer, index) => (
                      <div key={index} className={styles.performerCard}>
                        <div className={styles.performerInfo}>
                          <div className={styles.userAvatarSmall}>
                            {isLoading ? (
                              <div className={styles.loadingSpinner} />
                            ) : performer.profilePicS3Key ? (
                              <img
                                src={performer.profilePicS3Key}
                                alt={`${performer.employeeName || 'Performer'}'s profile`}
                                className={styles.profilePictureSmall}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  console.error('Top performer profile picture failed to load');
                                }}
                              />
                            ) : (
                              <FiUser />
                            )}
                          </div>
                          <div>
                            <h5>{performer.employeeName}</h5>
                            <div className={styles.performerMeta}>
                              <span className={`${styles.techBadge} ${styles[performer.technology?.replace(' ', '')]}`}>
                                {performer.technology}
                              </span>
                              <span className={`${styles.resourceBadge} ${styles[performer.resourceType]}`}>
                                {performer.resourceType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.performerScore}>
                          <span>{performer.totalRating / 2}</span>
                          /10
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <p>No top performers yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionTitle}>My Profile</h3>
            <div className={styles.profileSection}>
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <div className={styles.profilePictureContainer}>
                    {isLoading ? (
                      <div className={styles.loadingSpinner} />
                    ) : profilePic ? (
                      <img
                        src={profilePic}
                        alt={`${userData.name || 'User'}'s profile`}
                        className={styles.profilePicture}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          console.error('Profile picture failed to load');
                        }}
                      />
                    ) : (
                      <div className={styles.noProfilePic}>
                        <FiUser size={48} />
                      </div>
                    )}
                    <input
                      type="file"
                      id="profilePictureUpload"
                      accept="image/jpeg,image/png"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                      disabled={roleError}
                    />
                    <label 
                      htmlFor="profilePictureUpload" 
                      className={`${styles.profilePictureUpload} ${roleError ? styles.disabled : ''}`}
                      title={roleError ? 'Disabled due to role restrictions' : 'Update your profile picture'}
                    >
                      <FiUpload size={18} /> Update Photo
                    </label>
                  </div>
                  <div className={styles.profileInfo}>
                    <h2>{userData.name}</h2>
                    <p className={styles.profileRole}>{userData.role}</p>
                    <p className={styles.profileEmail}>{userData.email}</p>
                  </div>
                </div>
                
                <div className={styles.profileDetails}>
                  <h4>Profile Details</h4>
                  <div className={styles.profileTable}>
                    <div className={styles.tableRow}>
                      <div className={styles.tableHeader}>Name</div>
                      <div className={styles.tableValue}>{userData.name}</div>
                    </div>
                    <div className={styles.tableRow}>
                      <div className={styles.tableHeader}>Email</div>
                      <div className={styles.tableValue}>{userData.email}</div>
                    </div>
                    <div className={styles.tableRow}>
                      <div className={styles.tableHeader}>Role</div>
                      <div className={styles.tableValue}>{userData.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderModalActions = useCallback(() => (
    <div className={styles.modalActions}>
      <button 
        type="button" 
        className={styles.secondaryButton}
        onClick={handleCloseFeedbackModal}
        disabled={isSubmitting || isFeedbackLoading}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        className={styles.primaryButton}
        disabled={isSubmitting || isFeedbackLoading}
      >
        {isSubmitting ? 'Updating...' : 'Update Feedback'}
      </button>
    </div>
  ), [isSubmitting, isFeedbackLoading]);

  const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    if (hasError) {
      return (
        <div className={styles.errorContainer}>
          <h3>Something went wrong</h3>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
          <button 
            className={styles.primaryButton}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return children;
  };

  const LoadingState = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>{isInitialLoading ? 'Loading dashboard...' : 'Updating data...'}</p>
    </div>
  );

  const currentSelectedInterview = mockInterviews.find(interview => interview.id === selectedInterviewId) || null;

  return (
    <ErrorBoundary>
      <div className={styles.dashboardContainer}>
        {isInitialLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchData} />
        ) : (
          <>
            <div className={styles.dashboardHeader}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2>Delivery Team Dashboard</h2>
                <p className={styles.dashboardSubtitle}>Mock Interview Management & Employee Evaluation</p>
              </motion.div>
              <div className={styles.userProfile}>
                <div className={styles.userAvatar}>
                  {isLoading ? (
                    <div className={styles.loadingSpinner} />
                  ) : profilePic ? (
                    <img
                      src={profilePic}
                      alt={`${userData.name || 'User'}'s profile`}
                      className={styles.profilePicture}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.error('Profile picture failed to load');
                      }}
                    />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{userData.name}</span>
                  <span className={styles.userName}>
                    {userData.role} {userData.email ? `(${userData.email})` : ''}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Role Error Display */}
            {roleError && (
              <motion.div
                className={styles.roleErrorContainer}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.roleErrorContent}>
                  <div className={styles.roleErrorIcon}>⚠️</div>
                  <div className={styles.roleErrorText}>
                    <h4>Access Denied</h4>
                    <p>{roleError.message}</p>
                    <div className={styles.roleErrorDetails}>
                      <p><strong>Current Role:</strong> {roleError.currentRole}</p>
                      <p><strong>Required Role:</strong> {roleError.requiredRole}</p>
                    </div>
                                       <div className={styles.roleErrorActions}>
                     <p><strong>To fix this:</strong></p>
                     <ul>
                       <li><strong>Register a new user with role "delivery_team"</strong></li>
                       <li>Or contact your administrator to update your role to "delivery_team"</li>
                       <li>Or use a different dashboard that matches your current role</li>
                     </ul>
                     <p><em>Note: The role "delivery_team" will be converted to "ROLE_DELIVERY" by the backend</em></p>
                   </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className={styles.tabs}>
              <motion.button
                className={`${styles.tab} ${activeTab === 'employees' ? styles.active : ''}`}
                onClick={() => setActiveTab('employees')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUsers /> Employees
              </motion.button>
              <motion.button
                className={`${styles.tab} ${activeTab === 'interviews' ? styles.active : ''}`}
                onClick={() => setActiveTab('interviews')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiCalendar /> Upcoming Interviews
              </motion.button>
              <motion.button
                className={`${styles.tab} ${activeTab === 'completed' ? styles.active : ''}`}
                onClick={() => setActiveTab('completed')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiCheckCircle /> Completed Interviews
              </motion.button>
              <motion.button
                className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
                onClick={() => setActiveTab('analytics')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiBarChart2 /> Analytics
              </motion.button>
              <motion.button
                className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUser /> My Profile
              </motion.button>
            </div>
            
            <motion.div
              className={styles.tabContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
            
            <AnimatePresence>
              {selectedInterviewId && (
                <EvaluationModal
                  selectedInterview={currentSelectedInterview}
                  setSelectedInterview={setSelectedInterviewId}
                  mockInterviews={mockInterviews}
                  onUpdate={handleUpdateFeedback}
                  feedbackFile={feedbackFile}
                  onFileChange={handleFeedbackFileChange}
                  onDownloadFile={downloadFile}
                />
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {showInterviewScheduler && (
                <ScheduleInterviewModal
                  show={showInterviewScheduler}
                  onClose={() => {
                    setShowInterviewScheduler(false);
                    setSelectedEmployeeForScheduling(null);
                  }}
                  onSubmit={handleScheduleInterviewSubmit}
                  employees={employees}
                  selectedEmployee={selectedEmployeeForScheduling}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DeliveryTeamDashboard;