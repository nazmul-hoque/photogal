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
        className={`fixed bottom-8 right-8 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white p-5 rounded-2xl shadow-soft-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 z-50 group ${className}`}
        title="Upload Photos"
      >
        <div className="relative">
          <Upload className="w-7 h-7 transition-transform duration-300 group-hover:rotate-12" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full animate-pulse"></div>
        </div>
        
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-neutral-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Upload Photos
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-neutral-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
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
