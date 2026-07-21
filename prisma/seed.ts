import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

console.log('DATABASE_URL:', process.env.DATABASE_URL);
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
} as any);

async function main() {
  console.log('🌱 Seeding database...');

  const company = await prisma.company.upsert({
    where: { slug: 'nexo-demo' },
    update: {},
    create: { name: 'Nexo Demo', slug: 'nexo-demo', plan: 'trial' },
  });

  // Seed admin/HR users
  const users = [
    { email: 'admin@nexo.hr', password: 'admin123', role: 'ADMIN', firstName: 'System', lastName: 'Admin' },
    { email: 'hr@nexo.hr', password: 'hr123456', role: 'HR_MANAGER', firstName: 'HR', lastName: 'Manager' },
    { email: 'director@nexo.hr', password: 'dir12345', role: 'DIRECTOR', firstName: 'Company', lastName: 'Director' },
    { email: 'head@nexo.hr', password: 'head1234', role: 'DEPARTMENT_HEAD', firstName: 'Department', lastName: 'Head' },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = await prisma.user.create({
        data: { email: u.email, password: hashed, role: u.role, companyId: company.id },
      });
      await prisma.employeeProfile.create({
        data: {
          userId: user.id,
          firstName: u.firstName,
          lastName: u.lastName,
          position: u.role,
          department: 'Administration',
          hireDate: new Date(),
        },
      });
      console.log(`  ✅ Created user: ${u.email} (${u.role})`);
    } else {
      console.log(`  ➡️  Already exists: ${u.email}`);
    }
  }

  // Seed sample vacancies
  const admin = await prisma.user.findUnique({ where: { email: 'admin@nexo.hr' } });
  if (admin) {
    const sampleVacancies = [
      { title: 'Machine Operator', department: 'Production', description: 'Operate production line machinery and ensure quality standards are maintained throughout the manufacturing process.', salaryRange: '2,500,000 – 3,500,000 UZS', status: 'OPEN' },
      { title: 'Quality Controller', department: 'QC', description: 'Monitor product quality on the production line, conduct inspections, and document defects.', salaryRange: '3,000,000 – 4,000,000 UZS', status: 'OPEN' },
      { title: 'Warehouse Specialist', department: 'Logistics', description: 'Manage inventory, coordinate shipments, and maintain accurate stock records.', salaryRange: '2,000,000 – 3,000,000 UZS', status: 'PENDING_APPROVAL' },
    ];

    for (const v of sampleVacancies) {
      const existing = await prisma.vacancy.findFirst({ where: { title: v.title } });
      if (!existing) {
        await prisma.vacancy.create({
          data: { ...v, requirements: 'Minimum 1 year experience, shift availability required', createdBy: admin.id, companyId: company.id },
        });
        console.log(`  ✅ Created vacancy: ${v.title}`);
      }
    }
  }

  // Seed sample KPIs
  const kpiItems = [
    { name: 'Attendance Rate', unit: '%', targetValue: 95 },
    { name: 'Defect Rate', unit: '%', targetValue: 2 },
    { name: 'Plan Completion', unit: '%', targetValue: 100 },
    { name: 'Safety Incidents', unit: 'count', targetValue: 0 },
    { name: 'Learning Completion', unit: '%', targetValue: 90 },
  ];

  for (const kpi of kpiItems) {
    const existing = await prisma.kPI.findFirst({ where: { name: kpi.name } });
    if (!existing) {
      await prisma.kPI.create({ data: kpi });
      console.log(`  ✅ Created KPI: ${kpi.name}`);
    }
  }

  // Seed training tracks
  const tracks = [
    {
      title: 'Machine Operator Onboarding',
      roleTarget: 'Machine Operator',
      modules: [
        { title: 'Company Introduction', type: 'VIDEO', description: 'Introduction to the company culture, mission, and values.' },
        { title: 'Safety & Health Standards', type: 'PDF', description: 'Required safety reading covering PPE usage and emergency procedures.' },
        { title: 'Machine Operation SOP', type: 'VIDEO', description: 'Step-by-step standard operating procedure for line machinery.' },
        { title: 'Safety Quiz', type: 'QUIZ', description: 'Test your knowledge on workplace safety standards.' },
        { title: 'Quality Standards Checklist', type: 'CHECKLIST', description: 'Daily quality checks and documentation procedures.' },
      ],
    },
    {
      title: 'Quality Inspector Training',
      roleTarget: 'Quality Controller',
      modules: [
        { title: 'QC Fundamentals', type: 'PDF', description: 'Quality control principles and inspection methodologies.' },
        { title: 'Measurement Tools Usage', type: 'VIDEO', description: 'Using calipers, gauges, and other precision instruments.' },
        { title: 'QC Assessment', type: 'QUIZ', description: 'Assessment on quality inspection techniques.' },
      ],
    },
  ];

  for (const track of tracks) {
    const existing = await prisma.trainingTrack.findFirst({ where: { title: track.title } });
    if (!existing) {
      await prisma.trainingTrack.create({
        data: {
          title: track.title,
          roleTarget: track.roleTarget,
          modules: {
            create: track.modules,
          },
        },
      });
      console.log(`  ✅ Created training track: ${track.title}`);
    }
  }

  // Career levels
  const levels = [
    { role: 'Operator', levelName: 'Junior Operator', requirements: 'Basic training completed, <6mo experience' },
    { role: 'Operator', levelName: 'Operator', requirements: '6–24mo experience, all SOPs mastered' },
    { role: 'Operator', levelName: 'Senior Operator', requirements: '24+ months, mentoring junior staff' },
    { role: 'Operator', levelName: 'Shift Supervisor', requirements: '36+ months, leadership training, high KPI rating' },
  ];

  for (const level of levels) {
    const existing = await prisma.careerLevel.findFirst({ where: { levelName: level.levelName } });
    if (!existing) {
      await prisma.careerLevel.create({ data: level });
      console.log(`  ✅ Created career level: ${level.levelName}`);
    }
  }

  // Seed sample data for new modules
  const allEmployees = await prisma.employeeProfile.findMany();
  const attendanceKpi = await prisma.kPI.findFirst({ where: { name: 'Attendance Rate' } });
  
  // Find a senior employee to act as mentor
  const mentorEmployee = allEmployees.find(e => e.position.includes('Specialist') || e.position.includes('HR'));
  
  if (allEmployees.length > 0) {
    for (const emp of allEmployees) {
      
      // Assign Mentor
      if (mentorEmployee && mentorEmployee.id !== emp.id) {
        await prisma.employeeProfile.update({
          where: { id: emp.id },
          data: { mentorId: mentorEmployee.id }
        });
      }

      // Onboarding tasks
      const onboardingExists = await prisma.onboardingTask.findFirst({ where: { employeeId: emp.id } });
      if (!onboardingExists) {
        await prisma.onboardingTask.createMany({
          data: [
            { employeeId: emp.id, title: 'Read Employee Handbook', description: 'Review the general company rules and culture.', status: 'COMPLETED' },
            { employeeId: emp.id, title: 'Setup Workstation', description: 'Get access to all necessary IT systems.', status: 'IN_PROGRESS' },
            { employeeId: emp.id, title: 'Initial 1-on-1 with Mentor', description: 'Meet your assigned mentor for the first time.', status: 'PENDING' },
          ]
        });
        console.log(`  ✅ Created onboarding tasks for employee: ${emp.firstName}`);
      }

      // Probation evaluations
      const probationExists = await prisma.probationEvaluation.findFirst({ where: { employeeId: emp.id } });
      if (!probationExists && admin) {
        await prisma.probationEvaluation.create({
          data: {
            employeeId: emp.id,
            evaluatorId: admin.id,
            periodDays: 30,
            disciplineScore: 5,
            learningScore: 4,
            qualityScore: 5,
            comments: 'Excellent start, very proactive and quick learner.',
            result: 'PASSED'
          }
        });
        console.log(`  ✅ Created probation evaluation for employee: ${emp.firstName}`);
      }

      // KPI entries
      if (attendanceKpi) {
        const kpiExists = await prisma.kPIEntry.findFirst({ where: { employeeId: emp.id, kpiId: attendanceKpi.id } });
        if (!kpiExists) {
          await prisma.kPIEntry.createMany({
            data: [
              { employeeId: emp.id, kpiId: attendanceKpi.id, value: 98, periodDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), rating: 'A' },
              { employeeId: emp.id, kpiId: attendanceKpi.id, value: 96, periodDate: new Date(), rating: 'A' },
            ]
          });
          console.log(`  ✅ Created KPI entries for employee: ${emp.firstName}`);
        }
      }
    }

    // Seed sample lessons
    const existingLessons = await prisma.lesson.findMany();
    if (existingLessons.length === 0) {
      const lessonsData = [
        {
          titleRu: 'Основы корпоративной культуры',
          titleUz: 'Korporativ madaniyat asoslari',
          descRu: 'Этот урок познакомит вас с основными ценностями и правилами нашей компании.',
          descUz: 'Ushbu dars sizni kompaniyamizning asosiy qadriyatlari va qoidalari bilan tanishtiradi.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          assignmentRu: 'Напишите краткое эссе о том, как вы понимаете наши ценности.',
          assignmentUz: 'Bizning qadriyatlarimizni qanday tushunishingiz haqida qisqacha esse yozing.',
        },
        {
          titleRu: 'Техника безопасности на производстве',
          titleUz: 'Ishlab chiqarishda xavfsizlik texnikasi',
          descRu: 'Важный инструктаж по технике безопасности при работе с оборудованием.',
          descUz: 'Uskunalar bilan ishlashda xavfsizlik texnikasi bo\'yicha muhim yo\'riqnoma.',
          fileName: 'Safety_Manual.pdf',
          fileContent: 'https://example.com/safety.pdf',
          assignmentRu: 'Пройдите тест по технике безопасности в конце руководства.',
          assignmentUz: 'Qo\'llanma oxiridagi xavfsizlik testidan o\'ting.',
        }
      ];

      for (const ld of lessonsData) {
        const lesson = await prisma.lesson.create({ data: ld });
        console.log(`  ✅ Created lesson: ${ld.titleUz}`);

        // Assign to all employees
        for (const emp of allEmployees) {
          await prisma.lessonAssignment.create({
            data: {
              lessonId: lesson.id,
              employeeId: emp.id,
              status: Math.random() > 0.5 ? 'PENDING' : 'IN_PROGRESS',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          });
        }
      }
      console.log(`  ✅ Created lesson assignments for all employees`);
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log('\nDefault login credentials:');
  console.log('  admin@nexo.hr     / admin123');
  console.log('  hr@nexo.hr        / hr123456');
  console.log('  director@nexo.hr  / dir12345');
  console.log('  head@nexo.hr      / head1234');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
