export const userRoles = ['client', 'psychologist', 'psychiatrist', 'counsellor', 'admin'] as const
export type UserRole = (typeof userRoles)[number]

export const clinicalRoles = ['psychologist', 'psychiatrist', 'counsellor'] as const
export type ClinicalRole = (typeof clinicalRoles)[number]

export const sessionTypes = ['online', 'physical'] as const
export type SessionType = (typeof sessionTypes)[number]

export const sessionStatuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const
export type SessionStatus = (typeof sessionStatuses)[number]

export const languages = ['Sinhala', 'Tamil', 'English'] as const
export type SupportedLanguage = (typeof languages)[number]

export const sriLankanProvinces = [
  'Central',
  'Eastern',
  'North Central',
  'Northern',
  'North Western',
  'Sabaragamuwa',
  'Southern',
  'Uva',
  'Western',
] as const

export const crisisResources = [
  {
    label: 'National Mental Health Helpline',
    value: '1926',
    href: 'tel:1926',
  },
  {
    label: 'Emergency Ambulance',
    value: '1990',
    href: 'tel:1990',
  },
] as const

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  verified: boolean
}

export interface PractitionerCard {
  id: string
  name: string
  role: ClinicalRole
  province: string | null
  languages: string[]
  specialty: string | null
  bio: string | null
  sessionTypes: SessionType[]
  verified: boolean
}
