    // src/components/developer/BibtexUploader.tsx
    'use client';

    import React, { useState, useRef, useCallback } from 'react';
    import { UploadCloud, Loader2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
    import { themeColors } from '@/styles/theme'; // Import theme colors

    // Define props including the new callback
    interface BibtexUploaderProps {
      onUploadComplete?: () => void; // Callback after successful processing
    }

    const BibtexUploader: React.FC<BibtexUploaderProps> = ({ onUploadComplete }) => {
      const [selectedFile, setSelectedFile] = useState<File | null>(null);
      const [pastedText, setPastedText] = useState<string>('');
      const [isUploading, setIsUploading] = useState<boolean>(false);
      const [isProcessingText, setIsProcessingText] = useState<boolean>(false);
      const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
      const [dragActive, setDragActive] = useState<boolean>(false); // State for drag visual feedback
      const fileInputRef = useRef<HTMLInputElement>(null);
      const textAreaRef = useRef<HTMLTextAreaElement>(null); // Ref for textarea

      const resetState = () => {
          setSelectedFile(null);
          setPastedText('');
          setUploadStatus(null);
          setIsUploading(false);
          setIsProcessingText(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }

      const handleFileValidation = (file: File | null): boolean => {
          if (!file) return false;
          if (file.name.endsWith('.bib') || file.type === 'application/x-bibtex') {
              setSelectedFile(file);
              setPastedText(''); // Clear pasted text if a file is selected/dropped
              setUploadStatus(null);
              return true;
          } else {
              setSelectedFile(null);
              setPastedText('');
              setUploadStatus({ type: 'error', message: 'Invalid file type. Please select or drop a .bib file.' });
              return false;
          }
      };

      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          handleFileValidation(event.target.files?.[0] || null);
          // Reset the input value to allow selecting the same file again
          if (fileInputRef.current) {
              fileInputRef.current.value = '';
          }
      };

      // --- Drag and Drop Handlers ---
      const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.type === "dragenter" || e.type === "dragover") {
              setDragActive(true);
          } else if (e.type === "dragleave") {
              setDragActive(false);
          }
      }, []);

      const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileValidation(e.dataTransfer.files[0]);
          }
      }, []);

      // --- Upload Logic (Handles both File and Pasted Text via generated Blob) ---
      const performUpload = async (dataToSend: File | Blob, isPastedContent: boolean = false) => {
          const loadingSetter = isPastedContent ? setIsProcessingText : setIsUploading;
          loadingSetter(true);
          setUploadStatus(null);

          const formData = new FormData();
          // Use a consistent filename for pasted content or the original filename
          const fileName = isPastedContent ? 'pasted_content.bib' : (dataToSend as File).name;
          formData.append('bibtexFile', dataToSend, fileName);

          try {
              const response = await fetch('/api/publications/upload-bibtex', {
                  method: 'POST',
                  body: formData,
              });
              const result = await response.json();
              if (!response.ok) {
                  throw new Error(result.error || `HTTP error! status: ${response.status}`);
              }
              setUploadStatus({ type: 'success', message: result.message || 'Content processed successfully.' });
              resetState(); // Reset form on success
              onUploadComplete?.(); // Call the callback on success
          } catch (error) {
              console.error('Processing failed:', error);
              const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
              setUploadStatus({ type: 'error', message: `Processing failed: ${errorMessage}` });
          } finally {
              loadingSetter(false);
          }
      };

      // Trigger upload for the selected file
      const handleUploadFile = () => {
          if (selectedFile) {
              performUpload(selectedFile, false);
          } else {
               setUploadStatus({ type: 'error', message: 'Please select a file first.' });
          }
      };

      // Trigger upload for the pasted text
      const handleProcessText = () => {
          if (pastedText.trim()) {
              // Create a Blob from the text content
              const textBlob = new Blob([pastedText], { type: 'application/x-bibtex' });
              performUpload(textBlob, true);
          } else {
               setUploadStatus({ type: 'error', message: 'Please paste BibTeX content first.' });
          }
      };


      const handleButtonClick = () => {
          fileInputRef.current?.click();
      };


      return (
          <div className={`p-6 rounded-lg border ${themeColors.devBorder} ${themeColors.devCardBg} shadow-md`}>
              <h4 className={`text-lg font-semibold mb-4 ${themeColors.devTitleText}`}>Import Publications</h4>

              {/* Combined Dropzone and File Selector */}
              <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors mb-4 
                            ${dragActive ? 'border-indigo-500 bg-gray-700/60' : `${themeColors.devBorder} hover:border-gray-500 hover:bg-gray-700/30`}
                            ${isUploading || isProcessingText ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={handleButtonClick} // Allow clicking area to select file
              >
                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".bib,application/x-bibtex"
                      className="hidden"
                      disabled={isUploading || isProcessingText}
                  />
                   <div className="flex flex-col items-center justify-center pointer-events-none"> {/* Make inner content non-interactive for drop */}
                       <UploadCloud size={32} className={`mb-2 ${themeColors.devDescText}`} />
                       <p className={`${themeColors.devDescText} text-sm mb-1`}>
                           {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & drop a .bib file here, or click to select'}
                       </p>
                       <p className="text-xs text-gray-500">Alternative: Paste content below</p>
                   </div>
              </div>

              {/* Upload Button for File */}
               <button
                   onClick={handleUploadFile}
                   disabled={!selectedFile || isUploading || isProcessingText}
                   className={`w-full mb-4 inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors 
                     ${!selectedFile || isUploading || isProcessingText
                       ? `${themeColors.devButtonDisabledBorder} ${themeColors.devDisabledText} ${themeColors.devButtonDisabledBg} cursor-not-allowed`
                       : `border-transparent ${themeColors.devButtonBg} ${themeColors.devButtonText} hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500`}`
                   }
               >
                   {isUploading ? (
                       <><Loader2 size={16} className="mr-2 animate-spin" /> Uploading File...</>
                   ) : (
                       <><UploadCloud size={16} className="mr-2" /> Upload Selected File</>
                   )}
               </button>


              {/* Text Area for Pasting */}
              <div className="mb-4">
                  <label htmlFor="bibtex-paste-area" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>
                      Or paste BibTeX content here:
                  </label>
                  <textarea
                      id="bibtex-paste-area"
                      ref={textAreaRef}
                      rows={6}
                      value={pastedText}
                      onChange={(e) => { setPastedText(e.target.value); if (e.target.value.trim()) setSelectedFile(null); }} // Clear file if text is pasted
                      placeholder="Paste your BibTeX entries here..."
                      disabled={isUploading || isProcessingText}
                      className={`w-full p-2 rounded-md border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
                  />
              </div>

              {/* Process Button for Pasted Text */}
               <button
                   onClick={handleProcessText}
                   disabled={!pastedText.trim() || isUploading || isProcessingText}
                   className={`w-full inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors 
                     ${!pastedText.trim() || isUploading || isProcessingText
                       ? `${themeColors.devButtonDisabledBorder} ${themeColors.devDisabledText} ${themeColors.devButtonDisabledBg} cursor-not-allowed`
                       : `border-transparent bg-teal-600 ${themeColors.devButtonText} hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500`}` // Different color for distinction
                   }
               >
                   {isProcessingText ? (
                       <><Loader2 size={16} className="mr-2 animate-spin" /> Processing Text...</>
                   ) : (
                       <><FileText size={16} className="mr-2" /> Process Pasted Text</>
                   )}
               </button>


              {/* Status Message */}
              {uploadStatus && (
                  <div className={`mt-4 p-3 rounded-md text-sm flex items-center ${uploadStatus.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                      {uploadStatus.type === 'success' ? <CheckCircle size={16} className="mr-2 flex-shrink-0" /> : <AlertCircle size={16} className="mr-2 flex-shrink-0" />}
                      {uploadStatus.message}
                  </div>
              )}
          </div>
      );
    };

    export default BibtexUploader;
