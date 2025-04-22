import React from 'react';
import { getMemberProfileData } from '@/lib/members'; // Import the server-side fetch function
import MemberProfileEditor from '@/components/developer/members/MemberProfileEditor'; // Import the editor component
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma'; // Prisma might not be directly needed here if getMemberProfileData handles it
import { Toaster } from 'sonner'; // Import Toaster for notifications
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
// --- Auth imports (Keep commented for now or restore if ready) ---
// import { getCurrentUser, checkPermission } from '@/lib/auth';

// Define props type for the page component
type MemberEditPageProps = {
  params: { id: string }; // Next.js passes dynamic route params here
};

// This is a Server Component by default in App Router
export default async function MemberEditPage({ params }: MemberEditPageProps) {
  const id = params.id;

  // --- Auth & Permission Check (Keep commented for now) ---
  /*
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/developer/login'); // Redirect to login if not authenticated
  }
  // Check if the current user can edit *this specific* profile
  const canEditThisProfile =
    checkPermission(currentUser, 'manage_users') || // Root/Admin can edit anyone
    (checkPermission(currentUser, 'manage_members') && currentUser.id !== id) || // Senior can edit others
    currentUser.id === id; // Anyone can edit their own profile

  if (!canEditThisProfile) {
    // You might want a more user-friendly permission denied page/component
    return (
        <div className="container mx-auto p-4 text-center text-red-500">
            <h1>Permission Denied</h1>
            <p>You do not have permission to edit this profile.</p>
        </div>
     );
  }
  */
  console.warn("Auth & Permission checks are temporarily disabled in MemberEditPage.");

  // --- Fetch member data ON THE SERVER ---
  let memberData;
  try {
     // Use the dedicated function to fetch data
     memberData = await getMemberProfileData(id, true);
     if (!memberData) {
         // If data is null/undefined after fetching, it means member not found
         console.error(`Member data not found for ID: ${id} in edit page.`);
         notFound(); // Trigger Next.js 404 page
     }
  } catch (error) {
      // Handle potential errors during data fetching (e.g., database connection issues)
      console.error(`Error fetching member data for edit page (ID: ${id}):`, error);
      // Render a generic error message or a dedicated error component
      return (
        <div className="container mx-auto p-4 text-center text-red-500">
            <h1>Error Loading Data</h1>
            <p>Could not load member profile data. Please try again later.</p>
        </div>
       );
  }

  // --- Optional: Fetch auxiliary data if needed by the editor ---
  // Example: Fetch all members for a supervisor dropdown (if needed)
  // const allMembersForSupervisorSelect = await getAllMembersForManager();
  // Example: Fetch all publications for a featured publications selector (if needed)
  // const allPublicationsForFeaturedSelect = await getAllPublications();

  console.log(`Rendering edit page for member: ${memberData.name_en}`);

  // --- Render the Editor Component ---
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-gray-900 text-gray-100 min-h-screen">

      {/* Back Button - Changed to primary blue style */}
      <div className="mb-4">
        <Link href="/developer" passHref>
          <Button 
            variant="default" // CHANGED to default
            size="sm" 
            // CHANGED to blue style
            className="inline-flex items-center text-xs bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 disabled:opacity-50 disabled:bg-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Developer Tools
          </Button>
        </Link>
      </div>

      {/* Page Title - Ensure text color is appropriate for dark bg */}
      <h1 className="text-2xl font-bold mb-6 border-b pb-2 text-green-400 border-gray-700">
        Edit Profile: {memberData.name_en} ({memberData.name_zh || 'N/A'})
      </h1>

      {/* Include Toaster for notifications from Server Actions */}
      <Toaster richColors position="top-center" />

      {/* Render the client component editor, passing the fetched data */}
      <MemberProfileEditor
        initialData={memberData} // Pass the server-fetched data as initialData prop
        // Pass auxiliary data if fetched and needed
        // allMembers={allMembersForSupervisorSelect}
        // allPublications={allPublicationsForFeaturedSelect}
       />
    </div>
  );
}
