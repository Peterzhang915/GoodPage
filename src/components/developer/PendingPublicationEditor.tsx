'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, XCircle, Users, Info, AlertCircle, ExternalLink, BookOpen, Calendar } from 'lucide-react'; // Combined icons
import { themeColors } from '@/styles/theme';
import { Publication, Member } from '@prisma/client'; // Import Prisma types
import Select, { MultiValue } from 'react-select'; // Import MultiValue

// Define expected props
interface PendingPublicationEditorProps {
  publicationId: string; // ID must be provided for editing
  onSave: (updatedPublication: Publication) => Promise<void>; // Callback on successful save
  onCancel: () => void; // Callback to close the editor
}

// Type for member options in the select dropdown
interface MemberOption {
  value: string; // Member ID
  label: string; // Member Name (e.g., "Name EN (Name ZH)")
}

// Interface for the editable fields (can be a subset of Publication)
interface PublicationFormData {
    title: string;
    year: number | null;
    venue: string | null;
    raw_authors: string | null;
    doi_url: string | null;
    pdf_url: string | null;
    abstract: string | null;
    keywords: string | null;
    ccf_rank: string | null; // Added CCF Rank field
}

// Type for the data sent in the PUT request
interface PublicationUpdatePayload extends Omit<PublicationFormData, 'raw_authors'> { // Omit raw_authors if not sending it back
    authorIds: string[];
    status: string; // Explicitly set status
}

// --- Utility Function to Parse Authors (remains the same) ---
const parseAuthors = (rawAuthors: string | null): string[] => {
    if (!rawAuthors) return [];
    return rawAuthors.split(/ and /i)
        .map(author => author.trim())
        .filter(Boolean);
};

