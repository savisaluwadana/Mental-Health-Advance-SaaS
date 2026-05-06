import { PractitionerDirectory } from '../../components/PractitionerDirectory'
import { getPractitioners } from '../../lib/api'

export default async function PractitionersPage() {
  const { practitioners } = await getPractitioners().catch(() => ({ practitioners: [] }))
  return <PractitionerDirectory initialPractitioners={practitioners} />
}
