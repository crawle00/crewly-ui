import { useEffect, useMemo, useState } from 'react'
import {
  ActionIcon,
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Image,
  Modal,
  Pagination,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { addClubLeader, createClub, deleteClub, getClubs, getUsers, removeClubLeader, updateClub } from '../api/API'
import { Link as RouterLink, useNavigate } from '../router'
import defaultClubIcon from '../assets/default-club-icon.svg'

const PAGE_SIZE = 10

function getErrorMessage(requestError) {
  return requestError.response?.data?.error?.message || 'Unable to complete the request.'
}

export default function Admin() {
  const [clubs, setClubs] = useState([])
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isManageOpen, setIsManageOpen] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [clubName, setClubName] = useState('')
  const [clubPfp, setClubPfp] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingClub, setIsUpdatingClub] = useState(false)
  const [isUpdatingLeader, setIsUpdatingLeader] = useState(false)
  const navigate = useNavigate()

  const loadClubs = async () => {
    setIsLoading(true)
    try {
      const response = await getClubs({ page, limit: PAGE_SIZE, search })
      setClubs(response.data)
      setTotalPages(response.page.totalPages)
    } catch (requestError) {
      if (requestError.response?.status === 401) return navigate('/login')
      if (requestError.response?.status === 403) return navigate('/')
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getUsers({ limit: 250 })
      .then((response) => setUsers(response.data))
      .catch((requestError) => {
        if (requestError.response?.status === 401) return navigate('/login')
        if (requestError.response?.status === 403) return navigate('/')
        setError(getErrorMessage(requestError))
      })
  }, [navigate])

  useEffect(() => {
    loadClubs()
  }, [page, search])

  const availableUsers = useMemo(() => {
    const leaderIds = new Set((selectedClub?.leaders || []).map(String))
    return users
      .filter((user) => !leaderIds.has(String(user._id)))
      .map((user) => ({ value: String(user._id), label: `${user.firstName} ${user.lastName} (${user.email})` }))
  }, [selectedClub, users])

  const openCreate = () => {
    setClubName('')
    setClubPfp('')
    setError('')
    setIsCreateOpen(true)
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    try {
      await createClub({ name: clubName, pfp: clubPfp || null })
      setIsCreateOpen(false)
      setPage(1)
      await loadClubs()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedClub) return
    setIsDeleting(true)
    setError('')
    try {
      await deleteClub(selectedClub._id)
      setIsManageOpen(false)
      setSelectedClub(null)
      await loadClubs()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdateClub = async (event) => {
    event.preventDefault()
    if (!selectedClub) return
    setIsUpdatingClub(true)
    setError('')
    try {
      const updatedClub = await updateClub(selectedClub._id, { name: clubName, pfp: clubPfp || null })
      setSelectedClub((current) => ({ ...current, ...updatedClub }))
      await loadClubs()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsUpdatingClub(false)
    }
  }

  const handleAddLeader = async () => {
    if (!selectedClub || !selectedUserId) return
    setIsUpdatingLeader(true)
    setError('')
    try {
      await addClubLeader(selectedClub._id, selectedUserId)
      setSelectedUserId(null)
      await loadClubs()
      const response = await getClubs({ page, limit: PAGE_SIZE, search })
      setSelectedClub(response.data.find((club) => String(club._id) === String(selectedClub._id)))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsUpdatingLeader(false)
    }
  }

  const handleRemoveLeader = async (userId) => {
    if (!selectedClub) return
    setIsUpdatingLeader(true)
    setError('')
    try {
      await removeClubLeader(selectedClub._id, userId)
      await loadClubs()
      const response = await getClubs({ page, limit: PAGE_SIZE, search })
      setSelectedClub(response.data.find((club) => String(club._id) === String(selectedClub._id)))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsUpdatingLeader(false)
    }
  }

  const userById = new Map(users.map((user) => [String(user._id), user]))

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" align="flex-end" mb="xl">
        <Stack gap={2}>
          <Title order={1}>Admin</Title>
          <Text c="dimmed">Manage clubs and their leaders.</Text>
        </Stack>
        <Button onClick={openCreate}>Create club</Button>
      </Group>

      {error && <Alert color="red" mb="md" withCloseButton onClose={() => setError('')}>{error}</Alert>}

      <Paper withBorder p="md">
        <Group justify="space-between" mb="md">
          <TextInput
            w={320}
            placeholder="Search clubs"
            value={search}
            onChange={(event) => {
              setPage(1)
              setSearch(event.currentTarget.value)
            }}
          />
          <Text size="sm" c="dimmed">{clubs.length} clubs shown</Text>
        </Group>

        <Table.ScrollContainer minWidth={650}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Club</Table.Th>
                <Table.Th>Leaders</Table.Th>
                <Table.Th ta="right">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {clubs.map((club) => (
                <Table.Tr key={club._id}>
                  <Table.Td>
                    <Group gap="sm" wrap="nowrap">
                      <Image src={club.pfp || defaultClubIcon} alt="" w={48} h={48} radius="sm" fit="cover" />
                      <Text fw={500}>{club.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {(club.leaders || []).map((leaderId) => {
                        const leader = userById.get(String(leaderId))
                        return leader ? (
                          <Anchor key={String(leaderId)} component={RouterLink} to={`/users/${leaderId}`} size="sm" underline="hover" c="inherit" >
                            {leader.firstName} {leader.lastName}
                          </Anchor>
                        ) : (
                          <Text key={String(leaderId)} size="sm">Unknown user</Text>
                        )
                      })}
                      {club.leaders?.length === 0 && <Text size="sm" c="dimmed">No leaders</Text>}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end">
                      <ActionIcon
                        variant="light"
                        aria-label={`Edit ${club.name}`}
                        title={`Edit ${club.name}`}
                        onClick={() => {
                          setSelectedClub(club)
                          setSelectedUserId(null)
                          setClubName(club.name)
                          setClubPfp(club.pfp || '')
                          setIsManageOpen(true)
                        }}
                      >
                        ✎
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!isLoading && clubs.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text ta="center" c="dimmed" py="xl">No clubs found.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Group justify="flex-end" mt="md">
          <Pagination total={Math.max(totalPages, 1)} value={page} onChange={setPage} disabled={isLoading} />
        </Group>
      </Paper>

      <Modal opened={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create club" centered>
        <form onSubmit={handleCreate}>
          <Stack>
            <TextInput label="Name" required value={clubName} onChange={(event) => setClubName(event.currentTarget.value)} />
            <TextInput label="Profile image URL" value={clubPfp} onChange={(event) => setClubPfp(event.currentTarget.value)} />
            <Button type="submit" loading={isSaving}>Create club</Button>
          </Stack>
        </form>
      </Modal>

      <Drawer opened={isManageOpen} onClose={() => setIsManageOpen(false)} title={selectedClub ? `Edit ${selectedClub.name}` : 'Edit club'} position="right" size="md">
        {selectedClub && (
          <Stack gap="xl">
            <Stack gap="sm">
              <Text fw={600}>Club information</Text>
            <form onSubmit={handleUpdateClub}>
              <Stack>
                <TextInput label="Name" required value={clubName} onChange={(event) => setClubName(event.currentTarget.value)} />
                <TextInput label="Profile image URL" value={clubPfp} onChange={(event) => setClubPfp(event.currentTarget.value)} />
                <Button type="submit" loading={isUpdatingClub}>Save changes</Button>
              </Stack>
            </form>
            </Stack>
            <Divider />
            <Stack gap="sm">
              <Text fw={600}>Leaders</Text>
            <SimpleGrid cols={1} spacing="xs">
              {(selectedClub.leaders || []).map((leaderId) => {
                const leader = userById.get(String(leaderId))
                return (
                  <Group key={String(leaderId)} justify="space-between">
                    <Text>{leader ? `${leader.firstName} ${leader.lastName}` : 'Unknown user'}</Text>
                    <ActionIcon color="red" variant="subtle" aria-label="Remove leader" onClick={() => handleRemoveLeader(String(leaderId))} loading={isUpdatingLeader}>
                      ×
                    </ActionIcon>
                  </Group>
                )
              })}
              {selectedClub.leaders?.length === 0 && <Text c="dimmed">This club has no leaders.</Text>}
            </SimpleGrid>
            <Group align="flex-end">
              <Select
                label="Add leader"
                placeholder="Choose a user"
                searchable
                clearable
                data={availableUsers}
                value={selectedUserId}
                onChange={setSelectedUserId}
                flex={1}
              />
              <Button onClick={handleAddLeader} disabled={!selectedUserId} loading={isUpdatingLeader}>Add</Button>
            </Group>
            </Stack>
            <Divider />
            <Stack gap="sm">
              <Text fw={600}>Danger zone</Text>
            <Button color="red" variant="light" loading={isDeleting} onClick={handleDelete}>Delete club</Button>
            </Stack>
          </Stack>
        )}
      </Drawer>
    </Container>
  )
}
