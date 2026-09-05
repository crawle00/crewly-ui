import { useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Divider, Group, Modal, Paper, PasswordInput, Stack, Text, TextInput, Timeline, Title } from '@mantine/core'
import { useParams, useNavigate } from '../router'
import { deleteAccount, getCurrentUser, getUser, updateCurrentUser } from '../api/userAPI'

function getErrorMessage(requestError) {
  return requestError.response?.data?.error?.message || 'Unable to complete the request.'
}

// TODO: replace with real data once an endpoint for a user's attended listings exists.
const PLACEHOLDER_RECENT_LISTINGS = [
  { id: 1, title: 'Listing one', when: '2 days ago' },
  { id: 2, title: 'Listing two', when: '1 week ago' },
  { id: 3, title: 'Listing three', when: '3 weeks ago' },
]

export default function User() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [profileUser, setProfileUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError('')

    Promise.all([getCurrentUser(), getUser(id)])
      .then(([current, profile]) => {
        if (!isMounted) return
        setCurrentUser(current)
        setProfileUser(profile)
        if (String(current._id) === String(id)) {
          setFirstName(profile.firstName)
          setLastName(profile.lastName)
          setEmail(profile.email)
        }
      })
      .catch((requestError) => {
        if (!isMounted) return
        if (requestError.response?.status === 401) return navigate('/login')
        setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, navigate])

  const isOwnProfile = currentUser && profileUser && String(currentUser._id) === String(profileUser._id)
  const recentListings = PLACEHOLDER_RECENT_LISTINGS.slice(0, 3)

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')
    try {
      const updates = { firstName, lastName, email }
      if (password) updates.password = password
      const updatedUser = await updateCurrentUser(updates)
      setCurrentUser(updatedUser)
      setProfileUser(updatedUser)
      setPassword('')
      setSuccessMessage('Your changes have been saved.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setError('')
    try {
      await deleteAccount()
      navigate('/login')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setIsDeleteOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return null

  if (!profileUser) {
    return (
      <Box p="xl">
        <Text c="dimmed">User not found.</Text>
      </Box>
    )
  }

  return (
    <Box p="xl">
      <Group mb="xl" gap="md">
        <Avatar src={profileUser.pfp} radius="xl" size="lg" color="blue" />
        <Stack gap={0}>
          <Title order={2}>{profileUser.firstName} {profileUser.lastName}</Title>
          {!isOwnProfile && profileUser.bio && <Text c="dimmed" size="sm">{profileUser.bio}</Text>}
        </Stack>
      </Group>

      {error && <Alert color="red" mb="md" withCloseButton onClose={() => setError('')}>{error}</Alert>}
      {successMessage && (
        <Alert color="green" mb="md" withCloseButton onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--mantine-spacing-xl)', alignItems: 'start' }}>
        <Box>
          {isOwnProfile ? (
            <Stack maw={480}>
              <Paper withBorder p="md">
                <form onSubmit={handleSave}>
                  <Stack>
                    <TextInput
                      label="First name"
                      required
                      value={firstName}
                      onChange={(event) => setFirstName(event.currentTarget.value)}
                    />
                    <TextInput
                      label="Last name"
                      required
                      value={lastName}
                      onChange={(event) => setLastName(event.currentTarget.value)}
                    />
                    <TextInput
                      label="Email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.currentTarget.value)}
                    />
                    <PasswordInput
                      label="New password"
                      placeholder="Leave blank to keep your current password"
                      value={password}
                      onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                    <Button type="submit" loading={isSaving}>
                      Save changes
                    </Button>
                  </Stack>
                </form>
              </Paper>

              <Paper withBorder p="md">
                <Button color="red" variant="light" onClick={() => setIsDeleteOpen(true)}>
                  Delete account
                </Button>
              </Paper>
            </Stack>
          ) : (
            <Text c="dimmed">This is {profileUser.firstName}'s profile.</Text>
          )}
        </Box>

        <Paper withBorder p="md">
          <Title order={4} mb="md">Timeline</Title>
          <Timeline active={recentListings.length} bulletSize={14} lineWidth={2}>
            {recentListings.map((listing) => (
              <Timeline.Item key={listing.id} title={listing.title}>
                <Text size="sm" c="dimmed">{listing.when}</Text>
              </Timeline.Item>
            ))}
          </Timeline>
        </Paper>
      </Box>

      <Modal opened={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete account" centered>
        <Text mb="md">
          Are you sure you want to delete your account? This action is permanent and can't be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteAccount} loading={isDeleting}>
            Delete account
          </Button>
        </Group>
      </Modal>
    </Box>
  )
}