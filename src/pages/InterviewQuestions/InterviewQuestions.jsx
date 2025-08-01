import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShare2, FiHelpCircle } from 'react-icons/fi';
import styles from './InterviewQuestions.module.css';
import { getInterviewQuestions, addInterviewQuestion } from '../../API/employee';
import { toast } from 'react-toastify';

const InterviewQuestions = () => {
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [filteredInterviewQuestions, setFilteredInterviewQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    technology: '',
    user: '',
    date: new Date().toISOString()
  });

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const questions = await getInterviewQuestions();
        setInterviewQuestions(questions);
        setFilteredInterviewQuestions(questions);
      } catch (error) {
        console.error('Error fetching interview questions:', error);
        toast.error('Failed to fetch interview questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addInterviewQuestion(
        newQuestion.technology,
        newQuestion.question,
        newQuestion.user
      );
      const updatedQuestions = await getInterviewQuestions();
      setInterviewQuestions(updatedQuestions);
      setFilteredInterviewQuestions(updatedQuestions);
      setShowQuestionModal(false);
      setNewQuestion({
        question: '',
        technology: '',
        user: '',
        date: new Date().toISOString()
      });
      toast.success('Question added successfully!');
    } catch (error) {
      console.error('Error adding question:', error);
      toast.error('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      className={styles.questionsContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.questionsHeader}>
        <h2>Interview Questions Bank</h2>
      </div>

      <div className={styles.questionsList}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading questions...</p>
          </div>
        ) : filteredInterviewQuestions.length > 0 ? (
          <ol>
            {filteredInterviewQuestions.map(question => (
              <li key={question.id} className={styles.questionCard}>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                >
                  <div className={styles.questionMeta}>
                    <span className={styles.techBadge}>{question.technology}</span>
                    <span className={styles.questionDate}>{formatDate(question.date)}</span>
                    <span className={styles.questionUser}>by {question.user}</span>
                  </div>
                  <div className={styles.questionText}>
                    <ol>
                      {question.question.split('\n').map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ol>
                  </div>
                </motion.div>
              </li>
            ))}
          </ol>
        ) : (
          <motion.div className={styles.emptyState}>
            <FiHelpCircle size={48} />
            <p>No Questions Found</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showQuestionModal && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowQuestionModal(false)}
          >
            <motion.div 
              className={styles.modalContent}
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h3>Share an Interview Question</h3>
              <form onSubmit={handleAddQuestion}>
                <div className={styles.formGroup}>
                  <label>Technology:</label>
                  <input
                    type="text"
                    name="technology"
                    value={newQuestion.technology}
                    onChange={handleQuestionChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Question:</label>
                  <textarea
                    name="question"
                    value={newQuestion.question}
                    onChange={handleQuestionChange}
                    placeholder="Enter the interview question..."
                    rows={4}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>User:</label>
                  <input
                    type="text"
                    name="user"
                    value={newQuestion.user}
                    onChange={handleQuestionChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.secondaryButton}
                    onClick={() => setShowQuestionModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.primaryButton}
                    disabled={loading}
                  >
                    {loading ? 'Sharing...' : 'Share Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InterviewQuestions; 