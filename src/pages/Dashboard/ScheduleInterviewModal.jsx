import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiSend, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DeliveryTeamDashboard.module.css';
import { getEmployees } from '../../API/delivery';

const ScheduleInterviewModal = ({
  show,
  onClose,
  onSubmit,
  employees, // Pass employees down
  selectedEmployee: initialSelectedEmployee, // Initial selected employee from parent
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(initialSelectedEmployee || null);
  const [interviewType, setInterviewType] = useState('mock');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewer, setInterviewer] = useState('');
  const [interviewers, setInterviewers] = useState([]);
  const [isLoadingInterviewers, setIsLoadingInterviewers] = useState(false);
  const [client, setClient] = useState('');
  const [level, setLevel] = useState('');
  const [jobDescriptionTitle, setJobDescriptionTitle] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null); // Local error state for validation
  const [isSubmitting, setIsSubmitting] = useState(false); // Local submitting state

  // Reset form when modal is opened or initial employee changes
  useEffect(() => {
    setSelectedEmployee(initialSelectedEmployee || null);
    setInterviewType('mock');
    setInterviewDate('');
    setInterviewer('');
    setClient('');
    setLevel('');
    setJobDescriptionTitle('');
    setMeetingLink('');
    setFiles([]);
    setError(null);
    setIsSubmitting(false);
  }, [show, initialSelectedEmployee]);

  // Fetch interviewers when modal opens
  useEffect(() => {
    if (show) {
      const fetchInterviewers = async () => {
        setIsLoadingInterviewers(true);
        try {
          const interviewersData = await getEmployees('all', 'all');
          setInterviewers(interviewersData);
        } catch (error) {
          console.error('Error fetching interviewers:', error);
          setError('Failed to load interviewers. Please try again.');
        } finally {
          setIsLoadingInterviewers(false);
        }
      };
      fetchInterviewers();
    }
  }, [show]);

  if (!show) return null;

  const validateForm = () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return false;
    }
    if (!interviewDate) {
      setError('Please select interview date and time');
      return false;
    }
    if (!interviewer) {
      setError('Please select an interviewer');
      return false;
    }
    if (interviewType !== 'mock') {
      if (!client) {
        setError('Please enter client name');
        return false;
      }
      if (!level) {
        setError('Please select job level');
        return false;
      }
      if (!jobDescriptionTitle) {
        setError('Please enter job description title');
        return false;
      }
      if (!meetingLink) {
        setError('Please enter meeting link');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    // Pass data up to the parent component
    await onSubmit({
      empId: selectedEmployee.empId, // Ensure we pass empId or id as needed by API
      interviewType,
      date: interviewDate.split('T')[0],
      time: interviewDate.split('T')[1],
      interviewerId: parseInt(interviewer), // Convert string to integer for backend
      client: interviewType !== 'mock' ? client : null,
      level: interviewType !== 'mock' ? level : null,
      jobDescriptionTitle: interviewType !== 'mock' ? jobDescriptionTitle : null,
      meetingLink: interviewType !== 'mock' ? meetingLink : null,
      files: files,
    });
    setIsSubmitting(false);
    // Parent component should handle closing the modal and resetting its own state on success
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modalContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing modal
      >
        <div className={styles.modalHeader}>
          <h3>Schedule Interview</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Employee Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="employeeSelect">Employee *</label>
            {initialSelectedEmployee ? (
               <div className={styles.employeeInfoDisplay}>
                <div className={styles.userAvatarSmall}>
                  <FiUser />
                </div>
                <span>{initialSelectedEmployee.name} ({initialSelectedEmployee.empId})</span>
              </div>
            ) : (
              <select
                id="employeeSelect"
                value={selectedEmployee?.empId || ''}
                onChange={(e) => {
                  const employee = employees.find(emp => emp.empId === e.target.value);
                  setSelectedEmployee(employee);
                }}
                className={styles.input}
                required
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.empId}>{employee.name} ({employee.empId})</option>
                ))}
              </select>
            )}
          </div>

          {/* Interview Type */}
          <div className={styles.formGroup}>
            <label htmlFor="interviewType">Interview Type *</label>
            <select
              id="interviewType"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className={styles.input}
              required
            >
              <option value="mock">Mock Interview</option>
              <option value="client">Client Interview</option>
              <option value="technical">Technical Interview</option>
              <option value="hr">HR Interview</option>
            </select>
          </div>

          {/* Interview Date & Time */}
          <div className={styles.formGroup}>
            <label htmlFor="interviewDateTime">Date & Time *</label>
            <input
              id="interviewDateTime"
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className={styles.input}
              required
            />
          </div>

          {/* Interviewer */}
          <div className={styles.formGroup}>
            <label htmlFor="interviewer">Interviewer *</label>
                         <select
               id="interviewer"
               value={interviewer}
               onChange={(e) => setInterviewer(e.target.value)}
               className={styles.input}
               required
               disabled={isLoadingInterviewers}
             >
               <option value="">Select interviewer</option>
               {interviewers.map((interviewerEmployee) => (
                 <option key={interviewerEmployee.id} value={interviewerEmployee.id}>
                   {interviewerEmployee.user?.fullName || interviewerEmployee.user?.name || 'Unknown Employee'}
                 </option>
               ))}
             </select>
            {isLoadingInterviewers && (
              <small style={{ color: '#666', fontSize: '0.8em' }}>
                Loading interviewers...
              </small>
            )}
          </div>

          {/* Client Interview Fields */}
          {interviewType !== 'mock' && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="clientName">Client Name *</label>
                <input
                  id="clientName"
                  type="text"
                  placeholder="Enter client name"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jobLevel">Level *</label>
                <select
                  id="jobLevel"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={styles.input}
                  required
                >
                  <option value="">Select level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jdTitle">Job Description Title *</label>
                <input
                  id="jdTitle"
                  type="text"
                  placeholder="Enter job description title"
                  value={jobDescriptionTitle}
                  onChange={(e) => setJobDescriptionTitle(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="meetingLink">Meeting Link *</label>
                <input
                  id="meetingLink"
                  type="url"
                  placeholder="Enter meeting link (e.g., https://meet.google.com/xxx-yyyy-zzz)"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  pattern="https?://.+"
                  title="Please enter a valid URL starting with http:// or https://"
                  className={styles.input}
                  required
                />
              </div>
            </>
          )}

          {/* File Upload */}
          <div className={styles.formGroup}>
            <label htmlFor="interviewFiles">Upload Files (Optional)</label>
            <input
              id="interviewFiles"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className={styles.fileInput}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            {files.length > 0 && (
              <div className={styles.fileList}>
                {files.map((file, index) => (
                  <div key={index} className={styles.fileInfo}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.modalActions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
            </button>
            <button
              className={`${styles.button} ${styles.secondary}`}
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ScheduleInterviewModal; 