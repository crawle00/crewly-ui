import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Checkbox,
  Container,
  Group,
  Image,
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

function getErrorMessage(requestError) {
  return requestError.response?.data?.error?.message || 'Unable to complete the request.'
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
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [bannerImage, setBannerImage] = useState('')
  const [capacity, setCapacity] = useState('')
  const [tags, setTags] = useState([])
  const [contactEmail, setContactEmail] = useState('')
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getManagedClubs()
      .then((response) => setClubs(response.data))
      .catch((requestError) => {
        if (requestError.response?.status === 401) return navigate('/login')
        setError(getErrorMessage(requestError))
      })
      .finally(() => setIsLoadingClubs(false))
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!clubId) return setError('Choose a club before creating the listing.')
    setIsSaving(true)
    try {
      const estimatedHours = getEstimatedHours(startsAt, endsAt)
      const listing = {
        clubId,
        title: title.trim(),
        description: description.trim(),
        bannerImage,
        location: {
          name: locationName.trim(),
          address: locationAddress.trim(),
          isRemote,
        },
        startsAt,
        endsAt,
        timezone,
        capacity: capacity ? Number(capacity) : null,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        tags,
        contactEmail: contactEmail.trim() || undefined,
      }
      await createListing(listing)
      navigate('/')
    } catch (requestError) {
      if (requestError.response?.status === 401) return navigate('/login')
      setError(getErrorMessage(requestError))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Container size="md" py={{ base: 'lg', sm: 'xl' }}>
      <Stack gap="xs" mb="xl">
        <Title order={1}>Create a listing</Title>
        <Text c="dimmed">Share an opportunity with the Crewly community.</Text>
      </Stack>

      {error && <Alert color="red" mb="md" withCloseButton onClose={() => setError('')}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Stack gap="md">
              <Stack gap={2}>
                <Text fw={600}>Start with the basics</Text>
                <Text size="sm" c="dimmed">Choose the club responsible for this opportunity and give it a clear name.</Text>
              </Stack>
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
                description="Use a publicly accessible PNG URL. The current API stores the image as a string URL."
                placeholder="https://example.com/banner.png"
                type="url"
                value={bannerImage}
                onChange={(event) => setBannerImage(event.currentTarget.value)}
              />
          </Stack>

          <Stack gap="md">
              <Stack gap={2}>
                <Text fw={600}>When and where</Text>
                <Text size="sm" c="dimmed">Give volunteers enough detail to plan their time.</Text>
              </Stack>
              <TextInput label="Location name" placeholder="e.g. Student Union, Room 204" required value={locationName} onChange={(event) => setLocationName(event.currentTarget.value)} />
              <TextInput label="Address" placeholder="Street address or campus details" value={locationAddress} onChange={(event) => setLocationAddress(event.currentTarget.value)} disabled={isRemote} />
              <Checkbox label="This opportunity is remote" checked={isRemote} onChange={(event) => setIsRemote(event.currentTarget.checked)} />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput type="datetime-local" label="Starts" required value={startsAt} onChange={(event) => setStartsAt(event.currentTarget.value)} />
                <TextInput type="datetime-local" label="Ends" required value={endsAt} onChange={(event) => setEndsAt(event.currentTarget.value)} />
              </SimpleGrid>
              <TextInput label="Timezone" required value={timezone} onChange={(event) => setTimezone(event.currentTarget.value)} />
          </Stack>

          <Stack gap="md">
              <Textarea label="Description" placeholder="Describe the opportunity, schedule, impact, and any requirements." required minRows={6} autosize value={description} onChange={(event) => setDescription(event.currentTarget.value)} />
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <TextInput type="number" min={1} label="Volunteers needed" description="Set a target number of participants, or leave blank for an open-ended opportunity." placeholder="e.g. 10" value={capacity} onChange={(event) => setCapacity(event.currentTarget.value)} />
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
    </Container>
  )
}