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

  // Updated onSubmit function to call two APIs
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { password, ...memberData } = values; // Separate password from other data

    console.log("Step 1: Creating member with data:", memberData);
    try {
      // --- Step 1: Create Member (without password) --- 
      const createMemberResponse = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData), // Send data without password
      });

      const createMemberResult = await createMemberResponse.json();

      if (!createMemberResponse.ok || !createMemberResult.success) {
        console.error("Failed to create member:", createMemberResult);
        // Use optional chaining for potentially nested error structure
        toast.error(`Failed to create member: ${createMemberResult.error?.message || createMemberResult.error || "Unknown error"}`);
        setIsLoading(false);
        return; // Stop if creation fails
      }

      console.log("Step 1 Success: Member created:", createMemberResult.data);
      toast.info("Member created. Now setting password via script API...");

      // --- Step 2: Set Password via Script API --- 
      console.log(`Step 2: Setting password for username: ${values.username}`);
      const setPasswordResponse = await fetch("/api/admin/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: values.username, password: password }), // Send username and password
      });

      const setPasswordResult = await setPasswordResponse.json();

      if (!setPasswordResponse.ok || !setPasswordResult.success) {
          console.error("Failed to set password:", setPasswordResult);
          // Inform user that member was created but password setting failed
          toast.error(`Member created, but failed to set password: ${setPasswordResult.error || "Unknown error"}. Check server logs. Please set manually via script if needed.`);
          // Optionally still call onSuccess to close dialog/refresh list, even if password fails
          if (onSuccess) onSuccess(); 
      } else {
          console.log("Step 2 Success: Password set via script API.");
          toast.success(`Member ${values.username} added and password set successfully!`);
          form.reset(); // Clear form on full success
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
  }

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
              <Select onValueChange={field.onChange} defaultValue={field.value as string | undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
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

        {/* Enrollment Year */}
        <FormField
          control={form.control}
          name="enrollment_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrollment Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 2023" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title (English) */}
        <FormField
          control={form.control}
          name="title_en"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (English)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., PhD Student" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title (Chinese) */}
        <FormField
          control={form.control}
          name="title_zh"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (Chinese)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 博士生" {...field} />
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
                <Input placeholder="e.g., Room 501" {...field} />
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
                <Input placeholder="e.g., octocat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Personal Website Field (ADDED) */}
        <FormField
          control={form.control}
          name="personal_website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Website / Blog URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://your-blog.com" {...field} />
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
                <Textarea
                  placeholder="Briefly describe research interests..."
                  className="resize-y min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4 mt-4 border-t border-gray-600">
            <h3 className="text-lg font-medium text-gray-400 mb-4">Optional Information</h3>
        </div>

        <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-gray-800 pb-4 border-t border-gray-700 -mx-4 px-4"> 
           {onCancel && (
            <Button 
              type="button" 
              variant="default"
              onClick={onCancel} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 disabled:opacity-50 disabled:bg-blue-800"
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            variant="default"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 disabled:opacity-50 disabled:bg-blue-800"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              "Add Member & Set Password"
            )}
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