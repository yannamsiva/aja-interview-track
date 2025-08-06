import React, { useState, useEffect } from "react";
import styles from "./sales.module.css";
import {
  FiUsers,
  FiCalendar,
  FiFileText,
  FiCheck,
  FiX,
  FiSend,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiBarChart2,
  FiPieChart,
  FiUpload,
  FiDownload,
  FiMessageSquare,
  FiMail,
  FiUserPlus,
  FiBriefcase,
  FiBook,
  FiUserCheck,
  FiShare2,
  FiToggleLeft,
  FiToggleRight,
  FiRefreshCw,
  FiUser,
  FiEdit,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiFile,
  FiPlus,
  FiTrash2,
  FiEye,
  FiClock,
  FiMapPin,
  FiPhone,
  FiGlobe,
  FiStar,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  getDeployedEmployees,
  updateProfilePicture,
  getProfilePicture,
  getCurrentUser,
} from "../../API/sales";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { debugAuthStatus, checkSalesTeamPermission } from "../../utils/authDebug";

const ITEMS_PER_PAGE = 10;

const LoadingState = () => (
  <div className={styles.loadingState}>
    <div className={styles.spinner}></div>
    <p>Loading...</p>
  </div>
);

const ErrorState = ({ error }) => {
  if (!error) return null;

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? error.message
      : String(error);
  const type =
    typeof error === "object" && error !== null && "type" in error
      ? error.type
      : "error";
  const detailedError =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    "data" in error.response
      ? error.response.data
      : null;

  return (
    <div className={`${styles.errorContainer} ${styles[type]}`}>
      <p>{message}</p>
      {detailedError && (
        <p className={styles.detailedErrorMessage}>{detailedError}</p>
      )}
    </div>
  );
};

