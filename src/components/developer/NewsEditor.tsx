'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, History, Loader2, X, ArrowLeft, Trash2, CheckCircle, Edit2, Radio } from 'lucide-react';
// Removed themeColors import as we use hardcoded dark theme classes now

// --- Helper: Format Date (Moved here) --- //
function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

// --- Interfaces (Moved here) --- //
interface NewsData {
  title: string;
  news: string[];
}

interface NewsHistoryEntry {
  timestamp: string;
  title: string;
  news: string[];
  isLive?: boolean;
  isDraft?: boolean;
}

interface NewsEditorProps {
  onClose: () => void;
}

// --- News Editor Component Definition --- //
const NewsEditor: React.FC<NewsEditorProps> = ({ onClose }) => {
  // State for news editor
  const [title, setTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Loading initial live data
  const [isSaving, setIsSaving] = useState(false); // Separate state for saving action
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | null>(null);

  // State for history feature
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [newsHistory, setNewsHistory] = useState<NewsHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingDelete, setIsLoadingDelete] = useState<string | null>(null); // Track deleting timestamp

  // Fetch current news (live version) on component mount
  const fetchLiveNews = useCallback(async (showLoadingMessage = true) => {
    if(showLoadingMessage) {
        setIsLoading(true);
        setStatusMessage('Loading live news data...');
        setMessageType('info');
    }
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch news');
      const data: NewsData = await res.json();
      if (data && typeof data.title === 'string' && Array.isArray(data.news)) {
        setTitle(data.title);
        setNewsContent(data.news.join('\n'));
        if(showLoadingMessage) {
            setStatusMessage('Live news data loaded.');
            setMessageType('success');
            setTimeout(() => setStatusMessage(null), 2000);
        }
      } else {
        throw new Error('Invalid data format received for live news.');
      }
    } catch (err) {
      console.error("Fetch live news error:", err);
      setStatusMessage('Failed to load live news data.');
      setMessageType('error');
      // Keep potentially existing state or clear?
      // setTitle('(Error Loading Title)');
      // setNewsContent('Error loading content.');
    } finally {
       if(showLoadingMessage) setIsLoading(false);
    }
  }, []); // No dependencies, it fetches current state

  useEffect(() => {
    fetchLiveNews();
  }, [fetchLiveNews]);

  // Handle saving news
  const handleSaveNews = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    setMessageType(null);
    setHistoryError(null);
    try {
      const currentTitle = title.trim() || "(Untitled)";
      const newsArray = newsContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const payload: NewsData = { title: currentTitle, news: newsArray };

      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Save failed with status: ' + res.status }));
        throw new Error(errorData.error || 'Failed to save news');
      }
      setStatusMessage('News updated successfully!');
      setMessageType('success');
      setTimeout(() => setStatusMessage(null), 3000);

    } catch (err) {
      console.error("Save news error:", err);
      setStatusMessage(err instanceof Error ? err.message : 'An unknown error occurred');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch news history - Includes Live and Draft
  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    setNewsHistory([]);
    try {
      // Fetch both history and live data concurrently
      const [historyRes, liveRes] = await Promise.all([
        fetch('/api/news/history'),
        fetch('/api/news')
      ]);

      // Process History
      if (!historyRes.ok) throw new Error('Failed to fetch history');
      const historyData: NewsHistoryEntry[] = await historyRes.json();
      if (!Array.isArray(historyData)) throw new Error('Invalid history data format.');

      // Process Live Data
      if (!liveRes.ok) throw new Error('Failed to fetch live data for history view');
      const liveData: NewsData = await liveRes.json();
      if (!liveData || typeof liveData.title !== 'string' || !Array.isArray(liveData.news)) {
           throw new Error('Invalid live data format received.');
      }

      // Create Live entry
      const liveEntry: NewsHistoryEntry = {
        timestamp: 'live', // Special identifier
        title: liveData.title,
        news: liveData.news,
        isLive: true
      };

      // Create Draft entry (from current editor state)
      const draftNewsArray = newsContent.split('\n').map(line => line.trim()).filter(Boolean);
      const draftEntry: NewsHistoryEntry = {
        timestamp: 'draft', // Special identifier
        title: title || '(Current Draft)', // Use editor title or placeholder
        news: draftNewsArray,
        isDraft: true
      };

      // Combine: Live, Draft, History
      const combinedHistory = [liveEntry, draftEntry, ...historyData];

      setNewsHistory(combinedHistory);
      setShowHistoryModal(true);
    } catch (err) {
      console.error("Fetch history/live error:", err);
      setHistoryError(err instanceof Error ? err.message : 'An unknown error occurred fetching data');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load a specific version from history, live, or draft
  const loadVersion = (version: NewsHistoryEntry) => {
    setTitle(version.title || '(Untitled)'); // Load title
    setNewsContent(version.news.join('\n'));
    setShowHistoryModal(false);

    let message = '';
    if (version.isLive) {
      message = 'Live version loaded into editor.';
    } else if (version.isDraft) {
      message = 'Current draft reloaded.';
    } else {
      message = `Loaded historical version from ${formatDate(version.timestamp)}. Click Save News to make it live.`;
    }
    setStatusMessage(message);
    setMessageType('info'); // Use info for loading messages
    setHistoryError(null);
     setTimeout(() => setStatusMessage(null), 3000);
  };

   // Delete a history entry
  const handleDeleteHistory = async (timestampToDelete: string) => {
    if (!timestampToDelete || timestampToDelete === 'live' || timestampToDelete === 'draft') return; // Cannot delete live/draft

    // Optional: Add confirmation dialog here
    if (!confirm(`Are you sure you want to delete the history entry from ${formatDate(timestampToDelete)}? This cannot be undone.`)) {
        return;
    }

    setIsLoadingDelete(timestampToDelete); // Mark this specific entry as deleting
    setHistoryError(null);
    setStatusMessage(null); // Clear other messages

    try {
      const res = await fetch(`/api/news/history?timestamp=${encodeURIComponent(timestampToDelete)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `Delete failed with status: ${res.status}` }));
         // Handle 404 specifically - item might already be deleted
         if (res.status === 404) {
            setHistoryError(`History entry not found (timestamp: ${timestampToDelete}). It might have been already deleted.`);
         } else {
            throw new Error(errorData.error || 'Failed to delete history entry');
         }
      } else {
         // Success: Remove the item from the local state
         setNewsHistory(prevHistory => prevHistory.filter(entry => entry.timestamp !== timestampToDelete));
         setStatusMessage(`History entry from ${formatDate(timestampToDelete)} deleted.`);
         setMessageType('success');
         setTimeout(() => setStatusMessage(null), 3000);
      }

    } catch (err) {
      console.error("Delete history error:", err);
      setHistoryError(err instanceof Error ? err.message : 'An unknown error occurred during deletion');
    } finally {
      setIsLoadingDelete(null); // Finish deleting state for this entry
    }
  };

  return (
    // Container div now defined in DeveloperPage, just return the content
    <>
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-semibold text-green-400">Manage News</h2>
        <button
          onClick={onClose}
          className={`inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors`}
        >
          <ArrowLeft size={14} className="mr-1" />
          Back to Tools
        </button>
      </div>

      {/* Title Input */} 
      <div className="mb-4">
         <label htmlFor="news-title" className="block text-sm font-medium text-gray-300 mb-1">News Title</label>
         <input
           type="text"
           id="news-title"
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           placeholder="Enter a title for this news update..."
           disabled={isLoading || isSaving}
           className={`w-full p-2 border rounded-md shadow-sm bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70`}
         />
       </div>

      {/* Editor Area */}
      <textarea
        rows={10}
        value={newsContent}
        onChange={(e) => setNewsContent(e.target.value)}
        placeholder={isLoading ? "Loading live news..." : "Enter news items, one per line..."}
        disabled={isLoading || isSaving}
        className={`w-full p-3 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 disabled:opacity-70`}
      />

      {/* Status and Error Messages */}
      {statusMessage && (
        <div className={`mt-3 text-sm px-3 py-1.5 rounded ${messageType === 'success' ? `bg-green-900/80 text-green-100` : messageType === 'error' ? `bg-red-900/80 text-red-100` : `bg-blue-900/80 text-blue-100`}`}>
          {statusMessage}
        </div>
      )}
      {historyError && (
        <div className={`mt-3 text-sm px-3 py-1.5 rounded bg-red-900/80 text-red-100`}>
          History Error: {historyError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 mt-4">
         {/* Discard Draft Button (Optional but Recommended) */}
        <button
           onClick={() => fetchLiveNews(true)} // Explicitly show loading message
           disabled={isLoading || isSaving || isLoadingHistory || !!isLoadingDelete}
           className={`inline-flex items-center px-4 py-2 border border-yellow-700 rounded-md shadow-sm text-sm font-medium text-yellow-300 bg-yellow-900/50 hover:bg-yellow-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
           title="Discard current changes and reload the live version"
        >
            <Trash2 size={18} className="mr-2" />
            Discard Draft
        </button>
        <button
          onClick={fetchHistory}
          disabled={isLoading || isSaving || isLoadingHistory || !!isLoadingDelete}
          className={`inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoadingHistory ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <History size={18} className="mr-2" />
          )}
          View History
        </button>
        <button
          onClick={handleSaveNews}
          disabled={isLoading || isSaving || isLoadingHistory || !!isLoadingDelete}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          Save News
        </button>
      </div>

      {/* --- History Modal --- */} 
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] flex flex-col text-gray-100`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */} 
             <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
               <h4 className={`text-lg font-semibold text-green-400`}>News History</h4>
               <button onClick={() => setShowHistoryModal(false)} className={`p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors`} aria-label="Close history modal">
                 <X size={20} />
               </button>
             </div>
            {/* Modal Body */} 
            <div className="overflow-y-auto flex-grow pr-2 space-y-3 -mr-2">
              {isLoadingHistory ? (
                 <div className="flex justify-center items-center py-10">
                     <Loader2 size={24} className="animate-spin text-gray-400" />
                     <p className="ml-3 text-gray-400">Loading History...</p>
                 </div>
              ) : newsHistory.length > 0 ? (
                <ul className="space-y-3">
                  {newsHistory.map((entry) => (
                    <li key={entry.timestamp} // Use timestamp as key (live/draft have unique strings)
                        className={`p-3 rounded border flex justify-between items-start gap-4 transition-colors
                           ${entry.isLive ? 'border-green-500/60 bg-green-900/20' : entry.isDraft ? 'border-yellow-500/60 bg-yellow-900/20' : 'border-gray-600 bg-gray-700/50 hover:bg-gray-700'}`}>
                      {/* Left side: Title, Timestamp/Label, Line count */}
                      <div className="flex-grow overflow-hidden">
                        <span className={`block text-base font-medium mb-1 truncate ${entry.isLive ? 'text-green-300' : entry.isDraft ? 'text-yellow-300' : 'text-gray-200'}`}>
                           {entry.title || "(Untitled)"}
                           {entry.isLive && <span className="text-xs font-normal bg-green-800 text-green-200 rounded px-1.5 py-0.5 ml-2 inline-flex items-center"><Radio size={12} className='mr-1'/>Live</span>}
                           {entry.isDraft && <span className="text-xs font-normal bg-yellow-800 text-yellow-200 rounded px-1.5 py-0.5 ml-2 inline-flex items-center"><Edit2 size={12} className='mr-1'/>Draft</span>}
                        </span>
                        <span className={`block text-xs ${entry.isLive ? 'text-gray-300' : entry.isDraft ? 'text-gray-300' : 'text-gray-400'}`}>
                           {entry.isLive ? `Currently live on homepage` : entry.isDraft ? `Current content in editor` : formatDate(entry.timestamp)}
                        </span>
                         <span className={`block text-xs mt-1 ${entry.isLive ? 'text-gray-300' : entry.isDraft ? 'text-gray-300' : 'text-gray-400'}`}>{entry.news.length} lines</span>
                      </div>
                      {/* Right side: Action Buttons */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button
                           onClick={() => loadVersion(entry)}
                           className={`inline-flex items-center px-3 py-1 border border-transparent rounded shadow-sm text-xs font-medium 
                             ${entry.isLive ? 'bg-green-600 hover:bg-green-700' : entry.isDraft ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-indigo-600 hover:bg-indigo-700'} 
                             text-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-opacity`}
                        >
                           {entry.isLive ? 'Load Live' : entry.isDraft ? 'Reload Draft' : 'Load Version'}
                        </button>
                        {/* Delete Button - Only for historical entries */}
                        {!entry.isLive && !entry.isDraft && (
                           <button
                              onClick={() => handleDeleteHistory(entry.timestamp)}
                              disabled={isLoadingDelete === entry.timestamp} // Disable only the specific button being deleted
                              className={`inline-flex items-center justify-center px-3 py-1 w-[80px] border border-gray-600 rounded shadow-sm text-xs font-medium text-red-400 bg-gray-700 hover:bg-red-900/50 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-wait`}
                           >
                               {isLoadingDelete === entry.timestamp ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />}
                               <span className="ml-1">Delete</span>
                           </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`text-gray-400 text-center py-4`}>No history records found.</p>
              )}
            </div>
            {/* Modal Footer */}
             <div className="mt-4 pt-3 border-t border-gray-600 flex justify-end">
               <button onClick={() => setShowHistoryModal(false)} className={`px-4 py-2 border rounded-md text-sm font-medium border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors`}>
                 Close
               </button>
             </div>
          </motion.div>
        </div>
      )}
      {/* --- End History Modal --- */}
    </>
  );
};

export default NewsEditor; 