import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Image,
  List,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TagsInput,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core'
import { createListing, getManagedClubs } from '../api/API'
import { useNavigate } from '../router'
import defaultClubIcon from '../assets/default-club-icon.svg'

function getFriendlyValidationMessage(detail) {
  const field = detail.field
  const message = detail.message || ''

  if (field === 'endsAt' || message.includes('after startsAt')) {
    return 'Your end date must be after the start date.'
  }

  if (field === 'startsAt' || message.includes('in the future')) {
    return 'Your start date must be in the future.'
  }

  if (field === 'title' || message.includes('title')) {
    return 'Please add a title for your listing.'
  }

  if (field === 'description' || message.includes('description')) {
    return 'Please add a description for your listing.'
  }

  if (field === 'location.name' || field === 'location' || message.includes('location')) {
    return 'Please add a location name for the opportunity.'
  }

  if (field === 'contactEmail' || message.includes('email')) {
    return 'Please enter a valid contact email.'
  }

  if (field === 'clubId' || message.includes('club')) {
    return 'Please choose a club for this listing.'
  }

  return 'Please review the form and try again.'
}

function getErrorState(requestError) {
  const backendError = requestError.response?.data?.error
  const details = Array.isArray(backendError?.details) ? backendError.details : []
  const friendlyDetails = details.length > 0
    ? details.map(getFriendlyValidationMessage)
    : [backendError?.message || 'Unable to complete the request.']

  return {
    summary: friendlyDetails[0] || 'Unable to complete the request.',
    details: friendlyDetails,
  }
}

function getEstimatedHours(startsAt, endsAt) {
  const duration = new Date(endsAt).getTime() - new Date(startsAt).getTime()
  if (!Number.isFinite(duration) || duration <= 0) return ''
  return (duration / (1000 * 60 * 60)).toFixed(2)
}

export default function CreateListing() {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [clubId, setClubId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const timezone = 'CDT'
  const [bannerImage, setBannerImage] = useState('')
  const [capacity, setCapacity] = useState('')
  const [tags, setTags] = useState([])
  const [contactEmail, setContactEmail] = useState('')
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getManagedClubs()
      .then((managedClubs) => setClubs(managedClubs))
      .catch((requestError) => {
        if (requestError.response?.status === 401) return navigate('/login')
        setError(getErrorState(requestError))
      })
      .finally(() => setIsLoadingClubs(false))
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    if (!clubId) return setError({ message: 'Choose a club before creating the listing.', summary: 'Choose a club before creating the listing.', details: [] })
    setIsSaving(true)
    try {
      const estimatedHours = getEstimatedHours(startsAt, endsAt)
      const normalizedStartsAt = startsAt ? new Date(startsAt).toISOString() : ''
      const normalizedEndsAt = endsAt ? new Date(endsAt).toISOString() : ''
      const listing = {
        clubId,
        title: title.trim(),
        description: description.trim(),
        bannerImage: bannerImage.trim() || null,
        location: {
          name: locationName.trim(),
          address: isRemote ? '' : locationAddress.trim(),
          isRemote,
        },
        startsAt: normalizedStartsAt,
        endsAt: normalizedEndsAt,
        timezone,
        capacity: capacity ? Number(capacity) : null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        tags,
        skillTags: [],
        cause: '',
        workType: '',
        requirements: [],
        contactEmail: contactEmail.trim() || undefined,
      }
      await createListing(listing)
      navigate('/')
    } catch (requestError) {
      if (requestError.response?.status === 401) return navigate('/login')
      setError(getErrorState(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Stack gap="xs" mb="xl">
        <Title order={1}>Create a listing</Title>
        <Text c="dimmed">Share an opportunity with the Crewly community.</Text>
      </Stack>

      {error && (
        <Alert color="red" mb="md" withCloseButton onClose={() => setError(null)}>
          <Stack gap={4}>
            <Text fw={600}>We couldn’t create this listing.</Text>
            <Text size="sm">{error.summary}</Text>
            {error.details.length > 1 && (
              <List size="sm" spacing="xs" withPadding>
                {error.details.slice(1).map((detail, index) => (
                  <List.Item key={`${detail}-${index}`}>{detail}</List.Item>
                ))}
              </List>
            )}
          </Stack>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Stack gap="md">
              <Select
                label="Club"
                placeholder={isLoadingClubs ? 'Loading clubs...' : 'Choose a club'}
                required
                searchable
                data={clubs.map((club) => ({
                  value: String(club._id),
                  label: club.name,
                  image: club.pfp || defaultClubIcon,
                }))}
                renderOption={({ option }) => (
                  <Group gap="sm" wrap="nowrap">
                    <Image src={option.image} alt="" w={32} h={32} radius="sm" fit="cover" />
                    <Text>{option.label}</Text>
                  </Group>
                )}
                value={clubId}
                onChange={setClubId}
                disabled={isLoadingClubs}
                nothingFoundMessage="No managed clubs found"
              />
              {!isLoadingClubs && clubs.length === 0 && (
                <Text size="sm" c="dimmed">You are not designated to manage any clubs yet.</Text>
              )}
              <TextInput label="Title" placeholder="e.g. Weekend community garden volunteer" required value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
              <TextInput
                label="Banner image URL"
                placeholder="https://example.com/banner.png"
                type="url"
                value={bannerImage}
                onChange={(event) => setBannerImage(event.currentTarget.value)}
              />
          </Stack>

          <Stack gap="md">
              <TextInput label="Location name" placeholder="e.g. Student Union, Room 204" required value={locationName} onChange={(event) => setLocationName(event.currentTarget.value)} />
              <TextInput label="Address" placeholder="Street address or campus details" value={locationAddress} onChange={(event) => setLocationAddress(event.currentTarget.value)} disabled={isRemote} />
              <Checkbox label="This opportunity is remote" checked={isRemote} onChange={(event) => setIsRemote(event.currentTarget.checked)} />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput type="datetime-local" label="Starts" required value={startsAt} onChange={(event) => setStartsAt(event.currentTarget.value)} />
                <TextInput type="datetime-local" label="Ends" required value={endsAt} onChange={(event) => setEndsAt(event.currentTarget.value)} />
              </SimpleGrid>
          </Stack>

          <Stack gap="md">
              <Textarea label="Description" placeholder="Describe the opportunity, schedule, impact, and any requirements." required minRows={6} autosize value={description} onChange={(event) => setDescription(event.currentTarget.value)} />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput type="number" min={1} label="Volunteers needed" placeholder="e.g. 10" value={capacity} onChange={(event) => setCapacity(event.currentTarget.value)} />
              </SimpleGrid>
              <TagsInput
                label="Tags"
                description="Include topics, skills, causes, and work types. Add up to 5 tags."
                placeholder={tags.length < 5 ? 'Add a tag' : undefined}
                maxTags={5}
                value={tags}
                onChange={setTags}
              />
              <TextInput type="email" label="Contact email" placeholder="name@example.com" value={contactEmail} onChange={(event) => setContactEmail(event.currentTarget.value)} />
          </Stack>

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => navigate('/')}>Cancel</Button>
            <Button type="submit" loading={isSaving} disabled={isLoadingClubs || clubs.length === 0}>Create listing</Button>
          </Group>
        </Stack>
      </form>
    </>
  )
}