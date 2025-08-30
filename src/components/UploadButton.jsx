import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import FileUploadModal from './FileUploadModal';

const UploadButton = ({ onUploadComplete, onError, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleUploadComplete = (photoObject) => {
    if (onUploadComplete) {
      onUploadComplete(photoObject);
    }
  };

  const handleError = (error, filename) => {
    if (onError) {
      onError(error, filename);
    }
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className={`fixed bottom-6 right-6 bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50 ${className}`}
        title="Upload Photos"
      >
        <Upload className="w-6 h-6" />
      </button>
      
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUploadComplete={handleUploadComplete}
        onError={handleError}
      />
    </>
  );
};

export default UploadButton;
