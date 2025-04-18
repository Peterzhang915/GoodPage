// GoodPage/src/config/developerMotd.ts

// Define the structure for MOTD lines (imported implicitly by useDeveloperLogin)
// Or define it here explicitly if preferred
interface MotdLine {
  text: string;
  requiresConfirmation?: boolean; // Example: Add structure if needed later
}

// Placeholder MOTD (Message Of The Day) lines as MotdLine[]
// Replace these with your actual desired messages and structure.
export const developerMotd: MotdLine[] = [
  { text: "GOOD Lab Developer Access Terminal v1.0" },
  { text: "System Date: " + new Date().toLocaleDateString() },
  { text: "-------------------------------------------" },
  { text: "[WARN] Unauthorized access is strictly prohibited." },
  { text: "[INFO] All activities are monitored and logged." },
  { text: "" }, // Empty line for spacing
  { text: "> Please authenticate to proceed." },
];
