import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { exit } from "process"; // Import exit explicitly

const prisma = new PrismaClient();
const saltRounds = 10; // Standard salt rounds for bcrypt

async function setPassword() {
  const args = process.argv.slice(2); // Get command line arguments after node and script name
  if (args.length !== 2) {
    console.error("Usage: npx ts-node GoodPage/scripts/set-password.ts <username> <new_password>");
    await prisma.$disconnect(); // Disconnect before exiting
    exit(1);
  }

  const [username, newPassword] = args;

  // --- IMPORTANT ---
  // Print the provided password so the user knows what was set.
  // Do this BEFORE hashing and saving, in case something goes wrong.
  console.log(`---> Attempting to set password for user: ${username}`);
  console.log(`---> Password provided: "${newPassword}" (Keep this safe!)`);
  // --- IMPORTANT ---

  try {
    // Find the user
    const member = await prisma.member.findUnique({
      where: { username: username },
    });

    if (!member) {
      console.error(`Error: User with username "${username}" not found.`);
      await prisma.$disconnect();
      exit(1);
    }

    // Hash the new password
    console.log("Hashing the password...");
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    console.log("Password hashed successfully.");

    // Update the user's password hash in the database
    console.log(`Updating password hash for user ${username}...`);
    await prisma.member.update({
      where: { username: username },
      data: { password_hash: passwordHash },
    });

    console.log(`✅ Successfully updated password hash for user "${username}".`);
    console.log(`🔑 Remember the password you provided: "${newPassword}"`);
  } catch (error) {
    console.error("An error occurred while setting the password:", error);
    exit(1); // Exit with error code
  } finally {
    // Ensure Prisma Client is disconnected
    await prisma.$disconnect();
    console.log("Database connection closed.");
  }
}

// Execute the function
setPassword();
