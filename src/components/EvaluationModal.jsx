import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiX } from 'react-icons/fi';
import styles from '../pages/Dashboard/DeliveryTeamDashboard.module.css';
import { updateMockInterviewFeedback } from '../API/delivery';

const EvaluationModal = ({
  selectedInterview,
  setSelectedInterview,
  mockInterviews,
  onUpdate,
  feedbackFile,
  onFileChange,
  onDownloadFile
}) => {
  const [formData, setFormData] = useState({
    technicalFeedback: '',
    communicationFeedback: '',
    technicalRating: 0,
    communicationRating: 0,
    sentToSales: false
  });

  useEffect(() => {
    if (selectedInterview) {
      setFormData({
        technicalFeedback: selectedInterview.technicalFeedback || '',
        communicationFeedback: selectedInterview.communicationFeedback || '',
        technicalRating: selectedInterview.technicalRating || 0,
        communicationRating: selectedInterview.communicationRating || 0,
        sentToSales: selectedInterview.sentToSales || false
      });
    }
  }, [selectedInterview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate({
        interviewId: selectedInterview.id,
        ...formData
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (!selectedInterview) return null;

  const getScoreColor = (score) => {
    if (score >= 8) return styles.scoreHigh;
    if (score >= 6) return styles.scoreMedium;
    return styles.scoreLow;
  };

  return (
    <div className={styles.modalOverlay} onClick={() => setSelectedInterview(null)}>
      <motion.div
        className={styles.modalContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>{selectedInterview.employee?.user?.fullName || 'Unknown Employee'}'s Evaluation</h3>
          <button
            className={styles.closeButton}
            onClick={() => setSelectedInterview(null)}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.profileDetails}>
            <div className={styles.profileSummary}>
              <div className={styles.profileBadge}>
                <div className={styles.userAvatarLarge}>
                  <FiUser />
                </div>
                <div>
                  <h4>{selectedInterview.employee?.user?.fullName || 'Unknown Employee'}</h4>
                  <div className={styles.profileMeta}>
                    <span className={`${styles.techBadge} ${styles[selectedInterview.employee?.technology?.replace(' ', '')]}`}>
                      {selectedInterview.employee?.technology || 'Unknown'}
                    </span>
                    <span className={`${styles.resourceBadge} ${styles[selectedInterview.employee?.resourceType]}`}>
                      {selectedInterview.employee?.resourceType || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.profileStats}>
                <div className={styles.statItem}>
                  <span>Mock Interviews</span>
                  <strong>
                    N/A
                  </strong>
                </div>
                <div className={styles.statItem}>
                  <span>Avg Technical</span>
                  <strong>
                    N/A
                  </strong>
                </div>
                <div className={styles.statItem}>
                  <span>Avg Communication</span>
                  <strong>
                    N/A
                  </strong>
                </div>
              </div>
            </div>
            
            <div className={styles.feedbackSection}>
              <h4>Interview Feedback</h4>
              
              <div className={styles.formGroup}>
                <label>Technical Feedback</label>
                <textarea
                  value={formData.technicalFeedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, technicalFeedback: e.target.value }))}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Communication Feedback</label>
                <textarea
                  value={formData.communicationFeedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, communicationFeedback: e.target.value }))}
                  required
                />
              </div>
              
              <div className={styles.ratingGroup}>
                <div className={styles.formGroup}>
                  <label>Technical Rating (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.technicalRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, technicalRating: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Communication Rating (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.communicationRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, communicationRating: parseInt(e.target.value) }))}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.sentToSales}
                    onChange={(e) => setFormData(prev => ({ ...prev, sentToSales: e.target.checked }))}
                  />
                  Send to Sales Team
                </label>
              </div>
              
              <div className={styles.formGroup}>
                <label>Upload Feedback File (Optional)</label>
                <input
                  type="file"
                  onChange={onFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className={styles.fileInput}
                />
                {feedbackFile && (
                  <p className={styles.fileInfo}>Selected: {feedbackFile.name}</p>
                )}
              </div>
              
              {selectedInterview.fileS3Keys && selectedInterview.fileS3Keys.length > 0 && (
                <div className={styles.formGroup}>
                  <label>Interview Files</label>
                  <div className={styles.fileList}>
                    {selectedInterview.fileS3Keys.map((s3Key, index) => (
                      <button
                        key={index}
                        type="button"
                        className={styles.downloadButton}
                        onClick={() => onDownloadFile(s3Key)}
                      >
                        Download File {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setSelectedInterview(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default React.memo(EvaluationModal); 