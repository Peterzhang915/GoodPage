"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MemberStatus } from "@prisma/client"; // Assumes prisma generate fixes the import
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Import Label for file input

// Define available roles based on design.md (excluding Root)
const availableRoles = [
  { value: "Admin", label: "Admin" },
  { value: "SeniorMember", label: "Senior Member" },
  { value: "Maintainer", label: "Maintainer" },
  { value: "User", label: "User" },
];

// Validation Schema using Zod (Adjusted fields)
const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  name_en: z.string().min(1, { message: "English name is required." }),
  name_zh: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  status: z.nativeEnum(MemberStatus, { errorMap: () => ({ message: "Please select a valid status." }) }),
  role_name: z.string({ required_error: "Role is required." }).min(1, { message: "Role is required." }),
  enrollment_year: z.coerce 
    .number({ invalid_type_error: "Year must be a number" })
    .int().positive().gte(1980).lte(new Date().getFullYear() + 1)
    .optional().nullable(),
  title_en: z.string().optional(),
  title_zh: z.string().optional(),
  office_location: z.string().optional(),
  github_username: z.string().optional(),
  personal_website: z.string().url({ message: "Please enter a valid URL (e.g., https://...)." }).optional().or(z.literal('')),
  research_interests: z.string().optional(),
});

interface AddMemberFormProps {
  onSuccess?: () => void; // Callback after successful submission (both steps)
  onCancel?: () => void;  // Callback for cancelling
}

