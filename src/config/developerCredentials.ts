// GoodPage/src/config/developerCredentials.ts

// Define the structure for permission entries
// (Matches the type used in useDeveloperLogin hook)
export interface DeveloperPermission {
  username: string;
  permissions: string[]; // List of granted permission keys (e.g., 'manage_news', 'manage_users')
  isFullAccess: boolean; // Simplified flag for root/admin access
}

// Define the structure for credential entries
// (Matches the type used in useDeveloperLogin hook)
export interface DeveloperCredential {
  username: string;
  password: string; // In a real app, use hashed passwords!
}

// --- Placeholder Data ---
// IMPORTANT: Replace this with your actual credentials and permissions.
// NEVER commit real credentials directly into code.
// Use environment variables or a secure configuration method.

export const developerCredentials: DeveloperCredential[] = [
  { username: "admin", password: "password123" }, // Example admin
  { username: "dev", password: "devpassword" }, // Example developer
];

export const developerPermissions: DeveloperPermission[] = [
  {
    username: "admin",
    permissions: [
      "manage_users",
      "manage_news",
      "manage_publications",
      "manage_members",
      "manage_photos",
    ], // Example permissions
    isFullAccess: true,
  },
  {
    username: "dev",
    permissions: ["manage_news", "manage_photos"], // Example limited permissions
    isFullAccess: false,
  },
];
