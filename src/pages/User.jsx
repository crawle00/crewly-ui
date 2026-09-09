import { useEffect, useState } from 'react'
import { Alert, Avatar, Badge, Box, Button, Container, Divider, Group, Modal, Paper, PasswordInput, SimpleGrid, Stack, TagsInput, Text, TextInput, Textarea, Title, UnstyledButton } from '@mantine/core'
import { useParams, useNavigate } from '../router'
import { deleteAccount, getCurrentUser, getUser, updateCurrentUser } from '../api/API'

function getErrorMessage(requestError) {
  return requestError.response?.data?.error?.message || 'Unable to complete the request.'
}

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
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isPfpOpen, setIsPfpOpen] = useState(false)
  const [pfpDraft, setPfpDraft] = useState('')
  const [isSavingPfp, setIsSavingPfp] = useState(false)

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
          setBio(profile.bio || '')
          setInterests(profile.interests || [])
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

  const handleSave = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')
    try {
      const updates = { firstName, lastName, email, bio, interests }
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

  const openPfpModal = () => {
    setPfpDraft(profileUser.pfp || '')
    setIsPfpOpen(true)
  }

  const handleSavePfp = async () => {
    setIsSavingPfp(true)
    setError('')
    try {
      const trimmed = pfpDraft.trim()
      const updatedUser = await updateCurrentUser({ pfp: trimmed || null })
      setCurrentUser(updatedUser)
      setProfileUser(updatedUser)
      setIsPfpOpen(false)
      setSuccessMessage('Your profile photo has been updated.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSavingPfp(false)
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
        <Text c="dimmed" ta="center">User not found.</Text>
      </Box>
    )
  }

  return (
    <Box p="xl">
      <Container size={640} px={0}>
        <Box
          style={{
            height: 132,
            borderRadius: 'var(--mantine-radius-md)',
            background: 'linear-gradient(135deg, var(--mantine-color-blue-9), var(--mantine-color-blue-6))',
          }}
        />
        <Stack align="center" gap={2} mt={-46} mb="xl">
          {isOwnProfile ? (
            <UnstyledButton
              onClick={openPfpModal}
              aria-label="Change profile photo"
              style={{ position: 'relative', borderRadius: '100%' }}
            >
              <Avatar
                src={profileUser.pfp}
                radius={100}
                size={92}
                color="blue"
                style={{
                  border: '4px solid var(--mantine-color-body)',
                  boxShadow: '0 3px 10px rgba(8, 47, 73, 0.2)',
                }}
              />
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 28,
                  height: 28,
                  borderRadius: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--mantine-color-blue-7)',
                  color: 'white',
                  fontSize: 13,
                  border: '2px solid var(--mantine-color-body)',
                }}
              >
                ✎
              </Box>
            </UnstyledButton>
          ) : (
            <Avatar
              src={profileUser.pfp}
              radius={100}
              size={92}
              color="blue"
              style={{
                border: '4px solid var(--mantine-color-body)',
                boxShadow: '0 3px 10px rgba(8, 47, 73, 0.2)',
              }}
            />
          )}
          <Title order={2} ta="center" mt="sm">{profileUser.firstName} {profileUser.lastName}</Title>
          {isOwnProfile && <Text size="sm" c="dimmed">{profileUser.email}</Text>}
        </Stack>

        {error && <Alert color="red" mb="md" withCloseButton onClose={() => setError('')}>{error}</Alert>}
        {successMessage && (
          <Alert color="green" mb="md" withCloseButton onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {isOwnProfile ? (
          <Stack gap="lg">
            <Paper withBorder radius="md" p="xl">
              <form onSubmit={handleSave}>
                <Stack gap="lg">
                  <Stack gap="md">
                    <Title order={5}>Profile details</Title>
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
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
                    </SimpleGrid>
                    <TextInput
                      label="Email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.currentTarget.value)}
                    />
                    <Textarea
                      label="Bio"
                      placeholder="Tell others a bit about yourself"
                      minRows={3}
                      autosize
                      value={bio}
                      onChange={(event) => setBio(event.currentTarget.value)}
                    />
                    <TagsInput
                      label="Interests"
                      placeholder={interests.length < 5 ? 'Add an interest' : undefined}
                      description="Add up to 5 interests"
                      maxTags={5}
                      value={interests}
                      onChange={setInterests}
                    />
                  </Stack>

                  <Divider />

                  <Stack gap="md">
                    <Title order={5}>Security</Title>
                    <PasswordInput
                      label="New password"
                      placeholder="Leave blank to keep your current password"
                      value={password}
                      onChange={(event) => setPassword(event.currentTarget.value)}
                    />
                  </Stack>

                  <Group justify="flex-end">
                    <Button type="submit" loading={isSaving}>
                      Save changes
                    </Button>
                  </Group>
                </Stack>
              </form>
            </Paper>

            <Paper withBorder radius="md" p="xl">
              <Group justify="flex-end">
                <Button color="red" variant="light" onClick={() => setIsDeleteOpen(true)}>
                  Delete account
                </Button>
              </Group>
            </Paper>
          </Stack>
        ) : (
          <Paper withBorder radius="md" p="xl">
            <Stack gap="lg">
              <Box>
                <Text size="sm" fw={600} c="dimmed" mb={6}>Bio</Text>
                {profileUser.bio ? (
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{profileUser.bio}</Text>
                ) : (
                  <Text c="dimmed" fs="italic">
                    {profileUser.firstName} hasn't added a bio yet.
                  </Text>
                )}
              </Box>

              <Divider />

              <Box>
                <Text size="sm" fw={600} c="dimmed" mb={6}>Interests</Text>
                {profileUser.interests && profileUser.interests.length > 0 ? (
                  <Group gap={6}>
                    {profileUser.interests.map((interest) => (
                      <Badge key={interest} color="blue" variant="light">{interest}</Badge>
                    ))}
                  </Group>
                ) : (
                  <Text c="dimmed" fs="italic">
                    {profileUser.firstName} hasn't added any interests yet.
                  </Text>
                )}
              </Box>
            </Stack>
          </Paper>
        )}
      </Container>

      <Modal opened={isPfpOpen} onClose={() => setIsPfpOpen(false)} title="Change profile photo" centered>
        <Stack>
          <TextInput
            label="Photo URL"
            placeholder="https://example.com/photo.png"
            type="url"
            value={pfpDraft}
            onChange={(event) => setPfpDraft(event.currentTarget.value)}
            data-autofocus
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsPfpOpen(false)} disabled={isSavingPfp}>
              Cancel
            </Button>
            <Button onClick={handleSavePfp} loading={isSavingPfp}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

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