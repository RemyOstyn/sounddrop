/**
 * Migration script to generate usernames for existing users
 * This script should be run once after the schema update to add usernames
 * to all existing users who don't have them yet.
 * 
 * Usage: npx tsx scripts/migrate-usernames.ts
 */

import { prisma } from '@/lib/prisma';
import { generateUsernameFromEmail } from '@/lib/username-utils';

async function migrateUsernames() {
  console.log('🚀 Starting username migration...');

  try {
    // Find all users without usernames - since migration already ran, this will likely return empty
    const usersWithoutUsernames = await prisma.user.findMany({
      where: {
        username: { equals: '' }
      },
      select: {
        id: true,
        email: true,
        name: true, // Legacy name field
      }
    });

    console.log(`📊 Found ${usersWithoutUsernames.length} users without usernames`);

    if (usersWithoutUsernames.length === 0) {
      console.log('✅ No migration needed - all users already have usernames');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of usersWithoutUsernames) {
      try {
        console.log(`Processing user: ${user.email}`);

        // Generate unique username
        const username = await generateUsernameFromEmail(user.email);

        // Update user with new username
        await prisma.user.update({
          where: { id: user.id },
          data: {
            username: username,
            // Keep the old name for reference but don't use it publicly
            // displayName is left null - users can set it in settings
          }
        });

        console.log(`✅ Generated username "${username}" for ${user.email}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.email}:`, error);
        errorCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} users`);
    console.log(`❌ Failed to migrate: ${errorCount} users`);
    console.log(`📊 Total processed: ${usersWithoutUsernames.length} users`);

    if (errorCount === 0) {
      console.log('\n🎉 Username migration completed successfully!');
      console.log('Users can now customize their usernames in Settings.');
    } else {
      console.log(`\n⚠️ Migration completed with ${errorCount} errors.`);
      console.log('Please check the error messages above and fix any issues.');
    }

  } catch (error) {
    console.error('💥 Migration failed with error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Validation check before migration
async function validateMigration() {
  console.log('🔍 Validating migration requirements...');

  try {
    // Check if username column exists
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'username'
    ` as any[];

    if (tableInfo.length === 0) {
      throw new Error('Username column not found. Please run database migration first with: npm run db:push');
    }

    console.log('✅ Database schema validation passed');
    return true;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔄 SoundDrop Username Migration');
  console.log('================================\n');

  // Validate prerequisites
  const isValid = await validateMigration();
  if (!isValid) {
    process.exit(1);
  }

  // Confirm with user
  console.log('⚠️  This script will generate usernames for all existing users.');
  console.log('   Make sure you have backed up your database before proceeding.\n');

  // In production, you might want to add a confirmation prompt
  // For now, proceeding automatically in scripts
  
  await migrateUsernames();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
}

export { migrateUsernames, validateMigration };