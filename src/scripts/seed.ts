import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  try {
    console.log('Starting database seeding...');

    // Define admin user data
    const adminEmail = 'contact@nedellec-julien.fr';
    const adminPassword = 'BTRKpXIDA6R3jQEJQTxYD9HBf@';

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(
        `Admin user with email ${adminEmail} already exists. Skipping creation.`,
      );
    } else {
      // Create admin user
      const hashedPassword = await hashPassword(adminPassword);
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log(`Admin user created with ID: ${admin.id}`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
    }

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

// Execute the main function and handle disconnection
main()
  .catch((error) => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  })
  .then(() => prisma.$disconnect())
  .catch(() => {
    console.error('Error disconnecting from the database');
    process.exit(1);
  });
