'use client'; // 编辑器是客户端组件，因为它需要交互和状态

import React, { useState, ChangeEvent } from 'react'; // Import ChangeEvent
import type { MemberProfileData } from '@/lib/types'; // 导入成员档案数据类型
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, X, Pencil } from 'lucide-react'; // 引入图标

// 导入 Server Action 用于更新
import { updateMemberField, updateMemberStatus, updateMemberProfileVisibility } from '@/app/actions/memberActions';
// 导入其他需要的组件和类型
import { MemberStatus } from '@/lib/prisma'; // 导入 MemberStatus 枚举
import { toast } from 'sonner'; // Restore import

// --- Props 定义 ---
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
export default function MemberProfileEditor({ initialData }: MemberProfileEditorProps) {
  // --- State for specific fields ---
  const [currentStatus, setCurrentStatus] = useState<MemberStatus | undefined>(initialData.status ?? undefined);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isPublic, setIsPublic] = useState<boolean>(initialData.is_profile_public ?? true); // Default to true if null/undefined initially?
  const [isVisibilityLoading, setIsVisibilityLoading] = useState(false);

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

  return (
    <div className="space-y-6 pb-10"> 

      {/* --- Section 1: Basic Info --- */} 
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-green-400">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
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
          <EditableTextField label="Avatar URL" fieldName="avatar_url" initialValue={initialData.avatar_url} memberId={initialData.id} inputType="url" />
        </CardContent>
      </Card>

      {/* --- Section 2: Detailed Profile --- */} 
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-green-400">Detailed Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-y-1">
          <EditableTextField label="English Bio" fieldName="bio_en" initialValue={initialData.bio_en} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Chinese Bio" fieldName="bio_zh" initialValue={initialData.bio_zh} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Research Statement (English)" fieldName="research_statement_en" initialValue={initialData.research_statement_en} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Research Statement (Chinese)" fieldName="research_statement_zh" initialValue={initialData.research_statement_zh} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Research Interests" fieldName="research_interests" initialValue={initialData.research_interests} memberId={initialData.id} isTextArea={true} placeholder="Comma-separated interests" />
          <EditableTextField label="Skills" fieldName="skills" initialValue={initialData.skills} memberId={initialData.id} isTextArea={true} placeholder="Comma-separated skills" />
          <EditableTextField label="More About Me" fieldName="more_about_me" initialValue={initialData.more_about_me} memberId={initialData.id} isTextArea={true} />
          <EditableTextField label="Interests & Hobbies" fieldName="interests_hobbies" initialValue={initialData.interests_hobbies} memberId={initialData.id} isTextArea={true} />
        </CardContent>
      </Card>

      {/* --- Section 3: Links --- */} 
      <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
              <CardTitle className="dark:text-green-400">Links & IDs</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <EditableTextField label="Personal Website" fieldName="personal_website" initialValue={initialData.personal_website} memberId={initialData.id} inputType="url" />
              <EditableTextField label="GitHub Username" fieldName="github_username" initialValue={initialData.github_username} memberId={initialData.id} />
              <EditableTextField label="LinkedIn URL" fieldName="linkedin_url" initialValue={initialData.linkedin_url} memberId={initialData.id} inputType="url" />
              <EditableTextField label="Google Scholar ID" fieldName="google_scholar_id" initialValue={initialData.google_scholar_id} memberId={initialData.id} />
              <EditableTextField label="DBLP ID" fieldName="dblp_id" initialValue={initialData.dblp_id} memberId={initialData.id} />
              <EditableTextField label="CV URL" fieldName="cv_url" initialValue={initialData.cv_url} memberId={initialData.id} inputType="url" />
          </CardContent>
      </Card>

      {/* --- Section 4: Education History --- */} 
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="dark:text-green-400">Education History</CardTitle>
          <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Education</Button>
        </CardHeader>
        <CardContent>
          {initialData.educationHistory.length > 0 ? (
             <ul className="space-y-3">
              {initialData.educationHistory.map(edu => (
                 <li key={edu.id} className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group">
                   <div className="flex-grow mr-4">
                     <p className="font-semibold dark:text-gray-200">{edu.degree} in {edu.field || 'N/A'}</p>
                     <p className="text-sm text-gray-700 dark:text-gray-300">{edu.school}</p>
                     <p className="text-sm text-gray-500 dark:text-gray-400">{edu.start_year} - {edu.end_year || 'Present'}</p>
                     {edu.thesis_title && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Thesis: {edu.thesis_title}</p>}
                     {edu.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{edu.description}</p>}
                   </div>
                   <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                     <Button variant="outline" size="icon" className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400" aria-label="Edit education record"><Pencil className="h-3.5 w-3.5" /></Button>
                     <Button variant="destructive" size="icon" className="h-7 w-7 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white" aria-label="Delete education record"><X className="h-3.5 w-3.5" /></Button>
                   </div>
                 </li>
              ))}
             </ul>
           ) : (
             <p className="text-gray-500 italic dark:text-gray-400">No education history added yet.</p>
           )}
        </CardContent>
      </Card>

      {/* --- Section 5: Awards --- */} 
       <Card className="dark:bg-gray-800 dark:border-gray-700">
           <CardHeader className="flex flex-row items-center justify-between">
               <CardTitle className="dark:text-green-400">Awards</CardTitle>
               <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Award</Button>
           </CardHeader>
           <CardContent>
                {initialData.awards.length > 0 ? (
                   <ul className="space-y-3">
                       {initialData.awards.map(award => (
                           <li key={award.id} className="border-b dark:border-gray-700 pb-3 flex justify-between items-start group">
                               <div className="flex-grow mr-4">
                                   <p className="font-semibold dark:text-gray-200">{award.content}</p>
                                   {award.year && <p className="text-sm text-gray-500 dark:text-gray-400">{award.year}</p>}
                               </div>
                               <div className="space-x-1 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                   <Button variant="outline" size="icon" className="h-7 w-7 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400" aria-label="Edit award record"><Pencil className="h-3.5 w-3.5" /></Button>
                                   <Button variant="destructive" size="icon" className="h-7 w-7 dark:bg-red-700 dark:hover:bg-red-600 dark:text-white" aria-label="Delete award record"><X className="h-3.5 w-3.5" /></Button>
                               </div>
                           </li>
                       ))}
                   </ul>
                ) : (
                    <p className="text-gray-500 italic dark:text-gray-400">No awards added yet.</p>
                )}
           </CardContent>
       </Card>

      {/* --- Section 6: Publications --- */} 
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-green-400">Featured Publications</CardTitle>
           <p className="text-sm text-gray-500 dark:text-gray-400">Select and order publications to display on the profile.</p>
        </CardHeader>
        <CardContent>
           <p className="text-amber-600 dark:text-amber-400 font-semibold">Implementation needed: Fetch all member publications, display as a checklist/sortable list.</p>
        </CardContent>
      </Card>

      {/* --- Section 7: Other Sections --- */} 
      <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-green-400">Projects</CardTitle>
              <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Project</Button>
          </CardHeader>
          <CardContent><p className="text-gray-500 italic dark:text-gray-400">Project editing not implemented yet.</p></CardContent>
      </Card>
      <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-green-400">Teaching</CardTitle>
              <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Teaching</Button>
          </CardHeader>
          <CardContent><p className="text-gray-500 italic dark:text-gray-400">Teaching editing not implemented yet.</p></CardContent>
      </Card>
       <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-green-400">Presentations</CardTitle>
              <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Presentation</Button>
          </CardHeader>
          <CardContent><p className="text-gray-500 italic dark:text-gray-400">Presentation editing not implemented yet.</p></CardContent>
       </Card>
       <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-green-400">Software & Datasets</CardTitle>
              <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Artefact</Button>
          </CardHeader>
          <CardContent><p className="text-gray-500 italic dark:text-gray-400">Software/Dataset editing not implemented yet.</p></CardContent>
       </Card>
       <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-green-400">Patents</CardTitle>
              <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Patent</Button>
          </CardHeader>
          <CardContent><p className="text-gray-500 italic dark:text-gray-400">Patent editing not implemented yet.</p></CardContent>
       </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="dark:text-green-400">Academic Services</CardTitle>
              <Button size="sm" className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Add Service</Button>
          </CardHeader>
          <CardContent><p className="text-gray-500 italic dark:text-gray-400">Academic Service editing not implemented yet.</p></CardContent>
       </Card>

    </div>
  );
} 