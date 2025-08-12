import React from "react";
import { getMemberProfileData } from "@/lib/members";
import MemberProfileEditor from "@/components/developer/members/MemberProfileEditor";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
// --- Restore notification import ---
// Assuming sonner setup adds Toaster to ui components, otherwise import from 'sonner'
import { Toaster } from "sonner";
// --- Auth imports (keep commented for now or restore if ready) ---
// import { getCurrentUser, checkPermission } from '@/lib/auth';

type MemberEditPageProps = {
  params: { id: string };
};

export default async function MemberEditPage({ params }: MemberEditPageProps) {
  const { id } = params;

  // --- Auth & Permission Check (Keep commented for now) ---
  /*
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/developer/login');
  }
  const canEditThisProfile =
    checkPermission(currentUser, 'manage_users') ||
    (checkPermission(currentUser, 'manage_members') && currentUser.id !== id) ||
    currentUser.id === id;

  if (!canEditThisProfile) {
    return ( <div className="container mx-auto p-4 text-center"> ... Permission Denied ... </div> );
  }
  */
  console.warn(
    "Auth & Permission checks are temporarily disabled in MemberEditPage."
  );

  // --- Fetch member data ---
  let memberData;
  try {
    memberData = await getMemberProfileData(id);
    if (!memberData) {
      console.error(
        `Failed to fetch member data for ID: ${id} using getMemberProfileData.`
      );
      notFound();
    }
  } catch (error) {
    console.error(
      `Error fetching member data for edit page (ID: ${id}):`,
      error
    );
    return <div>Error loading member data. Please try again later.</div>;
  }

  // --- Fetch auxiliary data (TODO) ---
  // const allMembersForSupervisorSelect = await getAllMembersForManager();
  // const allPublicationsForFeaturedSelect = await getAllPublications();

  console.log(`Rendering edit page for member: ${memberData.name_en}`);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">
        Edit Profile: {memberData.name_en} ({memberData.name_zh})
      </h1>
      {/* Restore Toaster */}
      <Toaster richColors position="top-center" />
      <MemberProfileEditor
        initialData={memberData}
        // allMembers={allMembersForSupervisorSelect}
        // allPublications={allPublicationsForFeaturedSelect}
      />
    </div>
  );
}
