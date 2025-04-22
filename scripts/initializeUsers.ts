import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'GOOD';
const DEFAULT_ROLE = 'User';
const SALT_ROUNDS = 10; // bcrypt salt rounds

async function main() {
  console.log('Starting user initialization script...');

  // 1. Find members potentially needing initialization (without checking name_en yet)
  const potentialMembers = await prisma.member.findMany({
    where: {
      role_name: null,
      username: null,
      password_hash: null,
      // Removed name_en check here to avoid TS errors
    },
    select: {
      id: true,
      name_en: true, // Still select name_en
    },
  });

  // 2. Filter out members without a valid name_en in the script
  const membersToInitialize = potentialMembers.filter(member => 
    member.name_en && member.name_en.trim() !== ''
  );

  if (membersToInitialize.length === 0) {
    console.log('No members found requiring initialization (after filtering).');
    await prisma.$disconnect(); // Disconnect early if no work
    return;
  }

  console.log(`Found ${membersToInitialize.length} members to initialize (after filtering).`);

  // 3. Hash the default password once
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
  console.log('Default password hashed.');

  // 4. Prepare update operations within a transaction
  const updatePromises = membersToInitialize.map((member) => {
    // Generate username from name_en (lowercase, remove spaces)
    // We know name_en is valid here due to the filter above
    const username = member.name_en!.toLowerCase().replace(/\s+/g, ''); 

    console.log(`Preparing update for member ID: ${member.id}, Name: ${member.name_en}, Username: ${username}`);

    return prisma.member.update({
      where: { id: member.id },
      data: {
        username: username,
        password_hash: hashedPassword,
        role_name: DEFAULT_ROLE,
      },
    });
  });

  try {
    // Execute all updates in a single transaction
    console.log('Starting database transaction...');
    await prisma.$transaction(updatePromises);
    console.log(`Successfully initialized ${membersToInitialize.length} members.`);
  } catch (error) {
    console.error('Error during user initialization:', error);
    console.error('Transaction rolled back. No changes were made.');
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  // Ensure disconnection even if main throws early
  await prisma.$disconnect();
}); 