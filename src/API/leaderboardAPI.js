import axios from 'axios';

// Use Vite's import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Fetches the mock interview performance data for the leaderboard
 * @returns {Promise<Array>} Array of performance data objects containing:
 *   - employeeId: string
 *   - employeeName: string
 *   - technology: string
 *   - resourceType: string
 *   - totalRating: number
 * @throws {Error} If the API request fails
 */
export const getMockInterviewPerformance = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/delivery/mock-interviews/performance`, {
      headers: {
        'Content-Type': 'application/json',
        // Include authorization header if needed
        ...(localStorage.getItem('token') && {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        })
      }
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to fetch mock interview performance data');
    }
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data?.message || 'Failed to fetch performance data');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up request');
    }
  }
};

/**
 * Formats the performance data for display in the leaderboard
 * @param {Array} performanceData - Raw performance data from the API
 * @returns {Array} Formatted performance data with additional computed fields
 */
export const formatPerformanceData = (performanceData) => {
  if (!Array.isArray(performanceData)) {
    return [];
  }

  return performanceData.map((item, index) => ({
    rank: index + 1,
    employeeId: item.employeeId || 'N/A',
    employeeName: item.employeeName || 'Unknown',
    technology: item.technology || 'N/A',
    resourceType: item.resourceType || 'N/A',
    totalRating: item.totalRating || 0,
    // Calculate percentage score (assuming max possible score is 20 - 10 for technical + 10 for communication)
    scorePercentage: ((item.totalRating || 0) / 20) * 100
  }));
};

/**
 * Filters performance data by technology
 * @param {Array} performanceData - Performance data to filter
 * @param {string} technology - Technology to filter by
 * @returns {Array} Filtered performance data
 */
export const filterByTechnology = (performanceData, technology) => {
  if (!technology || technology === 'all') {
    return performanceData;
  }
  return performanceData.filter(item => 
    item.technology?.toLowerCase() === technology.toLowerCase()
  );
};

/**
 * Filters performance data by resource type
 * @param {Array} performanceData - Performance data to filter
 * @param {string} resourceType - Resource type to filter by
 * @returns {Array} Filtered performance data
 */
export const filterByResourceType = (performanceData, resourceType) => {
  if (!resourceType || resourceType === 'all') {
    return performanceData;
  }
  return performanceData.filter(item => 
    item.resourceType?.toLowerCase() === resourceType.toLowerCase()
  );
};

// Export all functions as a single object
export default {
  getMockInterviewPerformance,
  formatPerformanceData,
  filterByTechnology,
  filterByResourceType
};
