'use client';

// React and Hooks
import React, { useState, ChangeEvent, useMemo, useEffect } from 'react'; // Added useEffect

// Framer Motion for Animations
import { motion, AnimatePresence } from 'framer-motion';

// UI Components from shadcn/ui and Lucide Icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, X, Pencil, ChevronDown, ChevronUp, Info, KeyRound, UserCog, ClipboardList, Link, GraduationCap, Award as AwardIcon, Star, Briefcase, Presentation as PresentationIcon, Database, ScrollText, Users } from 'lucide-react'; // Add Info icon, ClipboardList, and Link icons, and new icons for Education, Awards, Featured Publications, Projects, Presentations, Software/Datasets, Patents, Academic Services

// Notifications
import { toast } from 'sonner';

// Dnd-Kit for Drag and Drop
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Prisma Types and Enums
import { MemberStatus, Prisma } from '@prisma/client'; // Use the direct import
import type { Education, Award, Teaching, Project, ProjectMember, Publication, PublicationAuthor, AcademicService, Presentation, SoftwareDataset } from '@prisma/client'; // Import model types including SoftwareDataset

// Custom Application Types
import { memberProfileIncludeArgs, type MemberProfileData, type PublicationInfo } from '@/lib/types'; // Import shared types

// Server Actions
import { updateMemberField, updateMemberStatus, updateMemberProfileVisibility } from '@/app/actions/memberActions';
import { addEducationRecord, updateEducationRecord, deleteEducationRecord, type EducationFormData } from '@/app/actions/educationActions';
import { addAwardRecord, updateAwardRecord, deleteAwardRecord, type AwardFormData } from '@/app/actions/awardActions';
import { addTeachingRecord, updateTeachingRecord, deleteTeachingRecord, type TeachingFormData } from '@/app/actions/teachingActions';
import { updateFeaturedPublications } from '@/app/actions/publicationActions';
import { addProjectRecord, updateProjectRecord, deleteProjectRecord, type ProjectFormData } from '@/app/actions/projectActions';
import { addAcademicServiceRecord, updateAcademicServiceRecord, deleteAcademicServiceRecord, type AcademicServiceFormData } from '@/app/actions/academicServiceActions'; // Import AcademicService actions and type
import { addPresentationRecord, updatePresentationRecord, deletePresentationRecord, type PresentationFormData } from '@/app/actions/presentationActions'; // Import Presentation actions and type
import { addSoftwareDatasetRecord, updateSoftwareDatasetRecord, deleteSoftwareDatasetRecord, type SoftwareDatasetFormData } from '@/app/actions/softwareDatasetActions'; // Import SoftwareDataset actions and type

// Custom Modal Components (assuming they are in the same directory)
import { EducationFormModal } from './EducationFormModal';
import { AwardFormModal } from './AwardFormModal';
import { TeachingFormModal } from './TeachingFormModal';
import { ProjectFormModal } from './ProjectFormModal';
import { AcademicServiceFormModal } from './AcademicServiceFormModal'; // Import the new modal
import { PresentationFormModal } from './PresentationFormModal'; // Import the new modal
import { SoftwareDatasetFormModal } from './SoftwareDatasetFormModal'; // Import the new modal
import { PasswordChangeForm } from './PasswordChangeForm'; // Import the new form component
import { UsernameChangeForm } from './UsernameChangeForm'; // Import the new username form

// --- Type Definitions ---
// Define types used internally within this component

// Type for editable publications list - ensure all fields are present and correctly typed
type EditablePublication = PublicationInfo & {
  isFeatured: boolean;
  profileDisplayOrder: number | null;
  // isHighlyCited: boolean; // Removed: Data not available directly on PublicationInfo
};

// Type for data passed to ProfileForm

// --- Props 定义 --- (Main component props)
type MemberProfileEditorProps = {
  initialData: MemberProfileData;
};

// --- 可编辑字段通用组件 ---
type EditableTextFieldProps = {
  label: string;
  fieldName: keyof MemberProfileData;
  initialValue: string | number | null | undefined; // Allow number for year fields initially
  memberId: string;
  isTextArea?: boolean;
  inputType?: 'text' | 'email' | 'url' | 'number';
  placeholder?: string;
};

