const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@nexo-hr.uz';
  const password = 'admin123_Nexo';
  const role = 'ADMIN';

  console.log(`Checking if user ${email} exists...`);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin user already exists.');
    return;
  }

  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      employeeProfile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          department: 'Management',
          position: 'Admin',
          hireDate: new Date(),
        },
      },
    },
  });

  console.log('Admin user created successfully:', user.email);
  console.log('Credentials:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
