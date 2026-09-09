import { useEffect, useState } from 'react'
import { ActionIcon, Alert, Avatar, Badge, Box, Button, Container, Divider, Group, Modal, Paper, PasswordInput, SimpleGrid, Stack, TagsInput, Text, TextInput, Textarea, Title, UnstyledButton } from '@mantine/core'
import { useParams, useNavigate } from '../router'
import { deleteAccount, getClub, getCurrentUser, getManagedClubs, getUser, logout, updateCurrentUser } from '../api/API'
import defaultClubIcon from '../assets/default-club-icon.svg'

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
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState([])
  const [managedClubs, setManagedClubs] = useState([])
  const [profileClubs, setProfileClubs] = useState([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [draftFirstName, setDraftFirstName] = useState('')
  const [draftLastName, setDraftLastName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [draftBio, setDraftBio] = useState('')
  const [draftInterests, setDraftInterests] = useState([])
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isPfpOpen, setIsPfpOpen] = useState(false)
  const [pfpDraft, setPfpDraft] = useState('')
  const [isSavingPfp, setIsSavingPfp] = useState(false)

  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

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
          getManagedClubs()
            .then((clubs) => {
              if (isMounted) setManagedClubs(clubs)
            })
            .catch(() => {
              if (isMounted) setManagedClubs([])
            })
        } else if (profile.clubManagement && profile.clubManagement.length > 0) {
          Promise.all(profile.clubManagement.map((clubId) => getClub(clubId)))
            .then((clubs) => {
              if (isMounted) setProfileClubs(clubs)
            })
            .catch(() => {
              if (isMounted) setProfileClubs([])
            })
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

  const openEditModal = () => {
    setDraftFirstName(firstName)
    setDraftLastName(lastName)
    setDraftEmail(email)
    setDraftBio(bio)
    setDraftInterests(interests)
    setError('')
    setIsEditOpen(true)
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setIsSavingProfile(true)
    setError('')
    setSuccessMessage('')
    try {
      const updates = {
        firstName: draftFirstName,
        lastName: draftLastName,
        email: draftEmail,
        bio: draftBio,
        interests: draftInterests,
      }
      const updatedUser = await updateCurrentUser(updates)
      setCurrentUser(updatedUser)
      setProfileUser(updatedUser)
      setFirstName(updatedUser.firstName)
      setLastName(updatedUser.lastName)
      setEmail(updatedUser.email)
      setBio(updatedUser.bio || '')
      setInterests(updatedUser.interests || [])
      setIsEditOpen(false)
      setSuccessMessage('Your changes have been saved.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
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

  const openPasswordModal = () => {
    setCurrentPassword('')
    setNewPassword('')
    setPasswordError('')
    setIsPasswordOpen(true)
  }

  const handleChangePassword = async () => {
    setIsSavingPassword(true)
    setPasswordError('')
    try {
      await updateCurrentUser({ currentPassword, password: newPassword })
      await logout()
      navigate('/login')
    } catch (requestError) {
      setPasswordError(getErrorMessage(requestError))
    } finally {
      setIsSavingPassword(false)
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
        <Box style={{ position: 'relative' }}>
          <Box
            style={{
              height: 132,
              borderRadius: 'var(--mantine-radius-md)',
              background: 'linear-gradient(135deg, var(--mantine-color-blue-9), var(--mantine-color-blue-6))',
            }}
          />
          {isOwnProfile && (
            <>
              <ActionIcon
                variant="white"
                color="blue"
                size="lg"
                onClick={openEditModal}
                aria-label="Edit profile details"
                style={{ position: 'absolute', top: 12, left: 12 }}
              >
                ✎
              </ActionIcon>
              <Button
                variant="white"
                color="blue"
                size="xs"
                onClick={handleLogout}
                loading={isLoggingOut}
                style={{ position: 'absolute', top: 12, right: 12 }}
              >
                Log out
              </Button>
            </>
          )}
        </Box>
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
              <Stack gap="lg">
                <Box pl="md" style={{ borderLeft: '3px solid var(--mantine-color-blue-3)' }}>
                  {bio ? (
                    <Text fs="italic" style={{ whiteSpace: 'pre-wrap' }}>“{bio}”</Text>
                  ) : (
                    <Text c="dimmed" fs="italic">No bio yet.</Text>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Text size="sm" c="dimmed" mb={6}>Interests</Text>
                  {interests.length > 0 ? (
                    <Group gap={6}>
                      {interests.map((interest) => (
                        <Badge key={interest} color="blue" variant="light">{interest}</Badge>
                      ))}
                    </Group>
                  ) : (
                    <Text c="dimmed" fs="italic">No interests yet.</Text>
                  )}
                </Box>
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="xl">
              <Title order={5} mb="md">Clubs</Title>
              {managedClubs.length > 0 ? (
                <Stack gap="sm">
                  {managedClubs.map((club) => (
                    <Group key={club._id} gap="sm" wrap="nowrap">
                      <Avatar src={club.pfp || defaultClubIcon} radius="sm" size={36} />
                      <Text>{club.name}</Text>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed" fs="italic">You don't lead any clubs yet.</Text>
              )}
            </Paper>

            <Paper withBorder radius="md" p="xl">
              <Group justify="space-between">
                <Button variant="default" onClick={openPasswordModal}>
                  Change password
                </Button>
                <Button color="red" variant="light" onClick={() => setIsDeleteOpen(true)}>
                  Delete account
                </Button>
              </Group>
            </Paper>
          </Stack>
        ) : (
          <Paper withBorder radius="md" p="xl">
            <Stack gap="lg">
              <Box pl="md" style={{ borderLeft: '3px solid var(--mantine-color-blue-3)' }}>
                {profileUser.bio ? (
                  <Text fs="italic" style={{ whiteSpace: 'pre-wrap' }}>“{profileUser.bio}”</Text>
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

              <Divider />

              <Box>
                <Text size="sm" fw={600} c="dimmed" mb={6}>Clubs</Text>
                {profileClubs.length > 0 ? (
                  <Stack gap="sm">
                    {profileClubs.map((club) => (
                      <Group key={club._id} gap="sm" wrap="nowrap">
                        <Avatar src={club.pfp || defaultClubIcon} radius="sm" size={36} />
                        <Text>{club.name}</Text>
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Text c="dimmed" fs="italic">
                    {profileUser.firstName} doesn't lead any clubs yet.
                  </Text>
                )}
              </Box>

              {profileUser.createdAt && (
                <Text size="sm" c="dimmed">
                  Member since {new Date(profileUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
              )}
            </Stack>
          </Paper>
        )}
      </Container>

      <Modal opened={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit profile details" centered size="md">
        <form onSubmit={handleSaveProfile}>
          <Stack>
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                label="First name"
                required
                value={draftFirstName}
                onChange={(event) => setDraftFirstName(event.currentTarget.value)}
                data-autofocus
              />
              <TextInput
                label="Last name"
                required
                value={draftLastName}
                onChange={(event) => setDraftLastName(event.currentTarget.value)}
              />
            </SimpleGrid>
            <TextInput
              label="Email"
              required
              value={draftEmail}
              onChange={(event) => setDraftEmail(event.currentTarget.value)}
            />
            <Textarea
              label="Bio"
              placeholder="Tell others a bit about yourself"
              minRows={3}
              autosize
              value={draftBio}
              onChange={(event) => setDraftBio(event.currentTarget.value)}
            />
            <TagsInput
              label="Interests"
              placeholder={draftInterests.length < 5 ? 'Add an interest' : undefined}
              description="Add up to 5 interests"
              maxTags={5}
              value={draftInterests}
              onChange={setDraftInterests}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setIsEditOpen(false)} disabled={isSavingProfile}>
                Cancel
              </Button>
              <Button type="submit" loading={isSavingProfile}>
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

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

      <Modal opened={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} title="Change password" centered>
        <Stack>
          {passwordError && <Alert color="red">{passwordError}</Alert>}
          <PasswordInput
            label="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.currentTarget.value)}
            data-autofocus
          />
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
          />
          <Text size="xs" c="dimmed">
            You'll be logged out after saving, so you can sign back in with your new password.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setIsPasswordOpen(false)} disabled={isSavingPassword}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} loading={isSavingPassword}>
              Save changes
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