function EditableTextField({ label, fieldName, initialValue, memberId, isTextArea = false, inputType = 'text', placeholder }: EditableTextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  // Store value as string for input/textarea compatibility
  const [value, setValue] = useState(initialValue?.toString() ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let valueToSend: string | null = value;
      // Handle potential empty string for number inputs (should be null)
      if (inputType === 'number' && value.trim() === '') {
        valueToSend = null;
      }
      // Handle potential non-numeric string for number inputs (show error?)
      if (inputType === 'number' && valueToSend !== null && isNaN(Number(valueToSend))) {
          setError('Please enter a valid number.');
          setIsLoading(false);
          return;
      }

      // Action expects specific field types, might need refinement or separate actions
      const result = await updateMemberField(memberId, fieldName as any, valueToSend);

      if (result.success) {
        setIsEditing(false);
        toast.success(`Field "${label}" updated successfully.`);
      } else {
        setError(result.error || 'Failed to update field.');
        toast.error(`Failed to update "${label}": ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(`Error updating ${fieldName}:`, err);
      const errorMessage = `An unexpected error occurred: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      toast.error(`Error updating "${label}": ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue?.toString() ?? '');
    setIsEditing(false);
    setError(null);
  };

  // --- Type event handlers --- 
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
  };
  const handleTextAreaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
  };

  return (
    <div className="mb-4">
      <Label htmlFor={fieldName} className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{label}</Label>
      {isEditing ? (
        <div className="flex items-center space-x-2">
          {isTextArea ? (
            <Textarea
              id={fieldName}
              value={value}
              onChange={handleTextAreaChange}
              className="flex-grow resize-y min-h-[80px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              rows={4}
              disabled={isLoading}
              placeholder={placeholder || `Enter ${label}...`}
            />
          ) : (
            <Input
              id={fieldName}
              type={inputType}
              value={value}
              onChange={handleInputChange}
              className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
              disabled={isLoading}
              placeholder={placeholder || `Enter ${label}...`}
            />
          )}
          <Button size="icon" variant="ghost" onClick={handleSave} disabled={isLoading} aria-label={`Save ${label}`} className="dark:text-gray-400 dark:hover:text-green-400">
            <Save className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleCancel} disabled={isLoading} aria-label={`Cancel editing ${label}`} className="dark:text-gray-400 dark:hover:text-red-400">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="mt-1 flex items-center justify-between group min-h-[40px] py-1 px-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md transition-colors">
          <p className="text-gray-900 dark:text-gray-100 flex-grow break-words">
            {value || <span className="text-gray-400 dark:text-gray-500 italic">Not set</span>}
          </p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ml-2 flex-shrink-0 dark:text-gray-400 dark:hover:text-indigo-400"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}


// --- 主编辑器组件 --- 

// Define section IDs for state management
type SectionId = 
  | 'basicInfo' 
  | 'detailedProfile' 
  | 'links' 
  | 'education' 
  | 'awards' 
  | 'featuredPublications'
  | 'projects'
  | 'presentations'
  | 'softwareDatasets'
  | 'patents'
  | 'academicServices'
  | 'passwordChange'
  | 'usernameChange';

// Type for editable project list item (combining Project and ProjectMember info)
type EditableProjectInfo = ProjectMember & { project: Project };

export default function MemberProfileEditor({ initialData }: MemberProfileEditorProps) {
  // --- State for specific fields ---
  const [currentStatus, setCurrentStatus] = useState<MemberStatus | undefined>(initialData.status ?? undefined);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(initialData.is_profile_public ?? true); // Default to true if null/undefined initially?
  const [isVisibilityLoading, setIsVisibilityLoading] = useState(false);

  // --- State for Education Modal ---
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducationData, setEditingEducationData] = useState<Partial<Education> | null>(null);
  // Local state to reflect changes immediately, updated from initialData and after actions
  const [educationHistory, setEducationHistory] = useState<Education[]>(initialData.educationHistory || []);

  // --- State for Award Modal ---
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Partial<Award> | null>(null);
  // Local state for awards, initialized from props and updated after actions
  const [awardsList, setAwardsList] = useState<Award[]>(initialData.awards || []);

  // --- State for Teaching Modal ---
  const [isTeachingModalOpen, setIsTeachingModalOpen] = useState(false);
  const [editingTeaching, setEditingTeaching] = useState<Partial<Teaching> | null>(null);
  // Use the correct field name 'teachingRoles' from MemberProfileData type
  const [teachingList, setTeachingList] = useState<Teaching[]>(initialData.teachingRoles || []);

  // --- State for Academic Service Modal --- Added
  const [isAcademicServiceModalOpen, setIsAcademicServiceModalOpen] = useState(false);
  const [editingAcademicService, setEditingAcademicService] = useState<AcademicService | null>(null);
  const [academicServicesList, setAcademicServicesList] = useState<AcademicService[]>(initialData.academicServices || []);

  // --- State for Presentation Modal --- Added
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [presentationList, setPresentationList] = useState<Presentation[]>(initialData.presentations || []);

  // --- State for Featured Publications ---

  const [editablePublications, setEditablePublications] = useState<EditablePublication[]>(() => {
      // Ensure the mapping creates objects matching the full EditablePublication type
      return initialData.publications.map((pub: PublicationInfo): EditablePublication => {
          // No longer need to find authorEntry here, as isFeatured and profileDisplayOrder
          // should be directly available on the PublicationInfo object (pub) coming from initialData.
          // const authorEntry = pub.publicationAuthors?.find(pa => pa.member_id === initialData.id);

          return {
              ...pub, // Spread base PublicationInfo properties (which now includes isFeatured and profileDisplayOrder)
              // isFeatured: authorEntry?.isFeaturedOnProfile ?? false, // Removed: Use pub.isFeatured directly
              // profileDisplayOrder: authorEntry?.profileDisplayOrder ?? null, // Removed: Use pub.profileDisplayOrder directly
          };
      });
  });
  const [isSavingFeatured, setIsSavingFeatured] = useState(false);

  // --- State for Card Collapse/Expand --- 
  const [openSections, setOpenSections] = useState<Record<SectionId, boolean>>(() => ({
      // Set all sections to default collapsed (false)
      basicInfo: false, 
      detailedProfile: false,
      links: false,
      education: false, 
      awards: false, 
      featuredPublications: false,
      projects: false,
      presentations: false,
      softwareDatasets: false,
      patents: false,
      academicServices: false,
      passwordChange: false,
      usernameChange: false,
  }));

  // --- State for Project Modal and Data ---
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  // Store the full Project object and the member's role for editing
  const [editingProjectData, setEditingProjectData] = useState<(Project & { memberRole?: string }) | undefined>(undefined);
  // Local state for projects list, initialized from initialData
  const [projectsList, setProjectsList] = useState<EditableProjectInfo[]>(initialData.projects || []);

  // --- State for Software & Datasets Modal and Data ---
  const [isSoftwareDatasetModalOpen, setIsSoftwareDatasetModalOpen] = useState(false);
  // Correct state variable name based on types.ts (member.softwareAndDatasets)
  const [editingSoftwareAndDataset, setEditingSoftwareAndDataset] = useState<SoftwareDataset | null>(null);
  const [softwareAndDatasetsList, setSoftwareAndDatasetsList] = useState<SoftwareDataset[]>(initialData.softwareAndDatasets || []);

  // Toggle function
  const toggleSection = (sectionId: SectionId) => {
      setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // --- Handlers ---
  const handleStatusChange = async (newStatusValue: string) => { 
    // Validate if newStatusValue is a valid MemberStatus enum key
    const isValidStatus = Object.values(MemberStatus).includes(newStatusValue as MemberStatus);
    if (!isValidStatus || !newStatusValue) {
      toast.error(`Invalid status value: ${newStatusValue}`);
      return;
    }
    const newStatus: MemberStatus = newStatusValue as MemberStatus;

    setIsStatusLoading(true);
    try {
      const result = await updateMemberStatus(initialData.id, newStatus);
      if (result.success) {
        setCurrentStatus(newStatus);
        toast.success(`Status updated to ${formatStatusLabel(newStatus)}.`);
      } else {
        toast.error(`Failed to update status: ${result.error || 'Unknown error'}`);
        // Optionally revert Select visually if needed
      }
    } catch (err: any) {
      console.error("Error calling updateMemberStatus action:", err);
      toast.error(`An unexpected error occurred: ${err.message || 'Unknown error'}`);
    } finally {
      setIsStatusLoading(false);
    }
   }; 

  // --- Implement formatStatusLabel ---
  const formatStatusLabel = (status: MemberStatus): string => {
    switch (status) {
      case MemberStatus.PROFESSOR: // Use PROFESSOR instead of FACULTY
        return 'Professor';
      case MemberStatus.POSTDOC:
        return 'Postdoc';
      case MemberStatus.PHD_STUDENT:
        return 'PhD Student';
      case MemberStatus.MASTER_STUDENT:
        return 'Master Student';
      case MemberStatus.UNDERGRADUATE: // Added UNDERGRADUATE based on error hints
         return 'Undergraduate';
      case MemberStatus.RESEARCH_STAFF: // Use RESEARCH_STAFF instead of RESEARCH_ASSISTANT
        return 'Research Staff';
      case MemberStatus.VISITING_SCHOLAR: // Use VISITING_SCHOLAR instead of VISITING_STUDENT
        return 'Visiting Scholar';
      case MemberStatus.ALUMNI: // Use ALUMNI instead of ALUMNI_PHD/MASTER/OTHER
        return 'Alumni';
      case MemberStatus.OTHER:
        return 'Other';
      default:
        // Handle unexpected status - maybe log an error or return a default
        console.warn(`Unknown member status encountered: ${status}`);
        return status; // Return the raw value as fallback
    }
  };

  // --- Handler for Profile Visibility Switch Change ---
  const handleVisibilityChange = async (checked: boolean) => {
    setIsVisibilityLoading(true);
    try {
      const result = await updateMemberProfileVisibility(initialData.id, checked);
      if (result.success) {
        // Update local state ONLY after successful DB update
        setIsPublic(checked);
        toast.success(`Profile visibility updated to ${checked ? 'Public' : 'Private'}.`);
      } else {
        toast.error(`Failed to update visibility: ${result.error || 'Unknown error'}`);
        // Optional: Revert switch state visually if update fails
        // setIsPublic(!checked);
      }
    } catch (err: any) {
      console.error("Error calling updateMemberProfileVisibility action:", err);
      toast.error(`An unexpected error occurred: ${err.message || 'Unknown error'}`);
      // Optional: Revert switch state visually
      // setIsPublic(!checked);
    } finally {
      setIsVisibilityLoading(false);
    }
  };

  // --- Handlers for Education CRUD ---
  const handleOpenAddEducationModal = () => {
    setEditingEducationData(null); // Ensure we are adding, not editing
    setIsEducationModalOpen(true);
  };

  const handleOpenEditEducationModal = (education: Education) => {
    setEditingEducationData(education);
    setIsEducationModalOpen(true);
  };

  const handleCloseEducationModal = () => {
    setIsEducationModalOpen(false);
    setEditingEducationData(null); // Clear editing state on close
  };

  // This function will be passed to the modal's onSubmit prop
  const handleEducationSubmit = async (data: EducationFormData, educationId?: number): Promise<void> => {
    const actionPromise = educationId
      ? updateEducationRecord(educationId, data)
      : addEducationRecord(initialData.id, data); // Pass memberId for adding

    // Using toast.promise for better UX
    toast.promise(actionPromise, {
      loading: 'Saving education record...',
      success: (result: { success: boolean; error?: string; education?: Education }) => {
        if (result.success && result.education) {
          // --- Update local state for immediate feedback ---
          if (educationId) {
            // Update existing item in local state
            setEducationHistory((prev: Education[]) =>
              prev.map((edu: Education) => edu.id === educationId ? result.education! : edu)
            );
          } else {
            // Add new item to local state
            setEducationHistory((prev: Education[]) =>
                [...prev, result.education!]
            );
          }
          handleCloseEducationModal(); // Close modal on success
          return `Education record ${educationId ? 'updated' : 'added'} successfully!`;
        } else {
          // Force into error state if success is false or education data missing
          throw new Error(result.error || 'Failed to save education record.');
        }
      },
      error: (err: any) => {
        // Error toast will display this message from the caught error
        return `Error: ${err.message || 'An unknown error occurred'}`;
      },
    });

    // We don't need to await here because toast.promise handles the lifecycle.
    // However, if you needed to do something *after* success/error specifically,
    // you might await and then act based on the result.
  };


  const handleDeleteEducation = async (educationId: number) => {
      // Call the delete action directly
      const actionPromise = deleteEducationRecord(educationId);

      toast.promise(actionPromise, {
          loading: 'Deleting education record...',
          success: (result: { success: boolean; error?: string }) => {
              if (result.success) {
                  // Update local state upon successful deletion
                  setEducationHistory((prev: Education[]) => prev.filter((edu: Education) => edu.id !== educationId));
                  return 'Education record deleted successfully!';
              } else {
                   // Force into error state
                  throw new Error(result.error || 'Failed to delete education record.');
              }
          },
          error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
      });
   };

  // --- Handlers for Award CRUD ---
  const handleOpenAddAwardModal = () => {
    setEditingAward(null);
    setIsAwardModalOpen(true);
  };

  const handleOpenEditAwardModal = (award: Award) => {
    setEditingAward(award);
    setIsAwardModalOpen(true);
  };

  const handleCloseAwardModal = () => {
    setIsAwardModalOpen(false);
    setEditingAward(null);
  };

  const handleAwardSubmit = async (data: AwardFormData, awardId?: number): Promise<void> => {
    const actionPromise = awardId
      ? updateAwardRecord(awardId, data)
      : addAwardRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: 'Saving award record...',
      success: (result: { success: boolean; error?: string; award?: Award }) => {
        if (result.success && result.award) {
          if (awardId) {
            // Update existing award in local state
            setAwardsList((prev) =>
              prev.map((award) => (award.id === awardId ? result.award! : award))
            );
          } else {
            // Add new award to local state
            setAwardsList((prev) => [...prev, result.award!]);
          }
          handleCloseAwardModal();
          return `Award record ${awardId ? 'updated' : 'added'} successfully!`;
        } else {
          throw new Error(result.error || 'Failed to save award record.');
        }
      },
      error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
    });
  };

  const handleDeleteAward = async (awardId: number) => {
    const actionPromise = deleteAwardRecord(awardId);

    toast.promise(actionPromise, {
      loading: 'Deleting award record...',
      success: (result: { success: boolean; error?: string }) => {
        if (result.success) {
          setAwardsList((prev) => prev.filter((award) => award.id !== awardId));
          return 'Award record deleted successfully!';
        } else {
          throw new Error(result.error || 'Failed to delete award record.');
        }
      },
      error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
    });
  };

  // --- Handlers for Teaching CRUD ---
  const handleOpenAddTeachingModal = () => {
    setEditingTeaching(null);
    setIsTeachingModalOpen(true);
  };

  const handleOpenEditTeachingModal = (teaching: Teaching) => {
    setEditingTeaching(teaching);
    setIsTeachingModalOpen(true);
  };

  const handleCloseTeachingModal = () => {
    setIsTeachingModalOpen(false);
    setEditingTeaching(null);
  };

  const handleTeachingSubmit = async (data: TeachingFormData, teachingId?: number): Promise<void> => {
    const actionPromise = teachingId
      ? updateTeachingRecord(teachingId, data)
      : addTeachingRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: 'Saving teaching record...',
      success: (result: { success: boolean; error?: string; teaching?: Teaching }) => {
        if (result.success && result.teaching) {
          if (teachingId) {
            setTeachingList((prev) =>
              prev.map((teach) => (teach.id === teachingId ? result.teaching! : teach))
            );
          } else {
            setTeachingList((prev) => [...prev, result.teaching!]);
          }
          handleCloseTeachingModal();
          return `Teaching record ${teachingId ? 'updated' : 'added'} successfully!`;
        } else {
          throw new Error(result.error || 'Failed to save teaching record.');
        }
      },
      error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
    });
  };

  const handleDeleteTeaching = async (teachingId: number) => {
    const actionPromise = deleteTeachingRecord(teachingId);

    toast.promise(actionPromise, {
      loading: 'Deleting teaching record...',
      success: (result: { success: boolean; error?: string }) => {
        if (result.success) {
          setTeachingList((prev) => prev.filter((teach) => teach.id !== teachingId));
          return 'Teaching record deleted successfully!';
        } else {
          throw new Error(result.error || 'Failed to delete teaching record.');
        }
      },
      error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
    });
  };

  // --- Handler for Saving Featured Publications ---
  const handleSaveFeaturedPublications = async () => {
    setIsSavingFeatured(true);
    // The data structure sent to the action needs to reflect how `PublicationAuthor` stores this info
    const featuredUpdates = editablePublications
      .map((pub, index) => ({
        publicationId: pub.id,
        isFeatured: pub.isFeatured, // This now correctly reflects the checkbox state
        order: pub.profileDisplayOrder ?? index, // Use saved order if exists, otherwise current index
        // Note: The action `updateFeaturedPublications` needs to handle this structure
        // likely by updating the corresponding PublicationAuthor record for this member.
      }));

    // Assuming `updateFeaturedPublications` expects an array of { publicationId, isFeatured, order }
    // It should internally find the PublicationAuthor record for memberId+publicationId and update it.
    console.log("Sending featured updates:", featuredUpdates);
    const actionPromise = updateFeaturedPublications(initialData.id, featuredUpdates);
    toast.promise(actionPromise, {
      loading: 'Saving featured publications list...',
      success: (result) => {
        if (result.success) {
          return 'Featured publications updated successfully!';
        } else {
          throw new Error(result.error || 'Failed to update featured publications.');
        }
      },
      error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`, // Improved error display
    });
    try {
      await actionPromise;
    } catch (e) {
      // Errors handled by toast
    } finally {
      setIsSavingFeatured(false);
    }
  };

  // --- Handler to toggle featured status for a publication ---
  const handleToggleFeatured = (publicationId: number) => {
    setEditablePublications(currentPubs =>
        currentPubs.map(pub =>
            pub.id === publicationId
                ? { ...pub, isFeatured: !pub.isFeatured }
                : pub
        )
    );
  };

  // --- @dnd-kit Sensor setup ---
  const sensors = useSensors(
    useSensor(PointerSensor), // Use pointer events (mouse, touch)
    useSensor(KeyboardSensor, { // Use keyboard for accessibility
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- @dnd-kit Drag End Handler ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Ensure 'over' is not null before proceeding
    if (over && active.id !== over.id) {
        setEditablePublications((items) => {
            const oldIndex = items.findIndex(item => item.id.toString() === active.id);
            const newIndex = items.findIndex(item => item.id.toString() === over.id);

            // Check if indices are valid before moving
            if (oldIndex === -1 || newIndex === -1) {
                console.error("Could not find dragged item index in state.");
                return items; // Return original items if index lookup fails
            }

            // Use arrayMove utility for correct reordering
            return arrayMove(items, oldIndex, newIndex);
        });
    }
  };

  // --- Handlers for Project CRUD --- 
  const handleOpenAddProjectModal = () => {
    setEditingProjectData(undefined); // Clear editing state
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProjectModal = (projectInfo: EditableProjectInfo) => {
    // Map the role from ProjectMember (string | null) to what the modal expects (string | undefined)
    setEditingProjectData({ ...projectInfo.project, memberRole: projectInfo.role ?? undefined });
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProjectData(undefined);
  };

  const handleProjectSubmit = async (data: ProjectFormData, projectId?: number): Promise<void> => {
      const actionToPerform = () => projectId
        ? updateProjectRecord(projectId, data)
        : addProjectRecord(initialData.id, data);

      type ActionResult = Awaited<ReturnType<typeof actionToPerform>>;

      toast.promise(actionToPerform, {
        loading: 'Saving project record...',
        success: (result: ActionResult) => {
            if (result.success && result.project) {
                const savedProject = result.project as Project; // Assert as base Project type

                if (projectId) {
                    // --- Update existing project logic ---
                    setProjectsList(prev =>
                        prev.map(pm =>
                            pm.project_id === projectId
                                ? { ...pm,
                                    project: { ...pm.project, ...savedProject }, // Update project details
                                    role: data.role ?? pm.role // Update role from form data, fallback to previous
                                  }
                                : pm
                        )
                    );
                } else {
                    // --- Add new project logic ---
                    // Construct the new state item directly from the saved project and form data
                    const newEditableProject: EditableProjectInfo = {
                        project_id: savedProject.id,
                        member_id: initialData.id, // Current member's ID
                        role: data.role ?? null, // Map undefined from form to null for ProjectMember type
                        project: savedProject // The project data returned by the server action
                    };
                    setProjectsList(prev => [...prev, newEditableProject]);
                }
                handleCloseProjectModal();
                return `Project record ${projectId ? 'updated' : 'added'} successfully!`;
            } else {
                throw new Error(result.error || 'Failed to save project record.');
            }
        },
        error: (err: any) => {
             // Try to parse Zod error if it's a JSON string
             try {
                const fieldErrors = JSON.parse(err.message);
                // Format Zod errors for better readability
                return `Validation Error: ${Object.entries(fieldErrors).map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`).join('; ')}`;
             } catch (e) { 
                 // Default error message if parsing fails
                 return `Error: ${err.message || 'An unknown error occurred'}`;
             }
        },
    });
  };

  const handleDeleteProject = async (projectId: number, memberId: string) => {
      // Call delete action with the composite key parts
      const actionPromise = deleteProjectRecord(projectId, memberId);

      toast.promise(actionPromise, {
          loading: 'Deleting project record...',
          success: (result) => {
              if (result.success) {
                  // Update local state upon successful deletion
                  setProjectsList(prev => prev.filter(pm => !(pm.project_id === projectId && pm.member_id === memberId)));
                  return 'Project record deleted successfully!';
              } else {
                   throw new Error(result.error || 'Failed to delete project record.');
              }
          },
          error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
      });
   };

  // --- Handlers for Academic Service CRUD --- Added
  const handleOpenAddServiceModal = () => {
    setEditingAcademicService(null);
    setIsAcademicServiceModalOpen(true);
  };

  const handleOpenEditServiceModal = (service: AcademicService) => {
    setEditingAcademicService(service);
    setIsAcademicServiceModalOpen(true);
  };

  const handleCloseServiceModal = () => {
    setIsAcademicServiceModalOpen(false);
    setEditingAcademicService(null);
  };

  const handleAcademicServiceSubmit = async (data: AcademicServiceFormData, serviceId?: number): Promise<void> => {
    const actionPromise = serviceId
      ? updateAcademicServiceRecord(serviceId, data)
      : addAcademicServiceRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: 'Saving academic service record...',
      success: (result: { success: boolean; error?: string; academicService?: AcademicService }) => {
        if (result.success && result.academicService) {
          if (serviceId) {
            setAcademicServicesList((prev) =>
              prev.map((svc) => (svc.id === serviceId ? result.academicService! : svc))
            );
          } else {
            setAcademicServicesList((prev) => [...prev, result.academicService!]);
          }
          handleCloseServiceModal();
          return `Academic service record ${serviceId ? 'updated' : 'added'} successfully!`
        } else {
          throw new Error(result.error || 'Failed to save academic service record.');
        }
      },
      error: (err: any) => {
          try {
             const fieldErrors = JSON.parse(err.message);
             return `Validation Error: ${Object.entries(fieldErrors).map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`).join('; ')}`;
           } catch (e) {
              return `Error: ${err.message || 'An unknown error occurred'}`;
           }
      },
    });
  };

  const handleDeleteAcademicService = async (serviceId: number) => {
    const actionPromise = deleteAcademicServiceRecord(serviceId);

    toast.promise(actionPromise, {
      loading: 'Deleting academic service record...',
      success: (result: { success: boolean; error?: string }) => {
        if (result.success) {
          setAcademicServicesList((prev) => prev.filter((svc) => svc.id !== serviceId));
          return 'Academic service record deleted successfully!';
        } else {
          throw new Error(result.error || 'Failed to delete academic service record.');
        }
      },
      error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
    });
  };

  // --- Handlers for Presentation CRUD --- Added
  const handleOpenAddPresentationModal = () => {
    setEditingPresentation(null);
    setIsPresentationModalOpen(true);
  };

  const handleOpenEditPresentationModal = (presentation: Presentation) => {
    setEditingPresentation(presentation);
    setIsPresentationModalOpen(true);
  };

  const handleClosePresentationModal = () => {
    setIsPresentationModalOpen(false);
    setEditingPresentation(null);
  };

  const handlePresentationSubmit = async (data: PresentationFormData, presentationId?: number): Promise<void> => {
    const actionPromise = presentationId
      ? updatePresentationRecord(presentationId, data)
      : addPresentationRecord(initialData.id, data);

    toast.promise(actionPromise, {
      loading: 'Saving presentation record...',
      success: (result: { success: boolean; error?: string; presentation?: Presentation }) => {
        if (result.success && result.presentation) {
          if (presentationId) {
            setPresentationList((prev) =>
              prev.map((pres) => (pres.id === presentationId ? result.presentation! : pres))
            );
          } else {
            setPresentationList((prev) => [...prev, result.presentation!]);
          }
          handleClosePresentationModal();
          return `Presentation record ${presentationId ? 'updated' : 'added'} successfully!`;
        } else {
          throw new Error(result.error || 'Failed to save presentation record.');
        }
      },
      error: (err: any) => {
          try {
             const fieldErrors = JSON.parse(err.message);
             return `Validation Error: ${Object.entries(fieldErrors).map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`).join('; ')}`;
          } catch (e) {
             return `Error: ${err.message || 'An unknown error occurred'}`;
          }
      },
    });
  };

  const handleDeletePresentation = async (presentationId: number) => {
    const actionPromise = deletePresentationRecord(presentationId);

    toast.promise(actionPromise, {
      loading: 'Deleting presentation record...',
      success: (result: { success: boolean; error?: string }) => {
        if (result.success) {
          setPresentationList((prev) => prev.filter((pres) => pres.id !== presentationId));
          return 'Presentation record deleted successfully!';
        } else {
          throw new Error(result.error || 'Failed to delete presentation record.');
        }
      },
      error: (err: any) => `Error: ${err.message || 'An unknown error occurred'}`,
    });
  };

  // --- CRUD Handlers for Software & Datasets ---
  const handleOpenAddSoftwareDatasetModal = () => {
      setEditingSoftwareAndDataset(null);
      setIsSoftwareDatasetModalOpen(true);
  };

  const handleOpenEditSoftwareDatasetModal = (record: SoftwareDataset) => {
      setEditingSoftwareAndDataset(record);
      setIsSoftwareDatasetModalOpen(true);
  };

  const handleCloseSoftwareDatasetModal = () => {
      setIsSoftwareDatasetModalOpen(false);
      setEditingSoftwareAndDataset(null);
  };

  const handleSoftwareDatasetSubmit = async (data: SoftwareDatasetFormData): Promise<{ success: boolean; error?: string; softwareDataset?: SoftwareDataset }> => {
      const isEditing = !!editingSoftwareAndDataset;
      // Define action only once
      const action = isEditing
          ? updateSoftwareDatasetRecord(editingSoftwareAndDataset!.id, data) // Update
          : addSoftwareDatasetRecord(initialData.id, data); // Add, using initialData.id

      const promise = action.then(result => {
          if (!result.success || !result.softwareDataset) {
              throw new Error(result.error || "Operation failed or no data returned.");
          }

          if (isEditing) {
              setSoftwareAndDatasetsList(prev =>
                  prev.map(item => (item.id === result.softwareDataset!.id ? result.softwareDataset! : item))
              );
          } else {
              setSoftwareAndDatasetsList(prev => [...prev, result.softwareDataset!]);
          }
          handleCloseSoftwareDatasetModal();
          return result; // Return the successful result
      }).catch(err => {
           console.error("Action failed:", err);
           // Re-throw a clean error for the toast
           throw new Error(err.message || "An unexpected error occurred");
      });

      toast.promise(promise, {
          loading: isEditing ? 'Updating record...' : 'Adding record...',
          success: isEditing ? 'Record updated successfully!' : 'Record added successfully!',
          error: (err: Error) => `Error: ${err.message}`,
      });

      // This function needs to align with its signature, returning the result promise.
      // The onSubmit wrapper will handle the void conversion.
      return promise;
  };

  const handleDeleteSoftwareDataset = async (id: number) => {
      // Add confirmation dialog
      if (!confirm("Are you sure you want to delete this record?")) {
          return;
      }

      const promise = deleteSoftwareDatasetRecord(id).then(result => {
          if (!result.success) {
               throw new Error(result.error || "Failed to delete record.");
          }
          setSoftwareAndDatasetsList(prev => prev.filter(item => item.id !== id));
          return result; // Return result on success
      }).catch(err => {
          console.error("Delete failed:", err);
          throw new Error(err.message || "An unexpected error occurred during deletion.");
      });

       toast.promise(promise, {
          loading: 'Deleting record...',
          success: 'Record deleted successfully!',
          error: (err: Error) => `Error: ${err.message}`,
      });

      // Handle potential errors if needed beyond toast
       try {
          await promise;
      } catch (error) {
          // Errors are toasted, but you might want additional logging or UI feedback here
          console.error("Final catch for delete error:", error);
      }
  };

  return (
    <div className="space-y-6 pb-10"> 

      {/* --- Section 1: Basic Info --- */} 
      {/* Apply blue border, remove gray border, keep existing background */}
      <Card className="dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40">
        {/* Change vertical padding to py-0 */}
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('basicInfo')}>
          {/* Apply blue text color, remove green color, add Info icon and flex layout */}
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Info className="h-5 w-5" /> {/* Add Info icon */}
            Basic Information
          </CardTitle>
          {/* REPLACE chevron button content */}
          <Button variant="ghost" size="icon" aria-label={openSections.basicInfo ? "Collapse Basic Information" : "Expand Basic Information"} className="self-center">
             <motion.div animate={{ rotate: openSections.basicInfo ? 180 : 0 }}>
                <ChevronDown className="h-5 w-5 text-gray-500" />
             </motion.div>
          </Button>
        </CardHeader>
        <motion.div
            initial={false}
            animate={{
                height: openSections.basicInfo ? 'auto' : 0,
                opacity: openSections.basicInfo ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: 'hidden' }}
        >
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          <EditableTextField label="English Name" fieldName="name_en" initialValue={initialData.name_en} memberId={initialData.id} />
          <EditableTextField label="Chinese Name" fieldName="name_zh" initialValue={initialData.name_zh} memberId={initialData.id} />
          <EditableTextField label="Email" fieldName="email" initialValue={initialData.email} memberId={initialData.id} inputType="email" />
          <EditableTextField label="English Title" fieldName="title_en" initialValue={initialData.title_en} memberId={initialData.id} />
          <EditableTextField label="Chinese Title" fieldName="title_zh" initialValue={initialData.title_zh} memberId={initialData.id} />

          <div className="mb-4">
                <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                <Select value={currentStatus ?? ""} onValueChange={handleStatusChange} disabled={isStatusLoading}>
                  <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    {Object.values(MemberStatus).map(status => (
                      <SelectItem key={status} value={status} className="dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                        {formatStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
          </div>

              <div className="mb-4 flex items-center space-x-3 justify-between rounded-md border dark:border-gray-700 p-3 col-span-1 md:col-span-2">
                <Label htmlFor="is_profile_public" className="text-sm font-medium cursor-pointer dark:text-gray-300">
                    Profile Public
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                       Make this member's profile page visible to the public internet.
                    </p>
                </Label>
                <Switch
                  id="is_profile_public"
                  checked={isPublic}
                  onCheckedChange={handleVisibilityChange}
                  disabled={isVisibilityLoading}
                  aria-label="Toggle profile visibility"
                />
          </div>

          <EditableTextField
            label="Enrollment Year"
            fieldName="enrollment_year"
            initialValue={initialData.enrollment_year}
            memberId={initialData.id}
            inputType="number"
          />
          <EditableTextField
            label="Graduation Year"
            fieldName="graduation_year"
            initialValue={initialData.graduation_year}
            memberId={initialData.id}
            inputType="number"
          />

          <EditableTextField label="Office Location" fieldName="office_location" initialValue={initialData.office_location} memberId={initialData.id} />
          <EditableTextField label="Phone Number" fieldName="phone_number" initialValue={initialData.phone_number} memberId={initialData.id} inputType="text" />
          <EditableTextField label="Office Hours" fieldName="office_hours" initialValue={initialData.office_hours} memberId={initialData.id} />
          <EditableTextField label="Pronouns" fieldName="pronouns" initialValue={initialData.pronouns} memberId={initialData.id} placeholder="e.g., she/her, he/him, they/them" />
          {/* Commenting out Avatar URL field as requested */}
          {/* 
          <EditableTextField label="Avatar URL" fieldName="avatar_url" initialValue={initialData.avatar_url} memberId={initialData.id} inputType="url" />
          */}
        </CardContent>
        </motion.div>
      </Card>

      {/* --- Password Change Section --- (修改: 传递状态和切换函数) --- */}
      <PasswordChangeForm 
        memberId={initialData.id} 
        isOpen={openSections.passwordChange} 
        onToggle={() => toggleSection('passwordChange')}
      />
      {/* 移除之前添加的外部包裹 div */}

      {/* --- Username Change Section --- (修改: 传递状态和切换函数) --- */}
      <UsernameChangeForm 
        memberId={initialData.id} 
        currentUsername={initialData.username}
        isOpen={openSections.usernameChange} // 确保传递 isOpen
        onToggle={() => toggleSection('usernameChange')} // 确保传递 onToggle
      />

      {/* --- Section 2: Detailed Profile --- */} 
      {/* Apply blue theme: border, title color, icon */}
      <Card className="dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40">
        {/* Change vertical padding to py-0 */}
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('detailedProfile')}>
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400"> {/* Update class */}
            <ClipboardList className="h-5 w-5" /> {/* Add icon */}
            Detailed Profile
          </CardTitle>
           {/* REPLACE chevron button content */}
           <Button variant="ghost" size="icon" aria-label={openSections.detailedProfile ? "Collapse Detailed Profile" : "Expand Detailed Profile"} className="self-center">
             <motion.div animate={{ rotate: openSections.detailedProfile ? 180 : 0 }}>
                <ChevronDown className="h-5 w-5 text-gray-500" />
             </motion.div>
          </Button>
        </CardHeader>
        <motion.div initial={false} animate={{ height: openSections.detailedProfile ? 'auto' : 0, opacity: openSections.detailedProfile ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: 'hidden' }}>
           <CardContent className="pt-4 grid grid-cols-1 gap-y-1">
          <EditableTextField label="English Bio" fieldName="bio_en" initialValue={initialData.bio_en} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Chinese Bio" fieldName="bio_zh" initialValue={initialData.bio_zh} memberId={initialData.id} isTextArea={true} />
              <EditableTextField label="Research Statement (English)" fieldName="research_statement_en" initialValue={initialData.research_statement_en} memberId={initialData.id} isTextArea={true} />
              <EditableTextField label="Research Statement (Chinese)" fieldName="research_statement_zh" initialValue={initialData.research_statement_zh} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Research Interests" fieldName="research_interests" initialValue={initialData.research_interests} memberId={initialData.id} isTextArea={true} placeholder="Comma-separated interests" />
          <EditableTextField label="Skills" fieldName="skills" initialValue={initialData.skills} memberId={initialData.id} isTextArea={true} placeholder="Comma-separated skills" />
          <EditableTextField label="More About Me" fieldName="more_about_me" initialValue={initialData.more_about_me} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Interests & Hobbies" fieldName="interests_hobbies" initialValue={initialData.interests_hobbies} memberId={initialData.id} isTextArea={true} />
        </CardContent>
        </motion.div>
      </Card>

      {/* --- Section 3: Links --- */}
      <Card className="dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40">
          {/* Change vertical padding to py-0 */}
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('links')}>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400"> {/* Update class */}
                    <Link className="h-5 w-5" /> {/* Add icon */}
                    Links & IDs
                </CardTitle>
                {/* REPLACE chevron button content */}
                <Button variant="ghost" size="icon" aria-label={openSections.links ? "Collapse Links" : "Expand Links"} className="self-center">
                   <motion.div animate={{ rotate: openSections.links ? 180 : 0 }}>
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                   </motion.div>
                </Button>
           </CardHeader>
          {/* Remove the erroneously added/duplicated header line */} 
          {/* <CardHeader className="flex flex-row items-center justify-between cursor-pointer p-2" onClick={() => toggleSection('links')}>
              {/* ... CardTitle ... */}
              {/* ... Button ... */}
           {/* </CardHeader> */}
          <motion.div initial={false} animate={{ height: openSections.links ? 'auto' : 0, opacity: openSections.links ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: 'hidden' }}>
             <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <EditableTextField label="Personal Website" fieldName="personal_website" initialValue={initialData.personal_website} memberId={initialData.id} inputType="url" />
              <EditableTextField label="GitHub Username" fieldName="github_username" initialValue={initialData.github_username} memberId={initialData.id} />
              <EditableTextField label="LinkedIn URL" fieldName="linkedin_url" initialValue={initialData.linkedin_url} memberId={initialData.id} inputType="url" />
              <EditableTextField label="Google Scholar ID" fieldName="google_scholar_id" initialValue={initialData.google_scholar_id} memberId={initialData.id} />
              <EditableTextField label="DBLP ID" fieldName="dblp_id" initialValue={initialData.dblp_id} memberId={initialData.id} />
              <EditableTextField label="CV URL" fieldName="cv_url" initialValue={initialData.cv_url} memberId={initialData.id} inputType="url" />
           </CardContent>
           </motion.div>
      </Card>

      {/* --- Section 4: Education History --- */}
      <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
        {/* Change vertical padding to py-0 */}
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('education')}>
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" /> Education History
            </CardTitle>
            <Button variant="ghost" size="icon" aria-label={openSections.education ? "Collapse Education" : "Expand Education"}>
                <motion.div animate={{ rotate: openSections.education ? 180 : 0 }}>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                </motion.div>
            </Button>
        </CardHeader>
        <AnimatePresence>
          {openSections.education && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="p-4">
                {/* Move Add button here */}
                <Button
                  onClick={handleOpenAddEducationModal} // Removed stopPropagation
                  size="sm"
                  className="mb-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white"
                >
                  Add Education
                </Button>
                {educationHistory.length > 0 ? (
                  <ul className="space-y-3">
                   {[...educationHistory].sort((a, b) => (b.start_year ?? 0) - (a.start_year ?? 0)).map(edu => (
                 <li key={edu.id} className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group">
                   <div className="flex-grow mr-4">
                          <p className="font-semibold dark:text-gray-200">{edu.degree} in {edu.field || 'N/A'}</p>
                     <p className="text-sm text-gray-700 dark:text-gray-300">{edu.school}</p>
                     <p className="text-sm text-gray-500 dark:text-gray-400">{edu.start_year} - {edu.end_year || 'Present'}</p>
                          {edu.thesis_title && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Thesis: {edu.thesis_title}</p>}
                          {edu.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{edu.description}</p>}
                   </div>
                   <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <Button
                             variant="outline"
                             size="icon"
                             className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                             aria-label="Edit education record"
                             onClick={() => handleOpenEditEducationModal(edu)}
                          >
                              <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button
                                      variant="destructive"
                                      size="icon"
                                      className="h-7 w-7 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
                                      aria-label="Delete education record"
                                  >
                                      <X className="h-3.5 w-3.5" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="dark:bg-gray-850 dark:border-gray-700">
                                  <AlertDialogHeader>
                                      <AlertDialogTitle className="dark:text-red-400">Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription className="dark:text-gray-400">
                                          This action cannot be undone. This will permanently delete this education record.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                          onClick={() => handleDeleteEducation(edu.id)}
                                          className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                                      >
                                          Yes, delete it
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                   </div>
                 </li>
              ))}
             </ul>
           ) : (
                 <p className="text-gray-500 italic dark:text-gray-400">No education history added yet.</p>
           )}
        </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* --- Section 5: Awards --- */}
       <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
         {/* Change vertical padding to py-0 */}
         <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('awards')}>
           <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <AwardIcon className="h-5 w-5" /> Awards
           </CardTitle>
            <Button variant="ghost" size="icon" aria-label={openSections.awards ? "Collapse Awards" : "Expand Awards"}>
               <motion.div animate={{ rotate: openSections.awards ? 180 : 0 }}>
                 <ChevronDown className="h-5 w-5 text-gray-500" />
               </motion.div>
            </Button>
         </CardHeader>
         <AnimatePresence>
           {openSections.awards && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.3 }}
               className="overflow-hidden"
             >
               <CardContent className="p-4">
                 {/* Move Add button here */}
                <Button
                  onClick={handleOpenAddAwardModal} // Removed stopPropagation
                  size="sm"
                  className="mb-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white"
                >
                  Add Award
                </Button>
                 {awardsList.length > 0 ? (
                   <ul className="space-y-3">
                          {[...awardsList] // Sort by year (desc), then display_order (asc)
                              .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || (a.display_order ?? Infinity) - (b.display_order ?? Infinity))
                              .map((award: Award) => (
                           <li key={award.id} className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group">
                               <div className="flex-grow mr-4">
                                      <p className="font-semibold dark:text-gray-200">{award.content}</p>
                                   {award.year && <p className="text-sm text-gray-500 dark:text-gray-400">{award.year}</p>}
                                      {/* Optionally display other fields like level or link */}
                                      {award.level && <p className="text-xs text-gray-500 dark:text-gray-400 italic">Level: {award.level}</p>}
                                      {award.link_url && 
                                          <a href={award.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400 block mt-1">
                                              Link
                                          </a>
                                      }
                               </div>
                               <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                      {/* Edit Button */}
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                                        aria-label="Edit award record"
                                        onClick={() => handleOpenEditAwardModal(award)}
                                      >
                                          <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      {/* Delete Button with Confirmation */}
                                       <AlertDialog>
                                           <AlertDialogTrigger asChild>
                                               <Button
                                                   variant="destructive"
                                                   size="icon"
                                                   className="h-7 w-7 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
                                                   aria-label="Delete award record"
                                               >
                                                   <X className="h-3.5 w-3.5" />
                                               </Button>
                                           </AlertDialogTrigger>
                                           <AlertDialogContent className="dark:bg-gray-850 dark:border-gray-700">
                                               <AlertDialogHeader>
                                                   <AlertDialogTitle className="dark:text-red-400">Are you absolutely sure?</AlertDialogTitle>
                                                   <AlertDialogDescription className="dark:text-gray-400">
                                                       This action cannot be undone. This will permanently delete this award record.
                                                   </AlertDialogDescription>
                                               </AlertDialogHeader>
                                               <AlertDialogFooter>
                                                   <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                                                   <AlertDialogAction
                                                       onClick={() => handleDeleteAward(award.id)}
                                                       className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                                                   >
                                                       Yes, delete it
                                                   </AlertDialogAction>
                                               </AlertDialogFooter>
                                           </AlertDialogContent>
                                       </AlertDialog>
                               </div>
                           </li>
                       ))}
                   </ul>
                ) : (
                       <p className="text-gray-500 italic dark:text-gray-400">No awards added yet.</p>
                )}
           </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
       </Card>

      {/* --- Section 6: Featured Publications --- */}
      <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
        {/* Change vertical padding to py-0 */}
        <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('featuredPublications')}>
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Star className="h-5 w-5" /> Featured Publications
          </CardTitle>
           <Button variant="ghost" size="icon" aria-label={openSections.featuredPublications ? "Collapse Featured Publications" : "Expand Featured Publications"}>
               <motion.div animate={{ rotate: openSections.featuredPublications ? 180 : 0 }}>
                 <ChevronDown className="h-5 w-5 text-gray-500" />
               </motion.div>
           </Button>
        </CardHeader>
        <AnimatePresence>
          {openSections.featuredPublications && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select and reorder publications to feature on your public profile.</p>
                {editablePublications.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No publications found for this member.</p>
                )}
                {editablePublications.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={editablePublications.map(p => p.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-1">
                          {editablePublications.map((pub) => (
                            <SortablePublicationItem
                              key={pub.id}
                              pub={pub}
                              isSavingFeatured={isSavingFeatured}
                              onToggleFeatured={handleToggleFeatured}
                            />
                          ))}
                        </div>
                    </SortableContext>
                  </DndContext>
                )}
        </CardContent>
              {editablePublications.length > 0 && (
                <CardFooter className="border-t dark:border-gray-700 p-3">
                  <Button 
                    onClick={handleSaveFeaturedPublications} 
                    disabled={isSavingFeatured} 
                    // Apply blue style (keep default size)
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white disabled:opacity-50"
                  >
                    {isSavingFeatured ? 'Saving...' : 'Save Featured List'}
                  </Button>
                </CardFooter>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* --- Section 7: Projects --- */}
      <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
          {/* Change vertical padding to py-0 */}
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('projects')}>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Briefcase className="h-5 w-5" /> Projects
              </CardTitle>
               <Button variant="ghost" size="icon" aria-label={openSections.projects ? "Collapse Projects" : "Expand Projects"}>
                  <motion.div animate={{ rotate: openSections.projects ? 180 : 0 }}>
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
               </Button>
          </CardHeader>
           <motion.div initial={false} animate={{ height: openSections.projects ? 'auto' : 0, opacity: openSections.projects ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: 'hidden' }}>
             <CardContent className="pt-4">
                  {/* Move Add button here */}
                  <Button size="sm" className="mb-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-white" onClick={handleOpenAddProjectModal}> {/* Removed stopPropagation */}
                    Add Project
                  </Button>
                  {projectsList.length > 0 ? (
                     <ul className="space-y-3">
                        {[...projectsList].sort((a, b) => (b.project.start_year ?? 0) - (a.project.start_year ?? 0)).map(pm => (
                             <li key={`${pm.project_id}-${pm.member_id}`} className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group">
                                <div className="flex-grow mr-4">
                                    <p className="font-semibold dark:text-gray-200">{pm.project.title}</p>
                                    {pm.project.start_year && <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {pm.project.start_year} - {pm.project.end_year || 'Present'}
                                    </p>}
                                    {pm.role && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">Role: {pm.role}</p>}
                                    {pm.project.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pm.project.description}</p>}
                                    {pm.project.url && 
                                       <a href={pm.project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400 block mt-1">
                                           Project Link
                                       </a>
                                   }
                               </div>
                                <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    {/* Edit Button */} 
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                                        aria-label="Edit project record"
                                        onClick={() => handleOpenEditProjectModal(pm)} // Pass the whole project member info
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    {/* Delete Button with Confirmation */} 
                                     <AlertDialog>
                                         <AlertDialogTrigger asChild>
                                             <Button
                                                 variant="destructive"
                                                 size="icon"
                                                 className="h-7 w-7 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
                                                 aria-label="Delete project record"
                                             >
                                                 <X className="h-3.5 w-3.5" />
                                             </Button>
                                         </AlertDialogTrigger>
                                         <AlertDialogContent className="dark:bg-gray-850 dark:border-gray-700">
                                             <AlertDialogHeader>
                                                 <AlertDialogTitle className="dark:text-red-400">Are you sure?</AlertDialogTitle>
                                                 <AlertDialogDescription className="dark:text-gray-400">
                                                     This will remove your association with this project. It will not delete the project itself if others are linked.
                                                 </AlertDialogDescription>
                                             </AlertDialogHeader>
                                             <AlertDialogFooter>
                                                 <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                                                 <AlertDialogAction
                                                     onClick={() => handleDeleteProject(pm.project_id, pm.member_id)} // Pass composite key parts
                                                     className="dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
                                                 >
                                                     Yes, remove link
                                                 </AlertDialogAction>
                                             </AlertDialogFooter>
                                         </AlertDialogContent>
                                     </AlertDialog>
                                </div>
                            </li>
                        ))}
                     </ul>
                  ) : (
                    <p className="text-gray-500 italic dark:text-gray-400">No projects added yet.</p>
                  )}
               </CardContent>
           </motion.div>
      </Card>

      {/* --- Section 8: Presentations --- */}
      <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
           {/* Change vertical padding to py-0 and fix duplicate header */}
           <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('presentations')}>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <PresentationIcon className="h-5 w-5" /> Presentations
                </CardTitle>
                <Button variant="ghost" size="icon" aria-label={openSections.presentations ? "Collapse Presentations" : "Expand Presentations"} className="self-center">
                  <motion.div animate={{ rotate: openSections.presentations ? 180 : 0 }}>
                   <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </Button>
            </CardHeader>
            {/* Remove duplicated header line */}
           {/* <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-1" onClick={() => toggleSection('presentations')}>
              {/* ... CardTitle ... */}
               {/* ... Button ... */}
           {/* </CardHeader> */}
           <motion.div initial={false} animate={{ height: openSections.presentations ? 'auto' : 0, opacity: openSections.presentations ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: 'hidden' }}>
              {/* ... CardContent ... */}
           </motion.div>
      </Card>

       {/* --- Section 9: Software & Datasets --- */}
       <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
          {/* Restore header content and ensure padding is px-3 py-0 */}
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('softwareDatasets')}>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Database className="h-5 w-5" /> Software & Datasets
              </CardTitle>
              <Button variant="ghost" size="icon" aria-label={openSections.softwareDatasets ? "Collapse Software & Datasets" : "Expand Software & Datasets"} className="self-center">
                  <motion.div animate={{ rotate: openSections.softwareDatasets ? 180 : 0 }}>
                   <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
              </Button>
          </CardHeader>
           {/* ... motion.div content ... */}
       </Card>

       {/* --- Section 10: Patents --- */}
       <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
          {/* Restore header content and ensure padding is px-3 py-0 */}
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('patents')}>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <ScrollText className="h-5 w-5" /> Patents
              </CardTitle>
               <Button variant="ghost" size="icon" aria-label={openSections.patents ? "Collapse Patents" : "Expand Patents"} className="self-center">
                 <motion.div animate={{ rotate: openSections.patents ? 180 : 0 }}>
                   <ChevronDown className="h-5 w-5 text-gray-500" />
                 </motion.div>
               </Button>
          </CardHeader>
           {/* ... motion.div content ... */}
       </Card>

        {/* --- Section 11: Academic Services --- */}
        <Card className='mb-6 dark:bg-gray-800 overflow-hidden border-blue-500/50 dark:border-blue-400/40'>
          {/* Restore header content and ensure padding is px-3 py-0 */}
          <CardHeader className="flex flex-row items-center justify-between cursor-pointer px-3 py-0" onClick={() => toggleSection('academicServices')}>
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Users className="h-5 w-5" /> Academic Services
              </CardTitle>
               <Button variant="ghost" size="icon" aria-label={openSections.academicServices ? "Collapse Academic Services" : "Expand Academic Services"} className="self-center">
                 <motion.div animate={{ rotate: openSections.academicServices ? 180 : 0 }}>
                   <ChevronDown className="h-5 w-5 text-gray-500" />
                 </motion.div>
               </Button>
          </CardHeader>
           {/* ... motion.div content ... */}
       </Card>

      {/* Render the Education Modal */}
      <EducationFormModal
        isOpen={isEducationModalOpen}
        onClose={handleCloseEducationModal}
        onSubmit={handleEducationSubmit}
        initialData={editingEducationData}
        memberId={initialData.id}
      />

      {/* Render the Award Modal */}
      <AwardFormModal
        isOpen={isAwardModalOpen}
        onClose={handleCloseAwardModal}
        onSubmit={handleAwardSubmit}
        initialData={editingAward}
        memberId={initialData.id}
      />

      {/* Render the Teaching Modal */}
      <TeachingFormModal
        isOpen={isTeachingModalOpen}
        onClose={handleCloseTeachingModal}
        onSubmit={handleTeachingSubmit}
        initialData={editingTeaching}
        memberId={initialData.id}
      />

      {/* Render the Project Modal */} 
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseProjectModal}
        onSubmit={handleProjectSubmit}
        initialData={editingProjectData}
        memberId={initialData.id}
      />

      {/* Render the Academic Service Modal */} 
      <AcademicServiceFormModal
        isOpen={isAcademicServiceModalOpen}
        onClose={handleCloseServiceModal}
        onSubmit={handleAcademicServiceSubmit}
        initialData={editingAcademicService}
        memberId={initialData.id}
      />

      {/* Render the Presentation Modal */} 
      <PresentationFormModal
        isOpen={isPresentationModalOpen}
        onClose={handleClosePresentationModal}
        onSubmit={handlePresentationSubmit}
        initialData={editingPresentation}
        memberId={initialData.id}
      />

      {/* Render the Software & Datasets Modal */}
      <SoftwareDatasetFormModal
        isOpen={isSoftwareDatasetModalOpen}
        onClose={handleCloseSoftwareDatasetModal}
        onSubmit={async (data) => {
          try {
              // Await the submit handler. Success/error is handled internally (toast, state updates).
              await handleSoftwareDatasetSubmit(data);
              // If it resolves without error, we're done. Return void implicitly.
          } catch (error) {
              // If handleSoftwareDatasetSubmit throws (after toast), catch it here.
              // This prevents unhandled rejections. The error is already displayed via toast.
              console.error("Caught error in onSubmit wrapper:", error);
              // Do not re-throw unless the modal component specifically needs to react to failure.
          }
      }}
        initialData={editingSoftwareAndDataset}
        memberId={initialData.id}
      />

    </div>
  );
} 

// --- Sortable Item Component for Publications --- 
// Restore the component definition and props interface
interface SortablePublicationItemProps {
    pub: EditablePublication;
    isSavingFeatured: boolean;
    onToggleFeatured: (id: number) => void;
}

function SortablePublicationItem({ pub, isSavingFeatured, onToggleFeatured }: SortablePublicationItemProps) {
    const { // Destructure props from useSortable
        attributes,
        listeners, // These are for the drag handle
        setNodeRef, // Ref for the draggable element
        transform,
        transition,
        isDragging, // State to know if it's being dragged
    } = useSortable({ id: pub.id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform), // Apply transform for visual feedback
        transition, // Apply transition for smooth movement
        // Add some visual indication while dragging
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 10 : 'auto',
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
        cursor: 'default', // Default cursor for the item
    };

    return (
        <div
            ref={setNodeRef} // Attach the ref here
            style={style} // Apply dynamic styles
            className={`flex items-start space-x-2 p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-850 relative`} // Add relative for zIndex
        >
            {/* Drag Handle - Apply listeners here */}
            <div
                {...attributes} // Required attributes for sortable item
                {...listeners} // Attach listeners to the handle
                className="pt-1 cursor-grab focus:outline-none touch-none" // Use touch-none for better mobile
                aria-label="Drag to reorder"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-grip-vertical text-gray-400 dark:text-gray-500"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
            </div>
            {/* Checkbox aligned with handle */}
            <Checkbox
                id={`featured-pub-${pub.id}`}
                checked={pub.isFeatured}
                onCheckedChange={() => onToggleFeatured(pub.id)}
                aria-labelledby={`featured-pub-label-${pub.id}`}
                disabled={isSavingFeatured}
                className="mt-1" // Adjust vertical alignment if needed
            />
            {/* Publication details take remaining space */}
            <div className="flex-grow">
                <label
                    htmlFor={`featured-pub-${pub.id}`}
                    id={`featured-pub-label-${pub.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-200 cursor-pointer"
                >
                    {pub.title}
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-2 flex-wrap">
                    <span>{pub.venue} ({pub.year})</span>
                    {pub.ccf_rank && (
                        <span className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                            CCF {pub.ccf_rank}
                        </span>
                    )}
                </div>
            </div>
    </div>
  );
} 