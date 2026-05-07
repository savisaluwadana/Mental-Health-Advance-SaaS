const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in .env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    hashedPassword: { type: String, required: true },
    role: String,
    createdAt: Date
  }, { strict: false })

  const User = mongoose.models.User || mongoose.model('User', userSchema)

  const adminEmail = 'admin@safespacelanka.lk'
  const password = 'AdminPassword123!'
  
  const existing = await User.findOne({ email: adminEmail })
  if (existing) {
    if (existing.role === 'admin') {
      console.log('Admin user already exists. Login credentials: admin@safespacelanka.lk / AdminPassword123!')
      process.exit(0)
    } else {
      existing.role = 'admin'
      await existing.save()
      console.log('Updated existing user to admin.')
      process.exit(0)
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  
  await User.create({
    name: 'SafeSpace System Admin',
    email: adminEmail,
    hashedPassword,
    role: 'admin',
    createdAt: new Date()
  })

  console.log(`Successfully created Admin account:\nEmail: ${adminEmail}\nPassword: ${password}`)
  process.exit(0)
}

seed().catch(console.error)
