import 'dotenv/config'
import { PrismaClient, Role, SessionStatus, SessionType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const password = 'SafeSpace123!'

async function upsertUser(data: {
  name: string
  email: string
  role: Role
  province?: string
  languages?: string[]
  specialty?: string
  bio?: string
  sessionTypes?: SessionType[]
  verified?: boolean
  slmcRegNo?: string
}) {
  const hashedPassword = await bcrypt.hash(password, 12)

  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      name: data.name,
      role: data.role,
      province: data.province,
      languages: data.languages ?? [],
      specialty: data.specialty,
      bio: data.bio,
      sessionTypes: data.sessionTypes ?? [],
      verified: data.verified ?? false,
      slmcRegNo: data.slmcRegNo,
    },
    create: {
      ...data,
      languages: data.languages ?? [],
      sessionTypes: data.sessionTypes ?? [],
      verified: data.verified ?? false,
      hashedPassword,
    },
  })
}

async function main() {
  const admin = await upsertUser({
    name: 'SafeSpace Admin',
    email: 'admin@safespacelanka.lk',
    role: Role.admin,
    verified: true,
  })

  const client = await upsertUser({
    name: 'Nila Perera',
    email: 'client@safespacelanka.lk',
    role: Role.client,
    province: 'Western',
    languages: ['Sinhala', 'English'],
    verified: true,
  })

  const psychologist = await upsertUser({
    name: 'Dr. Anjali Fernando',
    email: 'psychologist@safespacelanka.lk',
    role: Role.psychologist,
    province: 'Western',
    languages: ['Sinhala', 'English'],
    specialty: 'Anxiety, trauma recovery, workplace burnout',
    bio: 'Clinical psychologist focused on practical, culturally grounded care plans.',
    sessionTypes: [SessionType.online, SessionType.physical],
    verified: true,
    slmcRegNo: 'PSY-1024',
  })

  await upsertUser({
    name: 'Dr. Arul Nadarajah',
    email: 'psychiatrist@safespacelanka.lk',
    role: Role.psychiatrist,
    province: 'Northern',
    languages: ['Tamil', 'English'],
    specialty: 'Medication management, depression, bipolar care',
    bio: 'Psychiatrist supporting collaborative treatment plans and safe prescriptions.',
    sessionTypes: [SessionType.online],
    verified: true,
    slmcRegNo: 'SLMC-7781',
  })

  await prisma.clientProfile.upsert({
    where: { userId: client.id },
    update: {
      diagnosis: ['Generalized anxiety'],
      currentMedications: [],
      emergencyContactName: 'Maya Perera',
      emergencyContactPhone: '+94770000000',
      emergencyContactRelation: 'Sister',
      assignedPractitionerId: psychologist.id,
    },
    create: {
      userId: client.id,
      diagnosis: ['Generalized anxiety'],
      currentMedications: [],
      emergencyContactName: 'Maya Perera',
      emergencyContactPhone: '+94770000000',
      emergencyContactRelation: 'Sister',
      assignedPractitionerId: psychologist.id,
    },
  })

  await prisma.session.create({
    data: {
      clientId: client.id,
      practitionerId: psychologist.id,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      duration: 60,
      type: SessionType.online,
      status: SessionStatus.confirmed,
      meetingLink: 'https://meet.safespace.local/demo',
    },
  })

  await prisma.moodEntry.upsert({
    where: {
      clientId_date: {
        clientId: client.id,
        date: new Date('2026-05-06T00:00:00.000Z'),
      },
    },
    update: {
      score: 7,
      emotions: ['hopeful', 'tired'],
      note: 'Felt steadier after the breathing exercise.',
      sharedWithPractitioner: true,
    },
    create: {
      clientId: client.id,
      date: new Date('2026-05-06T00:00:00.000Z'),
      score: 7,
      emotions: ['hopeful', 'tired'],
      note: 'Felt steadier after the breathing exercise.',
      sharedWithPractitioner: true,
    },
  })

  await prisma.goal.create({
    data: {
      clientId: client.id,
      practitionerId: psychologist.id,
      title: 'Practice evening decompression',
      description: 'Use the 4-7-8 breathing routine three evenings this week.',
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      weeklyCheckIns: {
        create: {
          week: new Date('2026-05-04T00:00:00.000Z'),
          progressRating: 4,
          note: 'Completed twice and noticed better sleep.',
        },
      },
    },
  })

  await prisma.article.createMany({
    data: [
      {
        title: 'Grounding Skills for Panic',
        category: 'Anxiety',
        desc: 'A quick guide to orienting your body and attention during panic spikes.',
        readTime: '4 min',
        marker: 'A',
      },
      {
        title: 'Preparing for Your First Session',
        category: 'Therapy',
        desc: 'What to expect, what to bring, and how to set a useful first goal.',
        readTime: '5 min',
        marker: 'T',
      },
    ],
    skipDuplicates: true,
  })

  await prisma.keywordAlert.upsert({
    where: { keyword: 'suicide' },
    update: { category: 'crisis', createdById: admin.id },
    create: { keyword: 'suicide', category: 'crisis', createdById: admin.id },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