export function AddMemberForm({ onSuccess, onCancel }: AddMemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // State for the avatar file

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name_en: "",
      name_zh: "",
      email: "",
      password: "",
      status: undefined,
      role_name: undefined,
      enrollment_year: null,
      title_en: "",
      title_zh: "",
      office_location: "",
      github_username: "",
      personal_website: "",
      research_interests: "",
    },
  });

  // Handler for file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Optional: Add validation for file type or size here
      if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file.");
          setSelectedFile(null);
          event.target.value = ""; // Clear the input
          return;
      }
      // Optional: Check file size (e.g., max 2MB)
      // const maxSize = 2 * 1024 * 1024; // 2MB
      // if (file.size > maxSize) {
      //     toast.error("File size exceeds 2MB limit.");
      //     setSelectedFile(null);
      //     event.target.value = "";
      //     return;
      // }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  // Updated onSubmit function to call two APIs and handle file upload
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { password, ...memberData } = values; // Separate password from other data

    let finalAvatarUrl: string | null = null; // Initialize avatar URL

    // --- Handle File Upload Logic ---
    if (selectedFile) {
        console.log(`File selected: ${selectedFile.name}, Type: ${selectedFile.type}, Size: ${selectedFile.size}`);
        toast.info("Avatar selected. Attempting upload..."); // More informative toast

        // ---- Start Real Upload Logic ----
        try {
            const uploadFormData = new FormData();
            uploadFormData.append("file", selectedFile); // Key must match backend ('file')
            uploadFormData.append("username", values.username); // Key must match backend ('username')

            toast.info(`Uploading ${selectedFile.name}...`); // Indicate upload start

            const uploadResponse = await fetch("/api/avatar/upload", { // Call the new API
               method: "POST",
               body: uploadFormData,
               // Note: Don't set Content-Type header when sending FormData;
               // the browser will set it correctly with the boundary.
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadResult.success) {
               // Use error message from API response if available
               throw new Error(uploadResult.error || "Failed to upload avatar.");
            }

            finalAvatarUrl = uploadResult.url; // Get the URL returned by the API
            console.log(`Avatar uploaded successfully. URL: ${finalAvatarUrl}`);
            toast.success("Avatar uploaded successfully!");

        } catch (uploadError: any) {
           console.error("Avatar upload error:", uploadError);
           toast.error(`Avatar upload failed: ${uploadError.message}`);
           setIsLoading(false);
           return; // Stop the process if upload fails
        }
        // ---- End Real Upload Logic ----
    } // End of if(selectedFile)
    // --- End Handle File Upload Logic ---

    console.log("Step 1: Creating member with data (including potential avatar URL):", { ...memberData, avatar_url: finalAvatarUrl });
    try {
      // --- Step 1: Create Member (now including avatar_url) ---
      const createMemberResponse = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Include finalAvatarUrl in the data sent
        body: JSON.stringify({ ...memberData, avatar_url: finalAvatarUrl }),
      });

      const createMemberResult = await createMemberResponse.json();

      if (!createMemberResponse.ok || !createMemberResult.success) {
        console.error("Failed to create member:", createMemberResult);
        toast.error(`Failed to create member: ${createMemberResult.error?.message || createMemberResult.error || "Unknown error"}`);
        setIsLoading(false);
        return; // Stop if creation fails
      }

      console.log("Step 1 Success: Member created:", createMemberResult.data);
      // Don't show password toast immediately if it might fail
      // toast.info("Member created. Now setting password via script API...");

      // --- Step 2: Set Password via Script API ---
      console.log(`Step 2: Setting password for username: ${values.username}`);
      const setPasswordResponse = await fetch("/api/admin/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: values.username, password: password }), // Use password from original values
      });

      const setPasswordResult = await setPasswordResponse.json();

      if (!setPasswordResponse.ok || !setPasswordResult.success) {
          console.error("Failed to set password:", setPasswordResult);
          toast.error(`Member created, but failed to set password: ${setPasswordResult.error || "Unknown error"}. Set manually.`);
          // Still call onSuccess even if password fails, as member exists
          if (onSuccess) onSuccess();
      } else {
          console.log("Step 2 Success: Password set via script API.");
          toast.success(`Member ${values.username} added and password set successfully!`);
          form.reset(); // Clear form on full success
          setSelectedFile(null); // Clear selected file state as well
          if (onSuccess) {
            onSuccess(); // Call final success callback
          }
      }

    } catch (error) {
      console.error("Error during member creation/password setting process:", error);
      toast.error("An unexpected error occurred during the process.");
    } finally {
      setIsLoading(false);
    }
  } // End of onSubmit function

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="add-member-form space-y-4 max-h-[70vh] overflow-y-auto pr-4"
      >
        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username*</FormLabel>
              <FormControl>
                <Input placeholder="e.g., jdoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* English Name */}
        <FormField
          control={form.control}
          name="name_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (English)*</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chinese Name */}
        <FormField
          control={form.control}
          name="name_zh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name (Chinese)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 约翰·多伊" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g., jdoe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Password*</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Min. 6 characters" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(MemberStatus).map((status) => (
                    <SelectItem key={status as string} value={status as string}>
                      {status as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
         <FormField
           control={form.control}
           name="role_name"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Role*</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                 <FormControl>
                   <SelectTrigger>
                     <SelectValue placeholder="Select member role" />
                   </SelectTrigger>
                 </FormControl>
                 <SelectContent>
                   {availableRoles.map((role) => (
                     <SelectItem key={role.value} value={role.value}>
                       {role.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <FormMessage />
             </FormItem>
           )}
         />

         {/* --- Avatar Upload Field --- */}
         <FormItem>
              <FormLabel htmlFor="avatarFile">Avatar Image (Optional)</FormLabel>
              <FormControl>
                 <Input
                     id="avatarFile"
                     type="file"
                     accept="image/*"
                     onChange={handleFileChange}
                     className="block w-full text-sm text-gray-400 cursor-pointer rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 
                                file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 
                                file:text-sm file:font-medium 
                                file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
                  />
              </FormControl>
              {/* Optional: Show preview of selected image */}
              {selectedFile && (
                  <div className="mt-2">
                     <img
                         src={URL.createObjectURL(selectedFile)}
                         alt="Avatar preview"
                         className="w-16 h-16 rounded-full object-cover border border-gray-600"
                     />
                  </div>
              )}
              {/* We don't have validation tied to react-hook-form here, so FormMessage might not be needed unless custom validation is added */}
              {/* <FormMessage /> */}
         </FormItem>
         {/* --- End Avatar Upload Field --- */}

        {/* Enrollment Year */}
        <FormField
          control={form.control}
          name="enrollment_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrollment Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder={`e.g., ${new Date().getFullYear()}`} {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title EN */}
         <FormField
           control={form.control}
           name="title_en"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Title (English)</FormLabel>
               <FormControl>
                 <Input placeholder="e.g., Research Assistant" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />

         {/* Title ZH */}
         <FormField
           control={form.control}
           name="title_zh"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Title (Chinese)</FormLabel>
               <FormControl>
                 <Input placeholder="e.g., 研究助理" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />

         {/* Office Location */}
         <FormField
           control={form.control}
           name="office_location"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Office Location</FormLabel>
               <FormControl>
                 <Input placeholder="e.g., Room 301" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />

         {/* GitHub Username */}
         <FormField
           control={form.control}
           name="github_username"
           render={({ field }) => (
             <FormItem>
               <FormLabel>GitHub Username</FormLabel>
               <FormControl>
                 <Input placeholder="e.g., johndoe" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />

         {/* Personal Website */}
         <FormField
           control={form.control}
           name="personal_website"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Personal Website</FormLabel>
               <FormControl>
                 <Input type="url" placeholder="e.g., https://johndoe.com" {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />

         {/* Research Interests */}
         <FormField
           control={form.control}
           name="research_interests"
           render={({ field }) => (
             <FormItem>
               <FormLabel>Research Interests</FormLabel>
               <FormControl>
                 <Textarea placeholder="e.g., Databases, AI, ..." {...field} />
               </FormControl>
               <FormMessage />
             </FormItem>
           )}
         />


        <div className="flex justify-end space-x-2 pt-4">
          <Button 
             type="button" 
             variant="ghost" 
             onClick={onCancel} 
             disabled={isLoading}
             className="text-blue-500 hover:text-blue-400 disabled:opacity-50"
           >
            Cancel
          </Button>
          <Button 
             type="submit" 
             disabled={isLoading}
             className="bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-800"
           >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Member
          </Button>
        </div>
      </form>
      <style jsx global>{`
        .add-member-form::-webkit-scrollbar {
          width: 8px;
        }
        .add-member-form::-webkit-scrollbar-track {
          background: #2d3748; /* gray-800 */ 
          border-radius: 4px;
        }
        .add-member-form::-webkit-scrollbar-thumb {
          background: #4a5568; /* gray-600 */ 
          border-radius: 4px;
        }
        .add-member-form::-webkit-scrollbar-thumb:hover {
          background: #718096; /* gray-500 */ 
        }
        /* Basic Firefox support */
        .add-member-form {
            scrollbar-color: #4a5568 #2d3748; /* thumb track */
            scrollbar-width: thin;
        }
      `}</style>
    </Form>
  );
} 