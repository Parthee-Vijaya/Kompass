import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const competencies = await Promise.all([
    prisma.competency.upsert({
      where: { name: 'Personlig pleje' },
      update: {},
      create: { name: 'Personlig pleje', description: 'Hjælp til personlig hygiejne og pleje' },
    }),
    prisma.competency.upsert({
      where: { name: 'Medicinhåndtering' },
      update: {},
      create: { name: 'Medicinhåndtering', description: 'Uddannet i medicindosering' },
    }),
    prisma.competency.upsert({
      where: { name: 'Sårpleje' },
      update: {},
      create: { name: 'Sårpleje', description: 'Specialuddannet i sårbehandling' },
    }),
    prisma.competency.upsert({
      where: { name: 'Rengøring' },
      update: {},
      create: { name: 'Rengøring', description: 'Praktisk hjælp og rengøring' },
    }),
    prisma.competency.upsert({
      where: { name: 'Indkøb' },
      update: {},
      create: { name: 'Indkøb', description: 'Hjælp til indkøb og ærinder' },
    }),
  ])

  console.log(`✅ Created ${competencies.length} competencies`)

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { email: 'anna@plaain.dk' },
      update: {},
      create: {
        name: 'Anna Andersen',
        email: 'anna@plaain.dk',
        phone: '+45 12 34 56 78',
        weeklyHours: 37,
        homeLatitude: 55.6761,
        homeLongitude: 12.5683,
        competencies: {
          connect: [{ name: 'Personlig pleje' }, { name: 'Medicinhåndtering' }],
        },
      },
    }),
    prisma.employee.upsert({
      where: { email: 'bo@plaain.dk' },
      update: {},
      create: {
        name: 'Bo Bertelsen',
        email: 'bo@plaain.dk',
        phone: '+45 23 45 67 89',
        weeklyHours: 37,
        homeLatitude: 55.6850,
        homeLongitude: 12.5700,
        competencies: {
          connect: [{ name: 'Personlig pleje' }, { name: 'Rengøring' }],
        },
      },
    }),
    prisma.employee.upsert({
      where: { email: 'carla@plaain.dk' },
      update: {},
      create: {
        name: 'Carla Christensen',
        email: 'carla@plaain.dk',
        phone: '+45 34 56 78 90',
        weeklyHours: 30,
        homeLatitude: 55.6700,
        homeLongitude: 12.5500,
        competencies: {
          connect: [{ name: 'Personlig pleje' }, { name: 'Medicinhåndtering' }, { name: 'Sårpleje' }],
        },
      },
    }),
    prisma.employee.upsert({
      where: { email: 'david@plaain.dk' },
      update: {},
      create: {
        name: 'David Dalsgaard',
        email: 'david@plaain.dk',
        phone: '+45 45 67 89 01',
        weeklyHours: 37,
        homeLatitude: 55.6900,
        homeLongitude: 12.5900,
        competencies: {
          connect: [{ name: 'Rengøring' }, { name: 'Indkøb' }],
        },
      },
    }),
  ])

  console.log(`✅ Created ${employees.length} employees`)

  const clients = await Promise.all([
    prisma.client.upsert({
      where: { id: 'client-1' },
      update: {},
      create: {
        id: 'client-1',
        name: 'Erik Eriksen',
        address: 'Vesterbrogade 100, 1620 København V',
        latitude: 55.6711,
        longitude: 12.5550,
        phone: '+45 11 22 33 44',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-2' },
      update: {},
      create: {
        id: 'client-2',
        name: 'Fiona Frederiksen',
        address: 'Nørrebrogade 50, 2200 København N',
        latitude: 55.6900,
        longitude: 12.5500,
        phone: '+45 22 33 44 55',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-3' },
      update: {},
      create: {
        id: 'client-3',
        name: 'Gustav Graversen',
        address: 'Amagerbrogade 200, 2300 København S',
        latitude: 55.6600,
        longitude: 12.6000,
        phone: '+45 33 44 55 66',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-4' },
      update: {},
      create: {
        id: 'client-4',
        name: 'Hanne Hansen',
        address: 'Østerbrogade 75, 2100 København Ø',
        latitude: 55.7000,
        longitude: 12.5800,
        phone: '+45 44 55 66 77',
      },
    }),
    prisma.client.upsert({
      where: { id: 'client-5' },
      update: {},
      create: {
        id: 'client-5',
        name: 'Ivan Iversen',
        address: 'Frederiksberg Allé 30, 1820 Frederiksberg',
        latitude: 55.6750,
        longitude: 12.5350,
        phone: '+45 55 66 77 88',
      },
    }),
  ])

  console.log(`✅ Created ${clients.length} clients`)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tasks = await Promise.all([
    prisma.task.upsert({
      where: { id: 'task-1' },
      update: {},
      create: {
        id: 'task-1',
        title: 'Morgenpleje',
        description: 'Hjælp til morgenrutiner og påklædning',
        clientId: 'client-1',
        durationMinutes: 45,
        windowStart: new Date(today.getTime() + 8 * 60 * 60 * 1000),
        windowEnd: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        priority: 'high',
        requiredCompetencies: {
          connect: [{ name: 'Personlig pleje' }],
        },
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-2' },
      update: {},
      create: {
        id: 'task-2',
        title: 'Medicindosering',
        description: 'Ugentlig medicindosering',
        clientId: 'client-2',
        durationMinutes: 30,
        windowStart: new Date(today.getTime() + 9 * 60 * 60 * 1000),
        windowEnd: new Date(today.getTime() + 12 * 60 * 60 * 1000),
        priority: 'high',
        requiredCompetencies: {
          connect: [{ name: 'Medicinhåndtering' }],
        },
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-3' },
      update: {},
      create: {
        id: 'task-3',
        title: 'Rengøring',
        description: 'Ugentlig hovedrengøring',
        clientId: 'client-3',
        durationMinutes: 60,
        windowStart: new Date(today.getTime() + 10 * 60 * 60 * 1000),
        windowEnd: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        priority: 'normal',
        requiredCompetencies: {
          connect: [{ name: 'Rengøring' }],
        },
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-4' },
      update: {},
      create: {
        id: 'task-4',
        title: 'Sårskift',
        description: 'Daglig sårpleje efter operation',
        clientId: 'client-4',
        durationMinutes: 20,
        windowStart: new Date(today.getTime() + 11 * 60 * 60 * 1000),
        windowEnd: new Date(today.getTime() + 13 * 60 * 60 * 1000),
        priority: 'urgent',
        requiredCompetencies: {
          connect: [{ name: 'Sårpleje' }],
        },
      },
    }),
    prisma.task.upsert({
      where: { id: 'task-5' },
      update: {},
      create: {
        id: 'task-5',
        title: 'Indkøb og ærinder',
        description: 'Hjælp til ugens indkøb',
        clientId: 'client-5',
        durationMinutes: 45,
        windowStart: new Date(today.getTime() + 13 * 60 * 60 * 1000),
        windowEnd: new Date(today.getTime() + 16 * 60 * 60 * 1000),
        priority: 'low',
        requiredCompetencies: {
          connect: [{ name: 'Indkøb' }],
        },
      },
    }),
  ])

  console.log(`✅ Created ${tasks.length} tasks`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