const PendingPublicationEditor: React.FC<PendingPublicationEditorProps> = ({
  publicationId,
  onSave,
  onCancel,
}) => {
  // Use PublicationFormData for the form state
  const [formData, setFormData] = useState<PublicationFormData | null>(null);
  const [memberOptions, setMemberOptions] = useState<MemberOption[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<MultiValue<MemberOption>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ccfRankings, setCcfRankings] = useState<Record<string, string>>({}); // Use Record<string, string>
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(true);
  const [initialRawAuthors, setInitialRawAuthors] = useState<string | null>(null); // Store initial raw authors for comparison


  // --- Data Fetching ---
  const fetchPublicationData = useCallback(async () => {
    if (!publicationId) return;
    setIsLoading(true);
    setError(null);
    console.log(`Editor: Fetching data for ID: ${publicationId}`);
    try {
      // Adjust API endpoint if necessary - assuming it returns full Publication
      const response = await fetch(`/api/publications/pending/${publicationId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP Error: ${response.status}`);
      }
      // Expect full Publication data from API now
      const data: Publication & { authors?: { id: string }[] } = await response.json(); 
      setFormData({ // Set form data based on fetched data
          title: data.title,
          year: data.year,
          venue: data.venue,
          raw_authors: data.raw_authors,
          doi_url: data.doi_url,
          pdf_url: data.pdf_url,
          abstract: data.abstract,
          keywords: data.keywords,
          ccf_rank: data.ccf_rank // Initialize form field
      });
      setInitialRawAuthors(data.raw_authors); // Store for author pre-selection
      // Pre-select authors based on the `authors` relation returned by the API
      // This assumes the API route is updated to include authors
      if (data.authors && memberOptions.length > 0) { 
          const preSelected = data.authors
              .map(author => memberOptions.find(opt => opt.value === author.id))
              .filter((opt): opt is MemberOption => !!opt); // Filter out undefined if member not found
          setSelectedAuthors(preSelected);
          console.log("Pre-selected authors based on fetched relation:", preSelected);
      } else if (data.raw_authors && memberOptions.length > 0) {
           // Fallback: Attempt pre-selection based on raw_authors if relation not present
           // (Keep existing logic or refine)
           const parsedNames = parseAuthors(data.raw_authors);
           const preSelectedFallback: MemberOption[] = [];
           parsedNames.forEach(parsedName => {
               const lowerParsed = parsedName.toLowerCase();
               const foundOption = memberOptions.find(opt =>
                   opt.label.toLowerCase().includes(lowerParsed) ||
                   lowerParsed.includes(opt.label.split('(')[0].trim().toLowerCase())
               );
               if (foundOption && !preSelectedFallback.some(ps => ps.value === foundOption.value)) {
                   preSelectedFallback.push(foundOption);
               }
           });
           setSelectedAuthors(preSelectedFallback);
           console.log("Pre-selected authors based on raw string (fallback):", preSelectedFallback);
       } else {
           setSelectedAuthors([]); // Clear if no data or members
       }

      console.log("Editor: Initialized form data", data);
    } catch (err) {
      console.error("Editor: Failed to fetch publication data:", err);
      setError(err instanceof Error ? err.message : "Failed to load publication data.");
      setFormData(null); // Clear form data on error
    } finally {
      setIsLoading(false);
    }
  // Depend on publicationId and *after* members are loaded
  }, [publicationId, memberOptions]); 

  const fetchMembers = useCallback(async () => {
      setIsLoadingMembers(true);
      try {
          const response = await fetch('/api/members/list');
          if (!response.ok) throw new Error('Failed to fetch members');
          const members: { id: string; name_en: string; name_zh: string | null }[] = await response.json();
          const options = members.map(m => ({
              value: m.id,
              label: m.name_zh ? `${m.name_en} (${m.name_zh})` : m.name_en
          }));
          setMemberOptions(options); // Set member options first
          console.log("Editor: Fetched members", options.length);
      } catch (err) {
          console.error("Error fetching members:", err);
          setError("Could not load lab members list.");
      } finally {
          setIsLoadingMembers(false);
      }
  }, []);

   const fetchCcfRankings = useCallback(async () => {
       console.log("Editor: Fetching CCF rankings...");
       try {
            // TODO: Replace with actual fetch from '/data/ccf_rankings.json' or API
            const mockRanks: Record<string, string> = {
                "SIGCOMM": "A", "MobiCom": "A", "SIGMOD": "A", "VLDB": "A", "ICDE": "A", "OSDI": "A", "SOSP": "A",
                "INFOCOM": "A", "CCS": "A", "NDSS": "A", "Oakland": "A", "USENIX Security": "A",
                "EuroSys": "B", "FAST": "B", "MobiSys": "B",
            };
            setCcfRankings(mockRanks);
            console.log("Editor: Fetched/mocked CCF rankings");
       } catch (error) {
           console.error("Failed to fetch CCF rankings:", error);
           // Handle error appropriately, maybe set error state
       }
   }, []);


  useEffect(() => {
    fetchMembers();
    fetchCcfRankings();
  }, [fetchMembers, fetchCcfRankings]);

   // Fetch publication data *after* members are available for pre-selection
   useEffect(() => {
     if (memberOptions.length > 0) {
       fetchPublicationData();
     }
   }, [memberOptions, fetchPublicationData]);

  // --- Form Handling --- 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => (prev ? { ...prev, [name]: value } : null));
  };

   const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const { name, value } = e.target;
       const yearValue = value === '' ? null : parseInt(value, 10);
       setFormData(prev => (prev ? { 
           ...prev, 
           [name]: isNaN(yearValue!) ? prev.year : yearValue 
       } : null));
   };

   const handleAuthorChange = (selectedOptions: MultiValue<MemberOption>) => {
       setSelectedAuthors(selectedOptions); 
   };

   const handleCcfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => (prev ? { ...prev, [name]: value === "N/A" ? null : value } : null));
    };

  // --- Save Logic --- 
  const handleSave = async () => {
     if (!formData || !publicationId) return;
     setIsSaving(true);
     setError(null);
     console.log("Editor: Saving publication...", formData);
     console.log("Editor: Selected authors:", selectedAuthors);

     // Prepare data using the specific payload type
     const saveData: PublicationUpdatePayload = {
       title: formData.title, 
       venue: formData.venue,
       year: formData.year ? Number(formData.year) : null,
       abstract: formData.abstract,
       keywords: formData.keywords,
       doi_url: formData.doi_url,
       pdf_url: formData.pdf_url,
       ccf_rank: formData.ccf_rank, // Use form data
       authorIds: selectedAuthors.map((opt: MemberOption) => opt.value), // Explicitly type opt
       status: 'approved', // Set status to approved on save
     };

     try {
       // Use PUT request for update
       const response = await fetch(`/api/publications/pending/${publicationId}`, { 
         method: 'PUT', // Use PUT for update
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(saveData),
       });
       const result = await response.json();
       if (!response.ok) {
         throw new Error(result.error || `HTTP Error: ${response.status}`);
       }
       console.log("Editor: Save successful", result);
       onSave(result); // Pass updated data back to parent
     } catch (err) {
       console.error("Editor: Failed to save publication:", err);
       setError(err instanceof Error ? err.message : "Failed to save publication.");
     } finally {
       setIsSaving(false);
     }
  };

  // --- Rendering --- 
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 size={32} className={`animate-spin ${themeColors.devDescText}`} />
      </div>
    );
  }

  if (error && !formData) { // Show error only if data loading failed completely
    return (
         <div className={`my-4 p-4 rounded-md text-sm flex items-center bg-red-900/50 text-red-300 border border-red-700`}>
           <AlertCircle size={18} className="mr-3 flex-shrink-0" />
           <div>
             <p className="font-medium">Error Loading Editor</p>
             <p>{error}</p>
             <button onClick={onCancel} className="mt-2 text-xs underline hover:text-white">Close</button>
           </div>
         </div>
    );
  }

   if (!formData) {
      // Should ideally not happen if not loading and no error, but good fallback
      return <div className={`${themeColors.devDescText} p-4`}>Publication data not available.</div>;
   }

  // Attempt to auto-select CCF rank based on venue
  const getSuggestedRank = () => {
    if (!ccfRankings || !formData.venue) return '';
    const venueLower = formData.venue.toLowerCase();
    // Try direct match first
    for (const key in ccfRankings) {
        if (venueLower === key.toLowerCase()) {
            return ccfRankings[key];
        }
    }
     // Basic includes check (can be improved)
     for (const key in ccfRankings) {
        if (venueLower.includes(key.toLowerCase())) {
            console.log(`Suggesting rank ${ccfRankings[key]} based on substring match for ${key}`);
            return ccfRankings[key];
        }
    }
    return ''; // No match found
  }
  const suggestedRank = getSuggestedRank();

  return (
    <div className={`p-6 rounded-lg border ${themeColors.devBorder} ${themeColors.devCardBg} shadow-lg relative`}>
      <button
        onClick={onCancel}
        className={`absolute top-3 right-3 p-1 rounded-full ${themeColors.devDescText} hover:bg-gray-700 transition-colors`}
        title="Close Editor"
        disabled={isSaving}
      >
        <XCircle size={18} />
      </button>

      <h3 className={`text-xl font-semibold mb-6 ${themeColors.devTitleText}`}>Edit Publication Details</h3>

      {error && !isSaving && ( // Show non-saving errors here
            <div className={`mb-4 p-3 rounded-md text-sm flex items-center bg-red-900/50 text-red-300`}>
              <AlertCircle size={16} className="mr-2 flex-shrink-0" /> {error}
            </div>
       )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>Title</label>
          <input
            type="text" id="title" name="title" required
            value={formData.title || ''} onChange={handleInputChange} disabled={isSaving}
            className={`w-full p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
          />
        </div>

        {/* Raw Authors (Readonly) & Select Authors */}
        <div>
            <label className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>Authors (Original)</label>
            <p className={`text-xs p-2 rounded bg-gray-700/50 ${themeColors.devDescText}`}>{formData.raw_authors || 'N/A'}</p>
        </div>
         <div>
           <label htmlFor="authors" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>Associate Lab Members</label>
           <Select<MemberOption, true>
             id="authors"
             instanceId="author-select"
             options={memberOptions}
             value={selectedAuthors}
             onChange={handleAuthorChange}
             isDisabled={isSaving || isLoadingMembers} // Disable during save/load
             isMulti
             isLoading={isLoadingMembers}
             placeholder={isLoadingMembers ? "Loading members..." : "Select lab members..."}
             className="mt-1 basic-multi-select"
             classNamePrefix="select"
             styles={{ // Kept previous dark mode styles
               control: (base, state) => ({ ...base, backgroundColor: state.isDisabled ? '#374151' : themeColors.devCardBg.replace('bg-',''), borderColor: themeColors.devBorder.replace('border-',''), color: themeColors.devDescText.replace('text-',''), '&:hover': { borderColor: state.isDisabled ? themeColors.devBorder.replace('border-','') : '#4b5563'} }), 
               menu: (base) => ({ ...base, backgroundColor: '#1f2937', zIndex: 50 }), 
               option: (base, { isFocused, isSelected }) => ({ ...base, backgroundColor: isSelected ? '#374151' : isFocused ? '#4b5563' : undefined, color: themeColors.devDescText.replace('text-',''), ':active': {backgroundColor: '#374151'} }), 
               multiValue: (base) => ({ ...base, backgroundColor: '#4f46e5' }), 
               multiValueLabel: (base) => ({ ...base, color: 'white' }), 
               multiValueRemove: (base) => ({ ...base, color: 'white', ':hover': { backgroundColor: '#4338ca', color: 'white'} }), 
               placeholder: (base) => ({ ...base, color: themeColors.devDescText.replace('text-','') }),
               input: (base) => ({...base, color: themeColors.devDescText.replace('text-','')}),
             }}
           />
         </div>

        {/* Venue & Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="venue" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>Venue/Journal</label>
            <input
              type="text" id="venue" name="venue"
              value={formData.venue || ''} onChange={handleInputChange} disabled={isSaving}
              className={`w-full p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
            />
          </div>
          <div>
            <label htmlFor="year" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>Year</label>
            <input
              type="number" id="year" name="year"
              value={formData.year ?? ''} onChange={handleYearChange} disabled={isSaving}
              className={`w-full p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
            />
          </div>
        </div>

         {/* CCF Rank */} 
        <div>
           <label htmlFor="ccf_rank" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>CCF Rank</label>
           <div className="flex items-center gap-2">
             <select
               id="ccf_rank" name="ccf_rank"
               value={formData.ccf_rank ?? 'N/A'} // Use formData, default to N/A
               onChange={handleCcfChange} // Use specific handler
               disabled={isSaving}
               className={`flex-1 p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
             >
               <option value="N/A">N/A</option>
               <option value="A">A</option>
               <option value="B">B</option>
               <option value="C">C</option>
             </select>
             {suggestedRank && formData.ccf_rank !== suggestedRank && suggestedRank !== 'N/A' && (
                <span className="text-xs text-yellow-400 flex items-center gap-1" title={`Based on venue: ${formData.venue}`}>
                    <Info size={12}/> Suggested: {suggestedRank}
                </span>
             )}
           </div>
           <p className={`text-xs mt-1 ${themeColors.devDescText}`}>Select N/A if not applicable or unknown. Please verify based on the official CCF directory.</p>
        </div>

        {/* Abstract */} 
        <div>
          <label htmlFor="abstract" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>Abstract</label>
          <textarea
            id="abstract" name="abstract" rows={4}
            value={formData.abstract || ''} onChange={handleInputChange} disabled={isSaving}
            className={`w-full p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
          />
        </div>

        {/* Keywords */} 
        <div>
          <label htmlFor="keywords" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>Keywords (comma-separated)</label>
          <input
            type="text" id="keywords" name="keywords"
            value={formData.keywords || ''} onChange={handleInputChange} disabled={isSaving}
            className={`w-full p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
          />
        </div>

        {/* DOI & PDF URL */} 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doi_url" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>DOI (e.g., 10.1109/...) </label>
            <input
              type="text" id="doi_url" name="doi_url"
              value={formData.doi_url || ''} onChange={handleInputChange} disabled={isSaving}
              className={`w-full p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
            />
          </div>
          <div>
            <label htmlFor="pdf_url" className={`block text-sm font-medium mb-1 ${themeColors.devDescText}`}>PDF URL</label>
            <input
              type="url" id="pdf_url" name="pdf_url"
              value={formData.pdf_url || ''} onChange={handleInputChange} disabled={isSaving}
              className={`w-full p-2 rounded border ${themeColors.devBorder} ${themeColors.devCardBg} ${themeColors.devDescText} focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50`}
            />
          </div>
        </div>


        {/* Action Buttons */} 
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button" onClick={onCancel} disabled={isSaving}
            className={`px-4 py-2 rounded border ${themeColors.devBorder} ${themeColors.devDescText} hover:bg-gray-700 transition-colors disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            type="submit" disabled={isSaving}
            className={`px-4 py-2 rounded border border-transparent ${themeColors.devButtonText} ${themeColors.devButtonBg} hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save and Approve'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default PendingPublicationEditor;
