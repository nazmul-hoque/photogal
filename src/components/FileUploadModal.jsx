import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const FileUploadModal = ({ isOpen, onClose, onUploadComplete, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files) => {
    setUploading(true);
    setUploadProgress(files.map(file => ({ 
      name: file.name, 
      status: 'uploading', 
      progress: 0 
    })));

    const { uploadImage, validateFile, convertToPhotoObject } = await import('../services/apiService');
    
    try {
      // Validate all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateFile(file);
        
        if (!validation.isValid) {
          setUploadProgress(prev => prev.map((item, index) => 
            index === i 
              ? { ...item, status: 'error', error: validation.message }
              : item
          ));
          continue;
        }

        try {
          // Update progress to show processing
          setUploadProgress(prev => prev.map((item, index) => 
            index === i 
              ? { ...item, status: 'processing', progress: 50 }
              : item
          ));

          // Upload single file (we'll use single upload for better progress tracking)
          const analysisData = await uploadImage(file);
          
          // Convert to photo object
          const photoObject = convertToPhotoObject(analysisData, file);
          
          // Update progress to complete
          setUploadProgress(prev => prev.map((item, index) => 
            index === i 
              ? { ...item, status: 'complete', progress: 100 }
              : item
          ));

          // Notify parent component
          onUploadComplete(photoObject);

        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setUploadProgress(prev => prev.map((item, index) => 
            index === i 
              ? { ...item, status: 'error', error: error.message }
              : item
          ));

          // Notify parent component of error
          if (onError) {
            onError(error, file.name);
          }
        }
      }

      // Close modal after a brief delay if all uploads completed
      setTimeout(() => {
        const allCompleted = uploadProgress.every(item => 
          item.status === 'complete' || item.status === 'error'
        );
        if (allCompleted) {
          handleClose();
        }
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUploadProgress([]);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">Upload Photos</h2>
          <button
            onClick={handleClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            disabled={uploading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-neutral-300 hover:border-neutral-400'
              }
              ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-neutral-700 mb-2">
              Drop photos here or click to browse
            </p>
            <p className="text-sm text-neutral-500">
              Supports JPEG, PNG, GIF, WebP (max 10MB each)
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Upload Progress */}
          {uploadProgress.length > 0 && (
            <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
              <h3 className="font-medium text-neutral-900">Upload Progress</h3>
              {uploadProgress.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {item.status === 'uploading' && (
                      <Loader className="w-5 h-5 text-primary-500 animate-spin" />
                    )}
                    {item.status === 'processing' && (
                      <Loader className="w-5 h-5 text-secondary-500 animate-spin" />
                    )}
                    {item.status === 'complete' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {item.name}
                    </p>
                    {item.status === 'uploading' && (
                      <p className="text-xs text-neutral-500">Uploading...</p>
                    )}
                    {item.status === 'processing' && (
                      <p className="text-xs text-neutral-500">Analyzing with AI...</p>
                    )}
                    {item.status === 'complete' && (
                      <p className="text-xs text-green-600">Complete</p>
                    )}
                    {item.status === 'error' && (
                      <p className="text-xs text-red-600">{item.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
