// components/ExperienceModal.jsx
import React from "react";

const ExperienceModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="experience-modal-overlay" onClick={onClose}>
      <div
        className="experience-modal-content"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default ExperienceModal;
