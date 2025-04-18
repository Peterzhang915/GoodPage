import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 10; // Recommended salt rounds for bcrypt

async function setPassword() {
  // Get username and password from command line arguments
  const username = process.argv[2];
  const plainPassword = process.argv[3];

  if (!username || !plainPassword) {
    console.error(
      "Usage: npx ts-node scripts/set-password.ts <username> <password>",
    );
    process.exit(1);
  }

  console.log(`Attempting to set password for user: ${username}`);

  try {
    // Check if user exists
    const user = await prisma.member.findUnique({
      where: { username: username },
      select: { id: true }, // Only need ID to confirm existence
    });

    if (!user) {
      console.error(`Error: User with username "${username}" not found.`);
      process.exit(1);
    }

    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log("Password hashed successfully.");

    // Update the user's password hash in the database
    await prisma.member.update({
      where: { username: username },
      data: { password_hash: hashedPassword },
    });

    console.log(`Successfully updated password hash for user "${username}".`);
  } catch (error) {
    console.error("An error occurred while setting the password:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setPassword();