const Pagination = ({ totalItems, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={`${styles.button} ${styles.secondary}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <FiChevronLeft /> Previous
      </button>

      <div className={styles.pageNumbers}>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            className={`${styles.pageButton} ${
              currentPage === index + 1 ? styles.active : ""
            }`}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button
        className={`${styles.button} ${styles.secondary}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next <FiChevronRight />
      </button>
    </div>
  );
};

const ClientModal = ({
  show,
  onClose,
  onSubmit,
  fields,
  onFieldChange,
  error,
  success,
  loading,
  onTechChange,
}) => {
  if (!show) return null;
  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <form onSubmit={onSubmit}>
          <div className={styles.modalHeader}>
            <h3>Add New Client</h3>
            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalContent}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}
            <div className={styles.formGroup}>
              <label>Client Name *</label>
              <input
                type="text"
                value={fields.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Enter client name"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Contact Email *</label>
              <input
                type="email"
                value={fields.contactEmail}
                onChange={(e) => onFieldChange("contactEmail", e.target.value)}
                placeholder="Enter contact email"
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Active Positions</label>
              <input
                type="number"
                min="0"
                value={fields.activePositions}
                onChange={(e) =>
                  onFieldChange(
                    "activePositions",
                    parseInt(e.target.value) || 0
                  )
                }
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Technologies *</label>
              <div className={styles.technologyGrid}>
                {[
                  "Java",
                  "Python",
                  ".NET",
                  "DevOps",
                  "SalesForce",
                  "UI",
                  "Testing",
                ].map((tech) => (
                  <label key={tech} className={styles.technologyCheckbox}>
                    <input
                      type="checkbox"
                      checked={fields.technologies.includes(tech)}
                      onChange={() => onTechChange(tech)}
                    />
                    <span>{tech}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.button} ${styles.secondary}`}
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`${styles.button} ${styles.primary}`}
                type="submit"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Client"}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ScheduleInterviewModal = ({
  show,
  onClose,
  onSubmit,
  selectedCandidates,
  interviewDetails,
  setInterviewDetails,
  clients,
  jobDescriptions,
}) => {
  const [error, setError] = useState("");
  const [interviewFile, setInterviewFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!interviewDetails.client?.trim()) {
        throw new Error("Client name is required");
      }
      if (!interviewDetails.date) {
        throw new Error("Interview date is required");
      }
      if (!interviewDetails.time) {
        throw new Error("Interview time is required");
      }
      if (!interviewDetails.level) {
        throw new Error("Interview level is required");
      }
      if (!interviewDetails.jobDescriptionTitle?.trim()) {
        throw new Error("Job description title is required");
      }
      if (!interviewDetails.meetingLink?.trim()) {
        throw new Error("Meeting link is required");
      }
      if (!interviewDetails.interviewerEmail?.trim()) {
        throw new Error("Interviewer email is required");
      }
      if (!interviewFile) {
        throw new Error("File upload is required");
      }
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(interviewFile.type)) {
        throw new Error("File must be a PDF, JPEG, or PNG");
      }

      onSubmit(
        selectedCandidates[0].empId,
        interviewDetails,
        interviewFile
      );
      onClose();
    } catch (err) {
      setError(err.message || "An unknown error occurred. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.modalHeader}>
            <h3>Schedule Client Interview</h3>
            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalContent}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label>Candidate(s)</label>
              <input
                type="text"
                value={selectedCandidates
                  .map((c) => c.user?.fullName || "N/A")
                  .join(", ")}
                className={styles.input}
                readOnly
              />
            </div>

            <div className={styles.formGroup}>
              <label>Client *</label>
              <select
                value={interviewDetails.client || ""}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    client: e.target.value,
                  })
                }
                className={styles.input}
                required
              >
                <option value="">Select Client</option>
                {clients &&
                  clients.map((client) => (
                    <option key={client.id} value={client.name}>
                      {client.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Job Description *</label>
              <select
                value={interviewDetails.jobDescriptionTitle || ""}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    jobDescriptionTitle: e.target.value,
                  })
                }
                className={styles.input}
                required
              >
                <option value="">Select JD</option>
                {jobDescriptions &&
                  jobDescriptions.map((jd) => (
                    <option key={jd.id} value={jd.title}>
                      {jd.title} ({jd.clientName})
                    </option>
                  ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Date *</label>
              <input
                type="date"
                value={interviewDetails.date || ""}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    date: e.target.value,
                  })
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Time *</label>
              <input
                type="time"
                value={interviewDetails.time || ""}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    time: e.target.value,
                  })
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Level *</label>
              <select
                value={interviewDetails.level || ""}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    level: parseInt(e.target.value),
                  })
                }
                className={styles.input}
                required
              >
                <option value="">Select Level</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Meeting Link *</label>
              <input
                type="url"
                value={interviewDetails.meetingLink || ""}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    meetingLink: e.target.value,
                  })
                }
                className={styles.input}
                required
                placeholder="Enter meeting link"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Interviewer Email *</label>
              <input
                type="email"
                value={interviewDetails.interviewerEmail || ""}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    interviewerEmail: e.target.value,
                  })
                }
                className={styles.input}
                required
                placeholder="Enter interviewer email"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Upload File *</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setInterviewFile(e.target.files[0])}
                className={styles.input}
                required
              />
              {interviewFile && (
                <span style={{ fontSize: "0.9em" }}>
                  {interviewFile.name}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={interviewDetails.deployedStatus}
                  onChange={(e) =>
                    setInterviewDetails({
                      ...interviewDetails,
                      deployedStatus: e.target.checked,
                    })
                  }
                />
                <span>Mark as Deployed</span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.button} ${styles.secondary}`}
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`${styles.button} ${styles.primary}`}
                type="submit"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const FeedbackModal = ({ show, onClose, interview, onSubmit, salesUserData }) => {
  const [techScore, setTechScore] = useState(interview.technicalScore || 0);
  const [commScore, setCommScore] = useState(interview.communicationScore || 0);
  const [feedback, setFeedback] = useState(interview.feedback || "");
  const [deployedStatus, setDeployedStatus] = useState(interview.deployedStatus || false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

  const hasUpdatePermission = () => {
    const role = salesUserData?.role;
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    
    // Check both the component state and localStorage
    const effectiveRole = role || userRole;
    
    console.log('Permission check:', {
      componentRole: role,
      localStorageRole: userRole,
      effectiveRole,
      hasToken: !!token
    });
    
    return effectiveRole === "ROLE_SALES" || effectiveRole === "ROLE_ADMIN";
  };



  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasUpdatePermission()) {
      toast.error("You don't have permission to update interviews");
      return;
    }

    setError("");

    // Validate scores
    const techScoreNum = Number(techScore);
    const commScoreNum = Number(commScore);

    if (isNaN(techScoreNum)) {
      setError("Technical score must be a number");
      return;
    }
    if (isNaN(commScoreNum)) {
      setError("Communication score must be a number");
      return;
    }

    // Validate file if selected
    if (selectedFile && !['application/pdf', 'image/jpeg', 'image/png'].includes(selectedFile.type)) {
      setError("File must be a PDF, JPEG, or PNG");
      return;
    }

    const feedbackData = {
      result: "completed",
      feedback,
      technicalScore: techScoreNum,
      communicationScore: commScoreNum,
      deployedStatus: Boolean(deployedStatus)
    };

    onSubmit(
      interview.id,
      feedbackData,
      selectedFile
    );
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.modalHeader}>
            <h3>Update Feedback for {interview.candidateName}</h3>
            <button
              className={styles.closeButton}
              type="button"
              onClick={onClose}
            >
              <FiX />
            </button>
          </div>
          <div className={styles.modalContent}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label>Technical Score (0-10) *</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={techScore}
                onChange={(e) => setTechScore(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Communication Score (0-10) *</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={commScore}
                onChange={(e) => setCommScore(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Detailed Feedback *</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter detailed feedback here..."
                className={styles.textarea}
                rows="5"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Upload Feedback File (Optional)</label>
              <div className={styles.fileUploadContainer}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className={styles.fileInput}
                  id="feedback-file"
                />
                <label htmlFor="feedback-file" className={styles.fileUploadLabel}>
                  <FiUpload className={styles.uploadIcon} />
                  {selectedFile ? selectedFile.name : "Choose a file (PDF, JPG, PNG)"}
                </label>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className={styles.removeFileButton}
                    title="Remove file"
                  >
                    <FiX />
                  </button>
                )}
              </div>
              {selectedFile && (
                <div className={styles.fileInfo}>
                  <FiFile className={styles.fileIcon} />
                  <span>{selectedFile.name}</span>
                  <span className={styles.fileSize}>
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={deployedStatus}
                  onChange={(e) => setDeployedStatus(e.target.checked)}
                />
                <span>Mark as Deployed</span>
              </label>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={`${styles.button} ${styles.secondary}`}
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`${styles.button} ${styles.primary}`}
                type="submit"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const SalesTeamDashboard = () => {
  // Main state
  const [activeTab, setActiveTab] = useState("jds");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedJD, setSelectedJD] = useState(null);
  const [sendFeedback, setSendFeedback] = useState(false);

  // Filter states
  const [filterTech, setFilterTech] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterResourceType, setFilterResourceType] = useState("all");
  const [filterInterviewLevel, setFilterInterviewLevel] = useState("all");

  // Data states
  const [candidates, setCandidates] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [clientInterviews, setClientInterviews] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [deployedEmployees, setDeployedEmployees] = useState([]);
  const [interviewCount, setInterviewCount] = useState(0);

  // Modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedInterviewForFeedback, setSelectedInterviewForFeedback] =
    useState(null);

  // Form states
  const [clientModalFields, setClientModalFields] = useState({
    name: "",
    contactEmail: "",
    activePositions: 0,
    technologies: [],
  });
  const [jdModalFields, setJDModalFields] = useState({
    title: "",
    client: "",
    technology: "",
    resourceType: "",
    description: "",
    receivedDate: "",
    deadline: "",
  });
  const [jdModalFile, setJDModalFile] = useState(null);
  const initialInterviewDetails = {
    level: 1,
    date: "",
    time: "",
    client: "",
    jobDescriptionTitle: "",
    meetingLink: "",
    interviewerEmail: "",
    deployedStatus: false,
  };
  const [interviewDetails, setInterviewDetails] = useState(
    initialInterviewDetails
  );

  // Selection states
  const [selectedForInterview, setSelectedForInterview] = useState([]);
  const [bulkSelectedCandidates, setBulkSelectedCandidates] = useState([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeploymentLoading, setIsDeploymentLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientModalError, setClientModalError] = useState("");
  const [clientModalSuccess, setClientModalSuccess] = useState("");
  const [clientModalLoading, setClientModalLoading] = useState(false);
  const [jdModalError, setJDModalError] = useState("");
  const [jdModalSuccess, setJDModalSuccess] = useState("");
  const [jdModalLoading, setJDModalLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // User data
  const [salesUserData, setSalesUserData] = useState({
    fullName: "",
    email: "",
    role: "ROLE_SALES",
    empId: "",
    id: "",
    technology: "",
    resourceType: "",
    level: "",
    status: "Active",
  });
  const [profilePic, setProfilePic] = useState(null);
  
  // Fetched interview details
  const [fetchedInterviewDetails, setFetchedInterviewDetails] = useState(null);

  // Fetch all data on component mount
  useEffect(() => {
    fetchData();
    fetchUserData();
    fetchInterviewCount();
  }, []);

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up profile picture object URL on component unmount
      if (profilePic && profilePic.startsWith('blob:')) {
        URL.revokeObjectURL(profilePic);
      }
    };
  }, [profilePic]);

  const fetchInterviewCount = async () => {
    try {
      const count = await getClientInterviewCount();
      setInterviewCount(count);
    } catch (error) {
      console.error("Error fetching interview count:", error);
      toast.error(error.message || "Failed to fetch interview count");
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // First get basic user data from JWT
      const decoded = jwtDecode(token);
      const email = decoded.sub || decoded.email || localStorage.getItem("userEmail") || "N/A";
      const role = decoded.role || localStorage.getItem("userRole") || "N/A";
      const fullName = email !== "N/A" ? email.split("@")[0] : "N/A";

      // Try to get current user data from API
      let currentUser = null;
      try {
        currentUser = await getCurrentUser();
        console.log('Current user data from API:', currentUser);
      } catch (apiError) {
        console.warn('Could not fetch current user from API, using JWT data:', apiError.message);
      }

      // Use API data if available, otherwise fall back to JWT data
      const userData = currentUser || {
        fullName: fullName,
        email: email,
        role: role,
        empId: decoded.empId || "",
        id: decoded.id || "",
        technology: decoded.technology || "",
        resourceType: decoded.resourceType || "",
        level: decoded.level || "",
        status: decoded.status || "Active",
      };

      setSalesUserData(userData);

      // Fetch profile picture if user ID exists
      const userIdToUse = userData.id || userData.empId;
      if (userIdToUse) {
        try {
          const pictureBlob = await getProfilePicture(userIdToUse);
          if (pictureBlob && pictureBlob instanceof Blob) {
            const imageUrl = URL.createObjectURL(pictureBlob);
            setProfilePic(imageUrl);
          } else {
            console.error("getProfilePicture did not return a Blob:", pictureBlob);
            setProfilePic(null);
          }
        } catch (pictureError) {
          console.error("Error fetching profile picture:", pictureError);
          setProfilePic(null);
        }
      }
    } catch (err) {
      console.error("Error in fetchUserData:", err);
      toast.error("Failed to load user data. Please refresh the page.");
      setError("Failed to load user data");
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        candidatesData,
        interviewsData,
        clientsData,
        jobDescriptionsData,
        deployedEmployeesData,
        resumesData
      ] = await Promise.all([
        getCandidates(filterTech, filterStatus, filterResourceType),
        getClientInterviews(searchTerm),
        getClients(searchTerm),
        getAllJobDescriptions(),
        getDeployedEmployees(),
        getAllEmployeeResumes()
      ].map(p => p.catch(error => {
        console.error("Error in fetchData:", error);
        toast.error(`Failed to fetch some data: ${error.message}`);
        return null;
      })));

      // Update state only if data was successfully fetched
      if (candidatesData) setCandidates(candidatesData);
      if (interviewsData) setClientInterviews(interviewsData);
      if (clientsData) setClients(clientsData);
      if (jobDescriptionsData) setJobDescriptions(jobDescriptionsData);
      if (deployedEmployeesData) setDeployedEmployees(deployedEmployeesData);
      if (resumesData) setResumes(resumesData);

      // Debug logging
      console.log("Data fetched:", {
        candidates: candidatesData?.length || 0,
        interviews: interviewsData?.length || 0,
        clients: clientsData?.length || 0,
        jobDescriptions: jobDescriptionsData?.length || 0,
        deployedEmployees: deployedEmployeesData?.length || 0,
        resumes: resumesData?.length || 0
      });

    } catch (error) {
      console.error("Error in fetchData:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      await fetchInterviewCount();
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = salesUserData.id || salesUserData.empId;
    if (!userId) {
      toast.error("User ID not available. Please refresh the page and try again.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG and PNG images are allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info("Updating profile picture...");

      // Update profile picture using the API
      const response = await updateProfilePicture(userId, file);

      if (response) {
        // Fetch updated profile picture
        const pictureBlob = await getProfilePicture(userId);
        if (pictureBlob && pictureBlob instanceof Blob) {
          if (profilePic && profilePic.startsWith('blob:')) {
            URL.revokeObjectURL(profilePic);
          }
          const imageUrl = URL.createObjectURL(pictureBlob);
          setProfilePic(imageUrl);
          toast.success("Profile picture updated successfully");
        } else {
          console.error("getProfilePicture did not return a Blob:", pictureBlob);
          toast.error("Failed to fetch updated profile picture");
        }
      } else {
        console.error("updateProfilePicture response:", response);
        toast.error("Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleInterview = async (empId, details, file) => {
    if (!empId || !details) {
      toast.error("Missing required interview details");
      return;
    }

    // Validate required fields according to backend requirements
    const requiredFields = {
      client: "Client name",
      date: "Interview date",
      time: "Interview time",
      level: "Interview level",
      jobDescriptionTitle: "Job description title",
      meetingLink: "Meeting link",
      interviewerEmail: "Interviewer email"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!details[field]) {
        toast.error(`${label} is required`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      toast.info("Scheduling interview...");

      const response = await scheduleClientInterview(
        empId,
        details.client,
        details.date,
        details.time,
        details.level,
        details.jobDescriptionTitle,
        details.meetingLink,
        details.interviewerEmail,
        details.deployedStatus || false,
        file
      );

      if (response) {
        setClientInterviews(prev => [...prev, response]);
        setShowInterviewScheduler(false);
        setSelectedForInterview([]);
        setInterviewDetails(initialInterviewDetails);
        toast.success("Interview scheduled successfully!");
        await fetchData();
        await fetchInterviewCount();
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error(error.message || "Failed to schedule interview");
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadJD = async (jdId) => {
    try {
      const blob = await downloadJobDescription(jdId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job_description_${jdId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Job description downloaded successfully');
    } catch (error) {
      console.error('Error downloading job description:', error);
      toast.error(error.message || 'Failed to download job description');
    }
  };

  const handleDownloadFeedbackFile = async (interviewId) => {
    try {
      const blob = await downloadFeedbackFile(interviewId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feedback_file_${interviewId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Feedback file downloaded successfully');
    } catch (error) {
      console.error('Error downloading feedback file:', error);
      toast.error(error.message || 'Failed to download feedback file');
    }
  };

  const handleDownloadResume = async (employeeId) => {
    if (!employeeId) {
      toast.error("Employee ID is required");
      return;
    }

    try {
      toast.info("Downloading resume...");
      const employees = await getAllEmployeeResumes();
      const employee = employees.find(emp => emp.empId === employeeId);
      if (!employee || !employee.resumeUrl) {
        throw new Error("Resume not found for this employee");
      }
      const response = await fetch(employee.resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_${employeeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Resume downloaded successfully");
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error(error.message || "Failed to download resume");
    }
  };

  const handleDeleteJD = async (jdId) => {
    if (!jdId) {
      toast.error("Job description ID is required");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this job description?")) {
      return;
    }

    try {
      toast.info("Deleting job description...");
      await deleteJobDescription(jdId);
      setJobDescriptions((prev) => prev.filter((jd) => jd.id !== jdId));
      toast.success("Job description deleted successfully");
    } catch (error) {
      console.error("Error deleting job description:", error);
      toast.error(error.message || "Failed to delete job description");
    }
  };

  const handleClientModalSubmit = async (e) => {
    e.preventDefault();
    setClientModalError("");
    setClientModalSuccess("");

    // Validate required fields according to backend requirements
    if (!clientModalFields.name.trim()) {
      setClientModalError("Client name is required");
      return;
    }
    if (!clientModalFields.contactEmail.trim()) {
      setClientModalError("Contact email is required");
      return;
    }
    if (!clientModalFields.contactEmail.includes("@")) {
      setClientModalError("Invalid email format");
      return;
    }
    if (clientModalFields.technologies.length === 0) {
      setClientModalError("At least one technology must be selected");
      return;
    }

    setClientModalLoading(true);
    try {
      toast.info("Adding new client...");

      const response = await addClient({
        name: clientModalFields.name,
        contactEmail: clientModalFields.contactEmail,
        activePositions: clientModalFields.activePositions,
        technologies: clientModalFields.technologies
      });

      if (response) {
        setClients(prev => [...prev, response]);
        setClientModalSuccess("Client added successfully!");
        toast.success("Client added successfully!");
        
        // Reset form and close modal after success
        setTimeout(() => {
          setShowClientModal(false);
          setClientModalFields({
            name: "",
            contactEmail: "",
            activePositions: 0,
            technologies: [],
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Error adding client:", error);
      setClientModalError(error.message || "Failed to add client");
      toast.error(error.message || "Failed to add client");
    } finally {
      setClientModalLoading(false);
    }
  };

  const handleJDModalSubmit = async (e) => {
    e.preventDefault();
    setJDModalError("");
    setJDModalSuccess("");

    // Check authentication before making the request
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      toast.error('Authentication required. Please log in again.');
      setJDModalError('No authentication token found');
      return;
    }

    if (!userRole || (userRole !== 'ROLE_SALES' && userRole !== 'ROLE_ADMIN')) {
      toast.error('Insufficient permissions. You need SALES_TEAM or ADMIN role to add job descriptions.');
      setJDModalError('Insufficient permissions');
      return;
    }

    // Validate required fields
    if (!jdModalFields.title.trim() || !jdModalFields.client || 
        !jdModalFields.technology || !jdModalFields.resourceType || !jdModalFile) {
      setJDModalError("Please fill all required fields and select a file");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(jdModalFile.type)) {
      setJDModalError("Invalid file type. Please upload a PDF or Word document");
      return;
    }

    if (jdModalFile.size > maxSize) {
      setJDModalError("File size too large. Maximum size is 5MB");
      return;
    }

    setJDModalLoading(true);
    try {
      console.log('Attempting to add job description with role:', userRole);
      toast.info("Uploading job description...");

      const jdData = {
        title: jdModalFields.title,
        client: jdModalFields.client,
        technology: jdModalFields.technology,
        resourceType: jdModalFields.resourceType,
        description: jdModalFields.description || "",
        receivedDate: jdModalFields.receivedDate || new Date().toISOString().split("T")[0],
        deadline: jdModalFields.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        file: jdModalFile
      };

      const response = await addJobDescription(jdData);

      if (response) {
        setJobDescriptions((prev) => [...prev, response]);
        setJDModalSuccess("Job description uploaded successfully!");
        toast.success("Job description uploaded successfully!");

        // Reset form and close modal after success
        setTimeout(() => {
          setSelectedJD(null);
          setJDModalFields({
            title: "",
            client: "",
            technology: "",
            resourceType: "",
            description: "",
            receivedDate: "",
            deadline: "",
          });
          setJDModalFile(null);
        }, 1500);
      }
    } catch (error) {
      console.error("Error uploading job description:", error);
      if (error.message.includes('Access denied')) {
        toast.error(error.message, {
          duration: 5000,
          action: {
            label: 'Contact Admin',
            onClick: () => {
              window.location.href = 'mailto:admin@example.com?subject=Permission%20Request%20for%20Job%20Description%20Upload';
            }
          }
        });
      } else if (error.message.includes('Authentication required')) {
        toast.error('Please log in again to continue.', {
          duration: 5000,
          icon: '🔐'
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        toast.error(error.message || "Failed to upload job description");
      }
      setJDModalError(error.message || "Failed to upload job description");
    } finally {
      setJDModalLoading(false);
    }
  };

  const handleDeploymentStatusChange = async (
    employeeId,
    readyForDeployment
  ) => {
    try {
      setIsDeploymentLoading(true);
      // In a real implementation, you would call an API to update the status
      // await updateReadyForDeployment(employeeId, readyForDeployment);
      toast.success(
        `Employee ${
          readyForDeployment ? "marked as" : "unmarked from"
        } ready for deployment`
      );
      await fetchData();
    } catch (error) {
      console.error("Error updating deployment status:", error);
      toast.error(error.message || "Failed to update deployment status");
    } finally {
      setIsDeploymentLoading(false);
    }
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case "technology":
        setFilterTech(value);
        break;
      case "status":
        setFilterStatus(value);
        break;
      case "resourceType":
        setFilterResourceType(value);
        break;
      case "level":
        setFilterInterviewLevel(value);
        break;
      default:
        break;
    }
    fetchData();
  };

  const filterCandidates = (candidates) => {
    return candidates.filter((candidate) => {
      const matchesTech =
        filterTech === "all" || candidate.technology === filterTech;
      const matchesStatus =
        filterStatus === "all" || candidate.status === filterStatus;
      const matchesResourceType =
        filterResourceType === "all" ||
        candidate.resourceType === filterResourceType;
      return matchesTech && matchesStatus && matchesResourceType;
    });
  };

  const filterInterviews = (interviews) => {
    return interviews.filter((interview) => {
      const matchesLevel =
        filterInterviewLevel === "all" ||
        interview.level === filterInterviewLevel;
      return matchesLevel;
    });
  };

  const handleUpdateFeedback = async (interviewId, feedbackData, file = null) => {
    setIsLoading(true);
    setError(null);
    
    // Check authentication before making the request
    const token = localStorage.getItem('jwt_token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      setError('No authentication token found');
      setIsLoading(false);
      return;
    }
    
    if (!userRole || (userRole !== 'ROLE_SALES' && userRole !== 'ROLE_ADMIN')) {
      toast.error('Insufficient permissions. You need SALES_TEAM or ADMIN role to update interviews.');
      setError('Insufficient permissions');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Attempting to update feedback with role:', userRole);
      const response = await updateClientInterview(interviewId, feedbackData, file);
      
      if (response) {
        // Update the interviews list with the new feedback
        setClientInterviews(prev => 
          prev.map(interview => 
            interview.id === interviewId 
              ? { ...interview, ...response }
              : interview
          )
        );
        
        toast.success('Interview feedback updated successfully');
        setShowFeedbackModal(false);
        setSelectedInterviewForFeedback(null);
        await fetchInterviewCount();
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      
      // Handle specific error messages from backend
      if (error.message.includes('Access denied')) {
        toast.error(error.message, {
          duration: 5000,
          action: {
            label: 'Contact Admin',
            onClick: () => {
              window.location.href = 'mailto:admin@example.com?subject=Permission%20Request%20for%20Client%20Interview%20Updates';
            }
          }
        });
      } else if (error.message.includes('Authentication required')) {
        toast.error('Please log in again to continue.', {
          duration: 5000,
          icon: '🔐'
        });
        // Redirect to login after a delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else if (error.message.includes('Invalid data types')) {
        toast.error('Invalid data format. Please ensure all fields are in the correct format.');
      } else {
        toast.error(error.message || 'Failed to update interview feedback');
      }
      
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetClientInterviewById = async (interviewId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!interviewId) {
        throw new Error('Interview ID is required');
      }
      
      console.log('Fetching client interview with ID:', interviewId);
      const interview = await getClientInterviewById(interviewId);
      
      if (interview) {
        setFetchedInterviewDetails(interview);
        toast.success('Client interview details loaded successfully');
        return interview;
      } else {
        throw new Error('Interview not found');
      }
    } catch (error) {
      console.error('Error fetching client interview:', error);
      
      if (error.message.includes('Interview not found')) {
        toast.error(`Interview with ID ${interviewId} not found`);
      } else if (error.message.includes('Authentication required')) {
        toast.error('Please log in again to continue.');
      } else if (error.message.includes('Access denied')) {
        toast.error('You do not have permission to access this interview.');
      } else {
        toast.error(error.message || 'Failed to fetch interview details');
      }
      
      setError(error.message);
      setFetchedInterviewDetails(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const ClientsTab = () => {
    const filteredClients = clients.filter(
      (client) =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.contentSection}
      >
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => setShowClientModal(true)}
          >
            <FiUserPlus /> Add New Client
          </button>
        </div>

        {filteredClients.length > 0 ? (
          <div className={styles.cardGrid}>
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={styles.clientCard}
              >
                <div className={styles.clientHeader}>
                  <h3 className={styles.clientName}>{client.name}</h3>
                  <span className={styles.clientEmail}>
                    {client.contactEmail}
                  </span>
                </div>

                <div className={styles.clientDetails}>
                  <p>
                    <strong>Active Positions:</strong> {client.activePositions}
                  </p>
                  <div className={styles.technologyTags}>
                    {client.technologies?.map((tech) => (
                      <span
                        key={tech}
                        className={`${styles.techBadge} ${
                          styles[tech.toLowerCase()]
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.clientActions}>
                  <button className={`${styles.button} ${styles.secondary}`}>
                    <FiMail /> Contact
                  </button>
                  <button className={`${styles.button} ${styles.primary}`}>
                    <FiFileText /> View JDs
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FiUsers size={48} />
            <h4>No clients found</h4>
            <p>Add new clients or adjust your search.</p>
          </div>
        )}
      </motion.div>
    );
  };

  const JDTab = () => {
    const filteredJDs = jobDescriptions.filter(
      (jd) =>
        (jd.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (jd.clientName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.contentSection}
      >
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search JDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => setSelectedJD("new")}
          >
            <FiFileText /> Add New JD
          </button>
        </div>

        {filteredJDs.length > 0 ? (
          <div className={styles.cardGrid}>
            {filteredJDs.map((jd) => (
              <motion.div
                key={jd.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={styles.jdCard}
                onClick={() => setSelectedJD(jd)}
              >
                <div className={styles.jdHeader}>
                  <h3 className={styles.jdTitle}>{jd.title}</h3>
                  <span className={styles.jdClient}>{jd.clientName}</span>
                </div>

                <div className={styles.jdDetails}>
                  <p>
                    <strong>Technology:</strong>
                    <span
                      className={`${styles.techBadge} ${
                        styles[jd.technology?.toLowerCase()]
                      }`}
                    >
                      {jd.technology}
                    </span>
                    <span
                      className={`${styles.resourceBadge} ${
                        styles[jd.resourceType?.toLowerCase()]
                      }`}
                    >
                      {jd.resourceType}
                    </span>
                  </p>
                  <p>
                    <strong>Received:</strong> {jd.receivedDate}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span
                      className={`${styles.statusBadge} ${styles[jd.status]}`}
                    >
                      {jd.status}
                    </span>
                  </p>
                </div>

                <div className={styles.jdActions}>
                  <button
                    className={`${styles.button} ${styles.primary}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadJD(jd.id);
                    }}
                  >
                    <FiDownload /> Download
                  </button>
                  <button
                    className={`${styles.button} ${styles.danger}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJD(jd.id);
                    }}
                  >
                    <FiX /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FiBook size={48} />
            <h4>No Job Descriptions found</h4>
            <p>Add new JDs received from clients or adjust your search.</p>
          </div>
        )}
      </motion.div>
    );
  };

  const ResumePoolTab = () => {
    // Use resumes data, fallback to candidates if resumes is empty
    const dataToUse = resumes.length > 0 ? resumes : candidates;
    
    // Apply search filter to resumes
    const searchFilteredResumes = dataToUse.filter((candidate) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (candidate.user?.fullName || "").toLowerCase().includes(searchLower) ||
        (candidate.empId || "").toLowerCase().includes(searchLower) ||
        (candidate.technology || "").toLowerCase().includes(searchLower) ||
        (candidate.resourceType || "").toLowerCase().includes(searchLower)
      );
    });

    // Apply technology and resource type filters
    const filteredResumes = searchFilteredResumes.filter((candidate) => {
      const matchesTech = filterTech === "all" || candidate.technology === filterTech;
      const matchesResourceType = filterResourceType === "all" || candidate.resourceType === filterResourceType;
      return matchesTech && matchesResourceType;
    });

    // Debug logging
    console.log("Resume Pool Debug:", {
      totalResumes: resumes.length,
      totalCandidates: candidates.length,
      dataSource: resumes.length > 0 ? "resumes" : "candidates (fallback)",
      totalDataToUse: dataToUse.length,
      searchFiltered: searchFilteredResumes.length,
      finalFiltered: filteredResumes.length,
      searchTerm,
      filterTech,
      filterResourceType
    });

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.tabContent}
      >
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search resumes by name, ID, technology..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>Technology</label>
            <select
              value={filterTech}
              onChange={(e) => handleFilterChange("technology", e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Technologies</option>
              {Array.from(new Set(dataToUse.map((c) => c.technology).filter(Boolean))).map(
                (tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                )
              )}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Resource Type</label>
            <select
              value={filterResourceType}
              onChange={(e) => handleFilterChange("resourceType", e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Types</option>
              {Array.from(new Set(dataToUse.map((c) => c.resourceType).filter(Boolean))).map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className={styles.tableContainer}>
          {filteredResumes.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Technology</th>
                  <th>Resource Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResumes.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.user?.fullName || "N/A"}</td>
                    <td>{candidate.empId || "N/A"}</td>
                    <td>
                      <span
                        className={`${styles.techBadge} ${
                          styles[candidate.technology?.toLowerCase()]
                        }`}
                      >
                        {candidate.technology || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.resourceBadge} ${
                          styles[candidate.resourceType?.toLowerCase()]
                        }`}
                      >
                        {candidate.resourceType || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[candidate.status?.toLowerCase()]
                        }`}
                      >
                        {candidate.status || "N/A"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`${styles.button} ${styles.small}`}
                        onClick={() => handleDownloadResume(candidate.empId)}
                        disabled={!candidate.empId}
                      >
                        <FiDownload /> Resume
                      </button>
                      <button
                        className={`${styles.button} ${styles.small} ${styles.primary}`}
                        onClick={() => {
                          setSelectedForInterview([candidate]);
                          setShowInterviewScheduler(true);
                        }}
                      >
                        <FiCalendar /> Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
                          <div className={styles.emptyState}>
                <FiUpload size={48} />
                <h4>No resumes found</h4>
                <p>
                  {dataToUse.length === 0 
                    ? "No employee resumes available. Please check if employees have been added to the system."
                    : "No resumes match your current search criteria. Try adjusting your filters."
                  }
                </p>
                {dataToUse.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
                    Total {resumes.length > 0 ? 'resumes' : 'candidates'}: {dataToUse.length} | Filtered: {filteredResumes.length}
                  </div>
                )}
              </div>
          )}
        </div>
      </motion.div>
    );
  };

  const InterviewsTab = () => {
    const [expandedInterviews, setExpandedInterviews] = useState([]);
    const filteredInterviews = filterInterviews(clientInterviews);

    const hasUpdatePermission = () => {
      const role = salesUserData?.role;
      const token = localStorage.getItem('jwt_token');
      const userRole = localStorage.getItem('userRole');
      
      // Check both the component state and localStorage
      const effectiveRole = role || userRole;
      
      console.log('Permission check:', {
        componentRole: role,
        localStorageRole: userRole,
        effectiveRole,
        hasToken: !!token
      });
      
      return effectiveRole === "ROLE_SALES" || effectiveRole === "ROLE_ADMIN";
    };

    const toggleFeedback = (interviewId, e) => {
      e.preventDefault();
      e.stopPropagation();
      setExpandedInterviews(prev => {
        if (prev.includes(interviewId)) {
          return prev.filter(id => id !== interviewId);
        } else {
          return [...prev, interviewId];
        }
      });
    };

    const handleMarkAsCompleted = async (interviewId) => {
      if (!hasUpdatePermission()) {
        toast.error("You don't have permission to update interviews");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const interview = await getClientInterviewFeedback(interviewId);
        setSelectedInterviewForFeedback(interview);
        setShowFeedbackModal(true);
      } catch (error) {
        console.error("Error marking interview as completed:", error);
        toast.error(error.message || "Failed to mark interview as completed");
      } finally {
        setIsLoading(false);
      }
    };

    const handleUpdateInterview = async (interviewId) => {
      if (!hasUpdatePermission()) {
        toast.error("You don't have permission to update interviews");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const interview = await getClientInterviewFeedback(interviewId);
        setSelectedInterviewForFeedback(interview);
        setShowFeedbackModal(true);
      } catch (error) {
        console.error("Error updating interview:", error);
        toast.error(error.message || "Failed to update interview");
      } finally {
        setIsLoading(false);
      }
    };

    const renderFeedbackSection = (interview) => {
      const isExpanded = expandedInterviews.includes(interview.id);
      const hasFeedback = interview.feedback || interview.technicalScore || interview.communicationScore;

      return (
        <div className={styles.feedbackSection}>
          <button 
            type="button"
            className={styles.feedbackToggle}
            onClick={(e) => toggleFeedback(interview.id, e)}
            aria-expanded={isExpanded}
          >
            <div className={styles.feedbackToggleContent}>
              <FiMessageSquare />
              <span>Interview Feedback</span>
            </div>
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={styles.feedbackContent}
              >
                {hasFeedback ? (
                  <div className={styles.feedbackCard}>
                    <div className={styles.feedbackCardHeader}>
                      <h4>Interview Results</h4>
                      <span className={`${styles.statusBadge} ${styles[interview.result?.toLowerCase()]}`}>
                        {interview.result?.replace("_", " ")}
                      </span>
                    </div>

                    <div className={styles.feedbackCardBody}>
                      <div className={styles.feedbackScores}>
                        <div className={styles.scoreCard}>
                          <div className={styles.scoreHeader}>
                            <FiBarChart2 />
                            <h5>Technical Score</h5>
                          </div>
                          <div className={styles.scoreValue}>
                            <div className={styles.scoreCircle}>
                              <span>{interview.technicalScore}</span>
                              <small>/10</small>
                            </div>
                            <div className={styles.scoreBar}>
                              <div 
                                className={styles.scoreFill} 
                                style={{ width: `${(interview.technicalScore / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className={styles.scoreCard}>
                          <div className={styles.scoreHeader}>
                            <FiMessageSquare />
                            <h5>Communication Score</h5>
                          </div>
                          <div className={styles.scoreValue}>
                            <div className={styles.scoreCircle}>
                              <span>{interview.communicationScore}</span>
                              <small>/10</small>
                            </div>
                            <div className={styles.scoreBar}>
                              <div 
                                className={styles.scoreFill} 
                                style={{ width: `${(interview.communicationScore / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.feedbackDetails}>
                        <div className={styles.feedbackStatus}>
                          <div className={styles.statusItem}>
                            <label>Deployment Status</label>
                            <span className={`${styles.statusBadge} ${interview.deployedStatus ? styles.deployed : styles.notDeployed}`}>
                              {interview.deployedStatus ? "Deployed" : "Not Deployed"}
                            </span>
                          </div>
                          <div className={styles.statusItem}>
                            <label>Interview Date</label>
                            <span>{new Date(interview.date).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className={styles.feedbackText}>
                          <div className={styles.feedbackHeader}>
                            <FiMessageSquare />
                            <h5>Detailed Feedback</h5>
                          </div>
                          <div className={styles.feedbackContent}>
                            <p>{interview.feedback}</p>
                          </div>
                        </div>

                        {/* Feedback File Download Section */}
                        {interview.feedbackFileS3Key && (
                          <div className={styles.feedbackFileSection}>
                            <div className={styles.feedbackFileHeader}>
                              <FiFile />
                              <h5>Feedback File</h5>
                            </div>
                            <div className={styles.feedbackFileContent}>
                              <button
                                className={`${styles.button} ${styles.secondary}`}
                                onClick={() => handleDownloadFeedbackFile(interview.id)}
                                title="Download Feedback File"
                              >
                                <FiDownload /> Download Feedback File
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noFeedback}>
                    <FiMessageSquare size={24} />
                    <p>No feedback provided yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.contentSection}
      >
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label>Interview Level</label>
            <select
              value={filterInterviewLevel}
              onChange={(e) => handleFilterChange("level", e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Levels</option>
              {Array.from(new Set(clientInterviews.map((i) => i.level))).map(
                (level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                )
              )}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Fetch by ID</label>
            <div className={styles.idSearchContainer}>
              <input
                type="number"
                placeholder="Enter Interview ID"
                className={styles.idSearchInput}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const interviewId = parseInt(e.target.value);
                    if (interviewId) {
                      handleGetClientInterviewById(interviewId);
                    }
                  }
                }}
              />
              <button
                className={`${styles.button} ${styles.small}`}
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  const interviewId = parseInt(input.value);
                  if (interviewId) {
                    handleGetClientInterviewById(interviewId);
                  } else {
                    toast.error('Please enter a valid Interview ID');
                  }
                }}
                title="Fetch Interview by ID"
              >
                <FiSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Display fetched interview details */}
        {fetchedInterviewDetails && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.fetchedInterviewCard}
          >
            <div className={styles.fetchedInterviewHeader}>
              <h3>Fetched Interview Details</h3>
              <button
                className={`${styles.button} ${styles.small}`}
                onClick={() => setFetchedInterviewDetails(null)}
                title="Close Details"
              >
                <FiX />
              </button>
            </div>
            <div className={styles.fetchedInterviewContent}>
              <div className={styles.fetchedInterviewDetails}>
                <div className={styles.detailRow}>
                  <label>Interview ID:</label>
                  <span>{fetchedInterviewDetails.id}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>Client:</label>
                  <span>{fetchedInterviewDetails.client}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>Employee:</label>
                  <span>{fetchedInterviewDetails.employee?.user?.fullName || 'N/A'}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>Date:</label>
                  <span>{new Date(fetchedInterviewDetails.date).toLocaleDateString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>Time:</label>
                  <span>{fetchedInterviewDetails.time}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>Level:</label>
                  <span>Level {fetchedInterviewDetails.level}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>Job Description:</label>
                  <span>{fetchedInterviewDetails.jobDescriptionTitle}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>Status:</label>
                  <span className={`${styles.statusBadge} ${styles[fetchedInterviewDetails.status?.toLowerCase()]}`}>
                    {fetchedInterviewDetails.status}
                  </span>
                </div>
                {fetchedInterviewDetails.result && (
                  <div className={styles.detailRow}>
                    <label>Result:</label>
                    <span className={`${styles.statusBadge} ${styles[fetchedInterviewDetails.result?.toLowerCase()]}`}>
                      {fetchedInterviewDetails.result}
                    </span>
                  </div>
                )}
                {fetchedInterviewDetails.feedback && (
                  <div className={styles.detailRow}>
                    <label>Feedback:</label>
                    <span>{fetchedInterviewDetails.feedback}</span>
                  </div>
                )}
                {fetchedInterviewDetails.technicalScore && (
                  <div className={styles.detailRow}>
                    <label>Technical Score:</label>
                    <span>{fetchedInterviewDetails.technicalScore}/10</span>
                  </div>
                )}
                {fetchedInterviewDetails.communicationScore && (
                  <div className={styles.detailRow}>
                    <label>Communication Score:</label>
                    <span>{fetchedInterviewDetails.communicationScore}/10</span>
                  </div>
                )}
                {fetchedInterviewDetails.deployedStatus !== undefined && (
                  <div className={styles.detailRow}>
                    <label>Deployed Status:</label>
                    <span className={`${styles.statusBadge} ${fetchedInterviewDetails.deployedStatus ? styles.deployed : styles.notDeployed}`}>
                      {fetchedInterviewDetails.deployedStatus ? 'Deployed' : 'Not Deployed'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {filteredInterviews.length > 0 ? (
          <div>
            {filteredInterviews.map((interview) => (
              <motion.div
                key={interview.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={styles.interviewCard}
              >
                <div className={styles.interviewHeader}>
                  <div>
                    <h4 className={styles.interviewTitle}>
                      {interview.client}
                    </h4>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[interview.overallStatus?.toLowerCase()]
                      }`}
                    >
                      {interview.overallStatus?.replace("_", " ")}
                    </span>
                  </div>
                  <div className={styles.interviewActions}>
                    {hasUpdatePermission() && (
                      <>
                        {(interview.overallStatus?.toLowerCase() === "scheduled" ||
                          interview.overallStatus?.toLowerCase() === "pending") && (
                          <button
                            className={`${styles.button} ${styles.primary}`}
                            onClick={() => handleMarkAsCompleted(interview.id)}
                          >
                            <FiMessageSquare /> Give Feedback
                          </button>
                        )}

                        <button
                          className={`${styles.button} ${styles.secondary}`}
                          onClick={() => handleUpdateInterview(interview.id)}
                          title="Update Interview Details"
                        >
                          <FiEdit /> Update Interview
                        </button>

                        {interview.overallStatus === "completed" && (
                          <button
                            className={`${styles.button} ${styles.secondary}`}
                            onClick={() => handleMarkAsCompleted(interview.id)}
                          >
                            <FiMessageSquare /> Update Feedback
                          </button>
                        )}

                        <button
                          className={`${styles.button} ${styles.secondary}`}
                          onClick={async () => {
                            const fetchedInterview = await handleGetClientInterviewById(interview.id);
                            if (fetchedInterview) {
                              console.log('Fetched interview details:', fetchedInterview);
                              toast.success(`Interview ${interview.id} details loaded successfully`);
                            }
                          }}
                          title="Fetch Interview Details"
                        >
                          <FiEye /> View Details
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.interviewDetails}>
                  <div className={styles.detailItem}>
                    <label>Candidate:</label>
                    <span>{interview.employee?.user?.fullName}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Date:</label>
                    <span>{new Date(interview.date).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Time:</label>
                    <span>{interview.time}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Level:</label>
                    <span>Level {interview.level}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Job Description:</label>
                    <span>{interview.jobDescriptionTitle}</span>
                  </div>
                </div>

                {renderFeedbackSection(interview)}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FiCalendar size={48} />
            <h4>No interviews scheduled</h4>
            <p>
              When candidates are sent to clients, their interviews will appear
              here.
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  const DeploymentsTab = () => {
    const filteredDeployedEmployees = deployedEmployees.filter(
      (employee) =>
        (employee.user?.fullName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (employee.technology?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (employee.empId?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    // Find the latest interview for each employee
    const getEmployeeLevel = (employeeId) => {
      const employeeInterviews = clientInterviews.filter(
        interview => interview.employee?.id === employeeId
      );
      
      if (employeeInterviews.length > 0) {
        // Sort interviews by date in descending order to get the latest
        const sortedInterviews = [...employeeInterviews].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        return sortedInterviews[0].level;
      }
      return null;
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={styles.contentSection}
      >
        <div className={styles.filterSection}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search deployed employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {filteredDeployedEmployees.length > 0 ? (
          <div className={styles.cardGrid}>
            {filteredDeployedEmployees.map((employee) => {
              const employeeLevel = getEmployeeLevel(employee.id);
              return (
                <motion.div
                  key={employee.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={styles.profileCard}
                >
                  <div className={styles.profileHeader}>
                    <h3 className={styles.profileName}>
                      {employee.user?.fullName || "N/A"}
                    </h3>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[employee.status?.toLowerCase()]
                      }`}
                    >
                      {employee.status || "N/A"}
                    </span>
                  </div>

                  <div className={styles.profileDetails}>
                    <p>
                      <strong>Employee ID:</strong> {employee.empId || "N/A"}
                    </p>
                    <p>
                      <strong>Email:</strong> {employee.user?.email || "N/A"}
                    </p>
                    <p>
                      <strong>Technology:</strong>
                      <span
                        className={`${styles.techBadge} ${
                          styles[employee.technology?.toLowerCase()]
                        }`}
                      >
                        {employee.technology || "N/A"}
                      </span>
                    </p>
                    <p>
                      <strong>Resource Type:</strong>
                      <span
                        className={`${styles.resourceBadge} ${
                          styles[employee.resourceType?.toLowerCase()]
                        }`}
                      >
                        {employee.resourceType || "N/A"}
                      </span>
                    </p>
                    <p>
                      <strong>Level:</strong>{" "}
                      {employeeLevel ? (
                        <span className={styles.levelBadge}>
                          Level {employeeLevel}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FiUserCheck size={48} />
            <h4>No employees currently deployed</h4>
            <p>Employees marked as deployed will appear here.</p>
          </div>
        )}
      </motion.div>
    );
  };

  const ProfileTab = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({ ...salesUserData });

    const handleEditToggle = () => {
      setIsEditing(!isEditing);
      if (!isEditing) {
        setEditedData({ ...salesUserData });
      }
    };

    const handleFieldChange = (field, value) => {
      setEditedData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
      try {
        setIsSubmitting(true);
        // Here you would typically call an API to update the user profile
        // For now, we'll just update the local state
        setSalesUserData(editedData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      } finally {
        setIsSubmitting(false);
      }
    };

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
                  <img src={profilePic} alt="Profile" className={styles.profilePicture} />
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
                />
                <label htmlFor="profilePictureUpload" className={styles.profilePictureUpload}>
                  <FiUpload size={18} /> Update Photo
                </label>
              </div>
              <div className={styles.profileInfo}>
                <h2>{salesUserData.fullName}</h2>
                <p className={styles.profileRole}>{salesUserData.role}</p>
                <p className={styles.profileEmail}>{salesUserData.email}</p>
                <p className={styles.profileId}>Employee ID: {salesUserData.empId || "AJA1007"}</p>
              </div>
            </div>
            
            <div className={styles.profileDetails}>
              <h4>Profile Details</h4>
              <div className={styles.profileTable}>
                <div className={styles.tableRow}>
                  <div className={styles.tableHeader}>Name</div>
                  <div className={styles.tableValue}>{salesUserData.fullName}</div>
                </div>
                <div className={styles.tableRow}>
                  <div className={styles.tableHeader}>Email</div>
                  <div className={styles.tableValue}>{salesUserData.email}</div>
                </div>
                <div className={styles.tableRow}>
                  <div className={styles.tableHeader}>Role</div>
                  <div className={styles.tableValue}>{salesUserData.role}</div>
                </div>
                <div className={styles.tableRow}>
                  <div className={styles.tableHeader}>Employee ID</div>
                  <div className={styles.tableValue}>{salesUserData.empId || "AJA1007"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (isLoading && isInitialLoading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} />;
    }

    switch (activeTab) {
      case "clients":
        return (
          <>
            <ClientsTab />
            <Pagination
              totalItems={clients.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        );
      case "jds":
        return (
          <>
            <JDTab />
            <Pagination
              totalItems={jobDescriptions.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        );
      case "resumePool":
        return (
          <>
            <ResumePoolTab />
            <Pagination
              totalItems={resumes.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        );
      case "interviews":
        return (
          <>
            <InterviewsTab />
            <Pagination
              totalItems={clientInterviews.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        );
      case "deployments":
        return (
          <>
            <DeploymentsTab />
            <Pagination
              totalItems={deployedEmployees.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        );
      case "profile":
        return <ProfileTab />;
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <div className={styles.dashboardHeader}>
      <div className={styles.headerTitleContainer}>
        <h1 className={styles.headerTitle}>Sales Team Dashboard</h1>
        <p className={styles.headerSubtitle}>
          Client Engagement & Resume Management
        </p>
      </div>
      <div className={styles.headerActions}>
        <div className={styles.interviewCountBadge}>
          <FiCalendar />
          <span>Interviews: {interviewCount}</span>
        </div>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => {
            debugAuthStatus();
            const permission = checkSalesTeamPermission();
            console.log('Permission check result:', permission);
            toast.info(`Auth Debug: ${permission.reason}`);
          }}
          title="Debug Authentication"
        >
          <FiAlertCircle /> Debug Auth
        </button>
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <FiRefreshCw className={isRefreshing ? styles.spinning : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {profilePic ? (
              <img src={profilePic} alt="Profile" />
            ) : (
              <FiUser size={18} />
            )}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{salesUserData.fullName}</span>
            <span className={styles.userRole}>
              Sales Team ({salesUserData.email})
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      {renderHeader()}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "clients" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("clients")}
        >
          <FiUsers /> Clients
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "jds" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("jds")}
        >
          <FiFileText /> Job Descriptions
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "resumePool" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("resumePool")}
        >
          <FiUpload /> Resume Pool
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "interviews" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("interviews")}
        >
          <FiCalendar /> Client Interviews
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "deployments" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("deployments")}
        >
          <FiSend /> Deployments
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "profile" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("profile")}
        >
          <FiUser /> My Profile
        </button>
      </div>
      <div className={styles.contentContainer}>{renderTabContent()}</div>

      {/* Modals */}
      <ClientModal
        show={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSubmit={handleClientModalSubmit}
        fields={clientModalFields}
        onFieldChange={(field, value) =>
          setClientModalFields((prev) => ({ ...prev, [field]: value }))
        }
        onTechChange={(tech) => {
          setClientModalFields((prev) => ({
            ...prev,
            technologies: prev.technologies.includes(tech)
              ? prev.technologies.filter((t) => t !== tech)
              : [...prev.technologies, tech],
          }));
        }}
        error={clientModalError}
        success={clientModalSuccess}
        loading={clientModalLoading}
      />

      {selectedJD === "new" && (
        <div className={styles.modalOverlay}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <form onSubmit={handleJDModalSubmit}>
              <div className={styles.modalHeader}>
                <h3>Add New Job Description</h3>
                <button
                  className={styles.closeButton}
                  type="button"
                  onClick={() => setSelectedJD(null)}
                >
                  <FiX />
                </button>
              </div>
              <div className={styles.modalContent}>
                {jdModalError && <div className={styles.errorMessage}>{jdModalError}</div>}
                {jdModalSuccess && <div className={styles.successMessage}>{jdModalSuccess}</div>}
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input
                    type="text"
                    value={jdModalFields.title}
                    onChange={(e) =>
                      setJDModalFields({ ...jdModalFields, title: e.target.value })
                    }
                    placeholder="Enter job title"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Client *</label>
                  <select
                    value={jdModalFields.client}
                    onChange={(e) =>
                      setJDModalFields({ ...jdModalFields, client: e.target.value })
                    }
                    className={styles.input}
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.name}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Technology *</label>
                  <select
                    value={jdModalFields.technology}
                    onChange={(e) =>
                      setJDModalFields({ ...jdModalFields, technology: e.target.value })
                    }
                    className={styles.input}
                    required
                  >
                    <option value="">Select Technology</option>
                    {["Java", "Python", ".NET", "DevOps", "SalesForce", "UI", "Testing"].map(
                      (tech) => (
                        <option key={tech} value={tech}>
                          {tech}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Resource Type *</label>
                  <select
                    value={jdModalFields.resourceType}
                    onChange={(e) =>
                      setJDModalFields({ ...jdModalFields, resourceType: e.target.value })
                    }
                    className={styles.input}
                    required
                  >
                    <option value="">Select Resource Type</option>
                    {["Developer", "Engineer", "Consultant", "Analyst"].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={jdModalFields.description}
                    onChange={(e) =>
                      setJDModalFields({ ...jdModalFields, description: e.target.value })
                    }
                    placeholder="Enter job description"
                    className={styles.textarea}
                    rows="4"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Received Date</label>
                  <input
                    type="date"
                    value={jdModalFields.receivedDate}
                    onChange={(e) =>
                      setJDModalFields({ ...jdModalFields, receivedDate: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Deadline</label>
                  <input
                    type="date"
                    value={jdModalFields.deadline}
                    onChange={(e) =>
                      setJDModalFields({ ...jdModalFields, deadline: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Upload JD File *</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setJDModalFile(e.target.files[0])}
                    className={styles.input}
                    required
                  />
                  {jdModalFile && (
                    <span style={{ fontSize: "0.9em" }}>{jdModalFile.name}</span>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <button
                    className={`${styles.button} ${styles.secondary}`}
                    type="button"
                    onClick={() => setSelectedJD(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`${styles.button} ${styles.primary}`}
                    type="submit"
                    disabled={jdModalLoading}
                  >
                    {jdModalLoading ? "Uploading..." : "Upload JD"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ScheduleInterviewModal
        show={showInterviewScheduler}
        onClose={() => {
          setShowInterviewScheduler(false);
          setSelectedForInterview([]);
          setInterviewDetails(initialInterviewDetails);
        }}
        onSubmit={handleScheduleInterview}
        selectedCandidates={selectedForInterview}
        interviewDetails={interviewDetails}
        setInterviewDetails={setInterviewDetails}
        clients={clients}
        jobDescriptions={jobDescriptions}
      />

      <FeedbackModal
        show={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          setSelectedInterviewForFeedback(null);
        }}
        interview={selectedInterviewForFeedback || {}}
        onSubmit={handleUpdateFeedback}
        salesUserData={salesUserData}
      />
    </div>
  );
};

export default SalesTeamDashboard;
