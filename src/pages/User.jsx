import { useParams } from '../router'

export default function User() {
  const { id } = useParams()
  return <h2>User {id}</h2>
}
