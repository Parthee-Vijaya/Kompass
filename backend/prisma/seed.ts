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
      where: { email: 'anna@kompass.dk' },
      update: {},
      create: {
        name: 'Anna Andersen',
        email: 'anna@kompass.dk',
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
      where: { email: 'bo@kompass.dk' },
      update: {},
      create: {
        name: 'Bo Bertelsen',
        email: 'bo@kompass.dk',
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
      where: { email: 'carla@kompass.dk' },
      update: {},
      create: {
        name: 'Carla Christensen',
        email: 'carla@kompass.dk',
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
      where: { email: 'david@kompass.dk' },
      update: {},
      create: {
        name: 'David Dalsgaard',
        email: 'david@kompass.dk',
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

  // --- Udvidet mockdata: flere klienter, opgaver og ruter for dashboard/grafer ---
  const existingClientCount = await prisma.client.count()
  if (existingClientCount >= 20) {
    console.log('⏭️ Mockdata findes allerede, springer ekstra data over')
  } else {
  const personligPleje = competencies.find((c) => c.name === 'Personlig pleje')!
  const medicin = competencies.find((c) => c.name === 'Medicinhåndtering')!
  const rengoring = competencies.find((c) => c.name === 'Rengøring')!
  const anna = employees.find((e) => e.email === 'anna@kompass.dk')!
  const bo = employees.find((e) => e.email === 'bo@kompass.dk')!
  const carla = employees.find((e) => e.email === 'carla@kompass.dk')!
  const david = employees.find((e) => e.email === 'david@kompass.dk')!

  const extraClients = [
    { name: 'Karen Kjeldsen', address: 'Jagtvej 88, 2200 København N', lat: 55.698, lng: 12.552 },
    { name: 'Lars Lund', address: 'Sønder Blvd 72, 1720 København V', lat: 55.678, lng: 12.538 },
    { name: 'Mette Mikkelsen', address: 'Nordhavnsvej 4, 2150 København', lat: 55.708, lng: 12.598 },
    { name: 'Niels Nielsen', address: 'Gammel Kongevej 120, 1850 Frederiksberg', lat: 55.678, lng: 12.538 },
    { name: 'Oda Olsen', address: 'Amagerbrogade 88, 2300 København S', lat: 55.662, lng: 12.608 },
    { name: 'Poul Pedersen', address: 'Vester Voldgade 12, 1552 København', lat: 55.678, lng: 12.568 },
    { name: 'Ruth Rasmussen', address: 'Nørre Farimagsgade 45, 1364 København', lat: 55.686, lng: 12.565 },
    { name: 'Søren Sørensen', address: 'Islands Brygge 42, 2300 København S', lat: 55.658, lng: 12.588 },
    { name: 'Tina Thomsen', address: 'Blegdamsvej 6, 2200 København N', lat: 55.695, lng: 12.568 },
    { name: 'Ulla Ulrich', address: 'Falkoner Allé 77, 2000 Frederiksberg', lat: 55.682, lng: 12.538 },
    { name: 'Viggo Vestergaard', address: 'Øresundsvej 22, 2300 København S', lat: 55.655, lng: 12.618 },
    { name: 'Yrsa Yde', address: 'Linnésgade 18, 1361 København', lat: 55.688, lng: 12.572 },
    { name: 'Axel Andersen', address: 'Strandvejen 98, 2900 Hellerup', lat: 55.732, lng: 12.578 },
    { name: 'Bodil Bjerre', address: 'Roskildevej 200, 2620 Albertslund', lat: 55.658, lng: 12.348 },
    { name: 'Claus Carlsen', address: 'Lyngby Hovedgade 45, 2800 Kgs. Lyngby', lat: 55.772, lng: 12.502 },
  ]

  for (const c of extraClients) {
    await prisma.client.upsert({
      where: { id: `mock-${c.name.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `mock-${c.name.replace(/\s/g, '-').toLowerCase()}`,
        name: c.name,
        address: c.address,
        latitude: c.lat,
        longitude: c.lng,
        phone: '+45 00 00 00 00',
      },
    })
  }

  const allClientsForTasks = await prisma.client.findMany({ take: 25 })
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)

  for (let d = -6; d <= 0; d++) {
    const date = new Date(todayStart)
    date.setDate(date.getDate() + d)
    const dayStart = new Date(date)
    dayStart.setHours(8, 0, 0, 0)
    const numTasks = d === 0 ? 18 : d === -1 ? 12 : 6
    for (let i = 0; i < numTasks; i++) {
      const client = allClientsForTasks[i % allClientsForTasks.length]
      if (!client) continue
      const windowStart = new Date(dayStart)
      windowStart.setHours(8 + (i % 6), (i % 4) * 15, 0, 0)
      const windowEnd = new Date(windowStart)
      windowEnd.setHours(17, 0, 0, 0)
      await prisma.task.create({
        data: {
          title: ['Morgenpleje', 'Medicin', 'Rengøring', 'Besøg', 'Sårpleje', 'Indkøb'][i % 6],
          clientId: client.id,
          durationMinutes: [30, 45, 60, 20, 40][i % 5],
          windowStart,
          windowEnd,
          priority: ['low', 'normal', 'high', 'urgent'][i % 4] as 'low' | 'normal' | 'high' | 'urgent',
          status: d < 0 ? 'completed' : i % 3 === 0 ? 'completed' : 'pending',
          requiredCompetencies: {
            connect: [{ id: [personligPleje.id, medicin.id, rengoring.id][i % 3] }],
          },
        },
      })
    }
  }
  console.log('✅ Created extra mock tasks for 7 days')

  const todayDate = new Date(todayStart)
  const empIds = [anna.id, bo.id, carla.id]
  const tasksToday = await prisma.task.findMany({
    where: {
      windowStart: { gte: todayDate, lt: new Date(todayDate.getTime() + 24 * 60 * 60 * 1000) },
    },
    include: { client: true },
    take: 24,
  })

  for (let e = 0; e < 3; e++) {
    const employeeId = empIds[e]
    const route = await prisma.route.upsert({
      where: {
        employeeId_date: { employeeId, date: todayDate },
      },
      create: {
        employeeId,
        date: todayDate,
        totalDistanceKm: 28 + e * 5,
        totalDurationMinutes: 360 + e * 30,
        efficiency: 0.72 + e * 0.06,
        status: 'planned',
      },
      update: {
        totalDistanceKm: 28 + e * 5,
        totalDurationMinutes: 360 + e * 30,
        efficiency: 0.72 + e * 0.06,
      },
    })
    const myTasks = tasksToday.filter((_, i) => i % 3 === e)
    let mins = 8 * 60
    for (let o = 0; o < myTasks.length; o++) {
      const task = myTasks[o]
      const startTime = new Date(todayDate)
      startTime.setHours(0, 0, 0, 0)
      startTime.setMinutes(mins)
      const endTime = new Date(startTime)
      endTime.setMinutes(mins + task.durationMinutes + 15)
      mins = mins + task.durationMinutes + 25
      await prisma.assignment.upsert({
        where: { taskId: task.id },
        create: {
          routeId: route.id,
          employeeId,
          taskId: task.id,
          startTime,
          endTime,
          routeOrder: o,
          travelMinutes: 15,
          status: o < 2 ? 'completed' : 'pending',
        },
        update: {},
      })
    }
  }
  console.log('✅ Created 3 routes with assignments for today')

  for (let d = -5; d <= -1; d++) {
    const date = new Date(todayStart)
    date.setDate(date.getDate() + d)
    const empId = empIds[Math.abs(d) % 3]
    await prisma.route.upsert({
      where: { employeeId_date: { employeeId: empId, date } },
      create: {
        employeeId: empId,
        date,
        totalDistanceKm: 22 + Math.abs(d) * 2,
        totalDurationMinutes: 320,
        efficiency: 0.68 + Math.abs(d) * 0.02,
        status: 'completed',
      },
      update: {},
    })
  }
  console.log('✅ Created historical routes for efficiency trend')
  }

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
