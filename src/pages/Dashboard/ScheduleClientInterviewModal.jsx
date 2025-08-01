import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import styles from "./Sales.module.css";

const initialInterviewDetails = {
  level: 1,
  date: "",
  time: "",
  mode: "virtual",
  link: "",
  location: "",
  notes: "",
  client: "",
  jobDescriptionTitle: "",
  interviewerName: "",
  deployedStatus: false,
};

const ScheduleClientInterviewModal = ({
  show,
  onClose,
  onSubmit,
  selectedCandidates,
  clients,
  jobDescriptions,
}) => {
  if (!show) return null;

  const candidateNames = selectedCandidates
    .map((c) => c.user?.fullName || "N/A")
    .join(", ");

  const [interviewDetails, setInterviewDetails] = useState(initialInterviewDetails);
  const [error, setError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setInterviewDetails(initialInterviewDetails);
      setError("");
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    try {
      if (!interviewDetails.client?.trim()) throw new Error("Client name is required");
      if (!interviewDetails.date) throw new Error("Interview date is required");
      if (!interviewDetails.time) throw new Error("Interview time is required");
      if (!interviewDetails.level) throw new Error("Interview level is required");
      if (!interviewDetails.jobDescriptionTitle?.trim())
        throw new Error("Job description title is required");

      if (
        interviewDetails.mode === "virtual" &&
        !interviewDetails.link?.trim()
      ) {
        throw new Error("Meeting link is required for virtual interviews");
      }
      if (
        interviewDetails.mode === "in-person" &&
        !interviewDetails.location?.trim()
      ) {
        throw new Error("Location is required for in-person interviews");
      }

      onSubmit(
        selectedCandidates.map((c) => c.id),
        interviewDetails
      );
      onClose();
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    }
  };

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
            <button type="button" className={styles.closeButton} onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className={styles.modalContent}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label>Candidate(s)</label>
              <input type="text" value={candidateNames} className={styles.input} readOnly />
            </div>

            <div className={styles.formGroup}>
              <label>Client *</label>
              <select
                value={interviewDetails.client}
                onChange={(e) =>
                  setInterviewDetails({ ...interviewDetails, client: e.target.value })
                }
                className={styles.input}
                required
              >
                <option value="">Select Client</option>
                {clients?.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Job Description *</label>
              <select
                value={interviewDetails.jobDescriptionTitle}
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
                {jobDescriptions?.map((jd) => (
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
                value={interviewDetails.date}
                onChange={(e) =>
                  setInterviewDetails({ ...interviewDetails, date: e.target.value })
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Time *</label>
              <input
                type="time"
                value={interviewDetails.time}
                onChange={(e) =>
                  setInterviewDetails({ ...interviewDetails, time: e.target.value })
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Level *</label>
              <select
                value={interviewDetails.level}
                onChange={(e) =>
                  setInterviewDetails({ ...interviewDetails, level: e.target.value })
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
              <label>Mode *</label>
              <select
                value={interviewDetails.mode}
                onChange={(e) =>
                  setInterviewDetails({
                    ...interviewDetails,
                    mode: e.target.value,
                    link: "",
                    location: "",
                  })
                }
                className={styles.input}
                required
              >
                <option value="virtual">Virtual</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>

            {interviewDetails.mode === "virtual" ? (
              <div className={styles.formGroup}>
                <label>Meeting Link *</label>
                <input
                  type="url"
                  value={interviewDetails.link}
                  onChange={(e) =>
                    setInterviewDetails({ ...interviewDetails, link: e.target.value })
                  }
                  className={styles.input}
                  required
                />
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  type="text"
                  value={interviewDetails.location}
                  onChange={(e) =>
                    setInterviewDetails({ ...interviewDetails, location: e.target.value })
                  }
                  className={styles.input}
                  required
                />
              </div>
            )}

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
              <button type="button" className={styles.secondary} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.primary}>
                Schedule Interview
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default React.memo(ScheduleClientInterviewModal);
