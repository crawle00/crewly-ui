import { useEffect, useState } from 'react'
import { Alert, Anchor, AspectRatio, Avatar, Badge, Box, Button, Center, Divider, Drawer, Flex, Group, Image, Loader, Modal, NumberInput, Paper, ScrollArea, SimpleGrid, Stack, Switch, TagsInput, Text, Textarea, TextInput, ThemeIcon, Title } from '@mantine/core'
import { IconCalendarEvent, IconFlag, IconMapPin, IconUserMinus, IconUserPlus, IconUsers } from '@tabler/icons-react'
import { Link, useNavigate, useParams } from '../router'
import { createFaq, createFaqReply, createReports, getClub, getCurrentUser, getFaq, getListing, getReports, getVerificationCodes, getVolunteers, removeVolunteerFromListing, updateListing, volunteerForListing } from '../api/API'
import defaultClubIcon from '../assets/default-club-icon.svg'
import listingPlaceholder from '../assets/listing-placeholder.svg'

// Home's listing cards render their banner at roughly 437x168 (three across the
// 1440 container), so hold that same proportion here at any width.
const BANNER_RATIO = 437 / 168

const EMPTY_DRAFT = {
  title: '', description: '', bannerImage: '', locationName: '', locationAddress: '',
  isRemote: false, capacity: '', tags: [], startsAt: '', endsAt: '',
}

function getErrorMessage(requestError) {
  return requestError?.response?.data?.error?.message || 'Unable to complete the request.'
}

function formatWhen(startsAt, endsAt) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Date to be announced'

  const day = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

  return start.toDateString() === end.toDateString()
    ? `${day.format(start)} · ${time.format(start)}–${time.format(end)}`
    : `${day.format(start)} · ${time.format(start)} – ${day.format(end)} · ${time.format(end)}`
}

function formatPostedOn(dateValue) {
  if (!dateValue) return null
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return null

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function toDateTimeLocal(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

// The API returns every reply for a question in one flat array, so the parent/child
// structure has to be rebuilt here. The question itself becomes the root comment.
function toThread(question) {
  const byId = new Map()
  for (const reply of question.replies ?? []) {
    byId.set(String(reply._id), { ...reply, id: String(reply._id), body: reply.reply, children: [] })
  }

  const roots = []
  for (const reply of question.replies ?? []) {
    const parent = reply.parentReplyId ? byId.get(String(reply.parentReplyId)) : null
    const siblings = parent ? parent.children : roots
    siblings.push(byId.get(String(reply._id)))
  }

  return { ...question, id: null, body: question.question, children: roots }
}

function Detail({ icon, children }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start">
      <ThemeIcon variant="light" size="sm" color="blue" aria-hidden="true">{icon}</ThemeIcon>
      <Text size="sm">{children}</Text>
    </Group>
  )
}

function PersonLine({ userId, pfp, firstName, lastName, date }) {
  const name = [firstName, lastName].filter(Boolean).join(' ') || 'Someone'
  const postedOn = formatPostedOn(date)
  const href = userId ? `/users/${userId}` : null

  const avatar = <Avatar src={pfp} size={34} radius="xl" color="blue">{name.charAt(0)}</Avatar>

  return (
    <Group gap="xs" wrap="nowrap">
      {href ? <Anchor component={Link} to={href} aria-label={`View ${name}'s profile`}>{avatar}</Anchor> : avatar}
      <Box style={{ minWidth: 0 }}>
        {href ? (
          <Anchor component={Link} to={href} c="inherit" underline="hover" size="sm" fw={600} lineClamp={1}>{name}</Anchor>
        ) : (
          <Text size="sm" fw={600} lineClamp={1}>{name}</Text>
        )}
        {postedOn && <Text size="xs" c="dimmed" lh={1.3}>{postedOn}</Text>}
      </Box>
    </Group>
  )
}

function Comment({ node, questionId, depth, ctx }) {
  const isReplying = ctx.replyTo?.questionId === questionId && String(ctx.replyTo.replyId) === String(node.id)

  return (
    <Box style={{ minWidth: 0 }}>
      <PersonLine userId={node.userId} pfp={node.pfp} firstName={node.firstName} lastName={node.lastName} date={node.createdAt} />

      <Text size="sm" mt={6} fw={depth === 0 ? 600 : undefined} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {node.body}
      </Text>

      <Button size="compact-xs" variant="subtle" mt={4} onClick={() => ctx.onStartReply(questionId, node.id)}>
        {depth === 0 ? 'Answer' : 'Reply'}
      </Button>

      {isReplying && (
        <Stack gap="xs" mt="sm">
          <Textarea
            autosize minRows={2} maxRows={8} placeholder="Write a reply..." data-autofocus
            value={ctx.replyText}
            onChange={(event) => ctx.setReplyText(event.currentTarget.value)}
          />
          <Group justify="flex-end" gap="xs">
            <Button size="xs" variant="default" onClick={ctx.onCancelReply} disabled={ctx.submitting}>Cancel</Button>
            <Button size="xs" onClick={() => ctx.onSubmitReply(questionId, node.id)} loading={ctx.submitting} disabled={!ctx.replyText.trim()}>
              Post reply
            </Button>
          </Group>
        </Stack>
      )}

      {node.children.length > 0 && (
        <Stack gap="md" mt="md" pl={{ base: 'sm', sm: 'md' }} style={{ borderLeft: '2px solid var(--mantine-color-blue-2)' }}>
          {node.children.map((child) => (
            <Comment key={child.id} node={child} questionId={questionId} depth={depth + 1} ctx={ctx} />
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default function Listings() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [club, setClub] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [volunteers, setVolunteers] = useState([])
  const [faq, setFaq] = useState([])
  const [reports, setReports] = useState([])
  const [verificationCode, setVerificationCode] = useState(null)

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const [modal, setModal] = useState('')
  const [rosterOpen, setRosterOpen] = useState(false)

  const [question, setQuestion] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [reportText, setReportText] = useState('')
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  useEffect(() => {
    let active = true
    setLoading(true)

    Promise.all([
      getListing(id),
      getFaq(id).catch(() => []),
      getVolunteers(id).catch(() => []),
      getCurrentUser().catch(() => null),
    ])
      .then(([listingData, faqData, volunteerData, user]) => {
        if (!active) return
        setListing(listingData)
        setFaq(faqData ?? [])
        setVolunteers(volunteerData ?? [])
        setCurrentUser(user)
        getClub(listingData.clubId).then((data) => active && setClub(data)).catch(() => {})
      })
      .catch((requestError) => {
        if (!active) return
        if (requestError.response?.status === 401) return navigate('/login')
        setError(getErrorMessage(requestError))
      })
      .finally(() => active && setLoading(false))

    return () => { active = false }
  }, [id, navigate])

  const volunteerCount = listing?.volunteers?.length ?? volunteers.length
  const capacity = listing?.capacity ?? null
  const isCancelled = Boolean(listing?.isCancelled)
  const isVolunteered = Boolean(currentUser && listing?.volunteers?.some((userId) => String(userId) === String(currentUser._id)))
  const isOwner = Boolean(currentUser && club && club.leaders?.some((leaderId) => String(leaderId) === String(currentUser._id)))

  // Re-check every 30 seconds so "Show code" appears and disappears as the event starts and ends.
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])
  const isRunning = Boolean(
    listing && !isCancelled
      && now >= new Date(listing.startsAt).getTime()
      && now <= new Date(listing.endsAt).getTime(),
  )

  // Only the listing's club leaders can see its check-in code.
  useEffect(() => {
    if (!isOwner) return undefined
    let active = true
    getVerificationCodes({ listingId: id })
      .then((codes) => active && setVerificationCode(codes[0]?.code ?? null))
      .catch(() => {})
    return () => { active = false }
  }, [id, isOwner])

  const blockedReason = isCancelled ? 'This listing has been cancelled by the organizers.'
    : listing && new Date(listing.endsAt) < new Date() ? 'This event has already ended.'
      : !isVolunteered && capacity && volunteerCount >= capacity ? 'All volunteer spots are filled.'
        : null

  // Every action shares one busy flag and one error slot; only one can run at a time.
  const run = async (name, action) => {
    setBusy(name)
    setError('')
    try {
      await action()
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setBusy('')
    }
  }

  const closeModal = () => {
    setModal('')
    setError('')
  }

  const toggleVolunteer = () => run('volunteer', async () => {
    setListing(isVolunteered ? await removeVolunteerFromListing(id) : await volunteerForListing(id))
    setVolunteers(await getVolunteers(id))
  })

  const postQuestion = () => run('question', async () => {
    await createFaq(id, question.trim())
    setQuestion('')
    setFaq(await getFaq(id))
  })

  const postReply = (questionId, parentReplyId) => run('reply', async () => {
    await createFaqReply(questionId, replyText.trim(), parentReplyId)
    setReplyText('')
    setReplyTo(null)
    setFaq(await getFaq(id))
  })

  const sendReport = () => run('report', async () => {
    await createReports(id, reportText.trim())
    setReportText('')
    closeModal()
  })

  const openReports = () => run('reports', async () => {
    setReports(await getReports(id))
    setModal('reports')
  })

  const toggleCancelled = () => run('cancel', async () => {
    setListing(await updateListing(id, { isCancelled: !listing.isCancelled }))
  })

  const saveEdit = (event) => {
    event.preventDefault()
    // Only send the dates if they were changed; the API rejects moving a start time into
    // the past, which an untouched start time on a running event would otherwise trip.
    const dateUpdates = {}
    if (draft.startsAt !== toDateTimeLocal(listing.startsAt)) dateUpdates.startsAt = new Date(draft.startsAt)
    if (draft.endsAt !== toDateTimeLocal(listing.endsAt)) dateUpdates.endsAt = new Date(draft.endsAt)

    return run('edit', async () => {
      setListing(await updateListing(id, {
        title: draft.title,
        description: draft.description,
        bannerImage: draft.bannerImage.trim() || null,
        location: { name: draft.locationName, address: draft.isRemote ? '' : draft.locationAddress, isRemote: draft.isRemote },
        capacity: draft.capacity === '' || draft.capacity === null ? null : Number(draft.capacity),
        tags: draft.tags,
        ...dateUpdates,
      }))
      closeModal()
    })
  }

  const openEdit = () => {
    setDraft({
      title: listing.title ?? '',
      description: listing.description ?? '',
      bannerImage: listing.bannerImage ?? '',
      locationName: listing.location?.name ?? '',
      locationAddress: listing.location?.address ?? '',
      isRemote: listing.location?.isRemote ?? false,
      capacity: listing.capacity ?? '',
      tags: listing.tags ?? [],
      startsAt: toDateTimeLocal(listing.startsAt),
      endsAt: toDateTimeLocal(listing.endsAt),
    })
    setError('')
    setModal('edit')
  }

  const setField = (field) => (value) => setDraft((current) => ({ ...current, [field]: value }))
  const setInput = (field) => (event) => setField(field)(event.currentTarget.value)

  if (loading) {
    return <Center mih="60vh"><Loader color="blue" aria-label="Loading listing" /></Center>
  }

  if (!listing) {
    return (
      <Box maw={640} mx="auto">
        <Paper withBorder radius="md" p="xl">
          <Stack align="center" gap="sm">
            <Title order={2} size="h3" ta="center">This listing isn't available</Title>
            <Text c="dimmed" ta="center">{error || 'It may have been removed, or the link is incorrect.'}</Text>
            <Button onClick={() => navigate('/')}>Browse other listings</Button>
          </Stack>
        </Paper>
      </Box>
    )
  }

  const location = listing.location?.isRemote
    ? 'Remote'
    : [listing.location?.name || 'Location to be announced', listing.location?.address].filter(Boolean).join(' · ')

  const threadCtx = {
    replyTo,
    replyText,
    setReplyText,
    submitting: busy === 'reply',
    onStartReply: (questionId, replyId) => { setReplyTo({ questionId, replyId }); setReplyText('') },
    onCancelReply: () => setReplyTo(null),
    onSubmitReply: postReply,
  }

  return (
    <>
      <Stack gap="lg">
        {isOwner && (
          <Box>
            <Flex direction={{ base: 'column', xs: 'row' }} gap="sm">
              <Button variant="default" onClick={openEdit}>Edit listing</Button>
              <Button variant="default" onClick={openReports} loading={busy === 'reports'}>View feedback</Button>
              <Button variant="light" color={isCancelled ? 'green' : 'red'} onClick={toggleCancelled} loading={busy === 'cancel'}>
                {isCancelled ? 'Reopen listing' : 'Cancel listing'}
              </Button>
              {isRunning && verificationCode && (
                <Button variant="default" onClick={() => setModal('code')}>Show code</Button>
              )}
            </Flex>
          </Box>
        )}

        {error && <Alert color="red" withCloseButton onClose={() => setError('')}>{error}</Alert>}

        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <AspectRatio ratio={BANNER_RATIO} bg="blue.0">
            <Image src={listing.bannerImage || listingPlaceholder} fallbackSrc={listingPlaceholder} alt="" fit="cover" />
          </AspectRatio>

          <Stack gap="lg" p={{ base: 'md', sm: 'xl' }}>
            <Group gap="sm" wrap="nowrap">
              <Avatar src={club?.pfp || defaultClubIcon} alt="" size={40} radius="sm" />
              <Text fw={600} lineClamp={1}>{club?.name ?? 'Loading club...'}</Text>
            </Group>

            <Box>
              <Title order={1} size="h2" lh={1.2}>{listing.title}</Title>
              <Text c="dimmed" mt="xs" style={{ whiteSpace: 'pre-wrap' }}>
                {listing.description || 'No description provided.'}
              </Text>
            </Box>

            <Stack gap="xs">
              <Detail icon={<IconCalendarEvent size={15} />}>{formatWhen(listing.startsAt, listing.endsAt)}</Detail>
              <Detail icon={<IconMapPin size={15} />}>{location}</Detail>
              <Detail icon={<IconUsers size={15} />}>
                {volunteerCount} signed up{capacity ? ` of ${capacity} needed` : ''}
              </Detail>
            </Stack>

            {listing.tags?.length > 0 && (
              <Group gap={6}>
                {listing.tags.map((tag) => <Badge key={tag} color="blue" variant="light">{tag}</Badge>)}
              </Group>
            )}

            {blockedReason && <Alert color={isCancelled ? 'red' : 'gray'} variant="light">{blockedReason}</Alert>}

            <Flex direction={{ base: 'column', xs: 'row' }} gap="sm">
              <Button
                size="md"
                color={isVolunteered ? 'red' : 'blue'}
                variant={isVolunteered ? 'light' : 'filled'}
                leftSection={isVolunteered ? <IconUserMinus size={18} /> : <IconUserPlus size={18} />}
                onClick={toggleVolunteer}
                loading={busy === 'volunteer'}
                disabled={Boolean(blockedReason)}
              >
                {isVolunteered ? 'Withdraw' : 'Volunteer'}
              </Button>
              <Button size="md" variant="default" leftSection={<IconUsers size={18} />} onClick={() => setRosterOpen(true)}>
                Roster ({volunteerCount})
              </Button>
              {!isOwner && (
                <Button size="md" variant="subtle" color="gray" leftSection={<IconFlag size={18} />} onClick={() => { setError(''); setModal('report') }}>
                  Report
                </Button>
              )}
            </Flex>
          </Stack>
        </Paper>

        <Stack gap="lg">
          <Title order={2} size="h4">Questions &amp; answers</Title>

          <Box>
            <Textarea
              label="Ask a question"
              placeholder="What should volunteers bring?"
              autosize minRows={3} maxRows={10}
              value={question}
              onChange={(event) => setQuestion(event.currentTarget.value)}
            />
            <Group justify="flex-end" mt="sm">
              <Button onClick={postQuestion} loading={busy === 'question'} disabled={!question.trim()}>Post question</Button>
            </Group>
          </Box>

          {faq.length === 0 ? (
            <Text c="dimmed" fs="italic">No questions have been asked yet.</Text>
          ) : (
            <Stack gap="lg">
              {faq.map((item, index) => (
                <Box key={item._id}>
                  {index > 0 && <Divider mb="lg" />}
                  <Comment node={toThread(item)} questionId={item._id} depth={0} ctx={threadCtx} />
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>

      <Drawer opened={rosterOpen} onClose={() => setRosterOpen(false)} position="right" size="sm" title={<Text fw={600}>Volunteer roster</Text>}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {volunteerCount} {volunteerCount === 1 ? 'volunteer' : 'volunteers'}{capacity ? ` of ${capacity} needed` : ''}
          </Text>
          {volunteers.length === 0 ? (
            <Text c="dimmed" fs="italic">No one has signed up yet.</Text>
          ) : (
            <ScrollArea.Autosize mah="calc(100vh - 160px)">
              <Stack gap="sm">
                {volunteers.map((volunteer) => (
                  <PersonLine key={volunteer._id} userId={volunteer._id} pfp={volunteer.pfp} firstName={volunteer.firstName} lastName={volunteer.lastName} />
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}
        </Stack>
      </Drawer>

      <Modal opened={modal === 'code'} onClose={closeModal} title="Volunteer check-in code" centered>
        <Stack align="center" gap="sm" py="md">
          <Text ff="monospace" fw={700} fz={48} lh={1} style={{ letterSpacing: '0.2em' }}>{verificationCode}</Text>
          <Text size="sm" c="dimmed" ta="center">
            Volunteers signed up for this event can enter this code with the check-in button in the top bar to add it to their timeline.
          </Text>
        </Stack>
      </Modal>

      <Modal opened={modal === 'report'} onClose={closeModal} title="Report or share feedback" centered>
        <Stack>
          {error && <Alert color="red">{error}</Alert>}
          <Textarea
            label="Your message"
            placeholder="Describe your concern or feedback..."
            autosize minRows={5} maxRows={12} data-autofocus
            value={reportText}
            onChange={(event) => setReportText(event.currentTarget.value)}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeModal} disabled={busy === 'report'}>Cancel</Button>
            <Button onClick={sendReport} loading={busy === 'report'} disabled={!reportText.trim()}>Send</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={modal === 'reports'} onClose={closeModal} title="Reports & feedback" centered size="lg">
        {reports.length === 0 ? (
          <Text c="dimmed" fs="italic">No reports have been submitted.</Text>
        ) : (
          <ScrollArea.Autosize mah={420}>
            <Stack gap="lg">
              {reports.map((report) => (
                <Box key={report._id}>
                  <PersonLine userId={report.userId} pfp={report.pfp} firstName={report.firstName} lastName={report.lastName} date={report.createdAt} />
                  <Text size="sm" mt="xs" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{report.reports}</Text>
                </Box>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Modal>

      <Modal opened={modal === 'edit'} onClose={closeModal} title="Edit listing" centered size="lg">
        <form onSubmit={saveEdit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}

            <TextInput label="Title" required value={draft.title} onChange={setInput('title')} data-autofocus />
            <Textarea label="Description" required autosize minRows={3} maxRows={10} value={draft.description} onChange={setInput('description')} />
            <TextInput label="Banner image URL" type="url" placeholder="https://example.com/banner.jpg" value={draft.bannerImage} onChange={setInput('bannerImage')} />

            <Divider label="Location" labelPosition="left" />

            <Switch label="This is a remote opportunity" checked={draft.isRemote} onChange={(event) => setField('isRemote')(event.currentTarget.checked)} />
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput label="Location name" required value={draft.locationName} onChange={setInput('locationName')} />
              <TextInput label="Address" disabled={draft.isRemote} value={draft.locationAddress} onChange={setInput('locationAddress')} />
            </SimpleGrid>

            <Divider label="Schedule & capacity" labelPosition="left" />

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput type="datetime-local" label="Starts at" value={draft.startsAt} onChange={setInput('startsAt')} />
              <TextInput type="datetime-local" label="Ends at" value={draft.endsAt} onChange={setInput('endsAt')} />
            </SimpleGrid>
            <NumberInput label="Capacity" description="Leave empty for unlimited volunteers" min={1} value={draft.capacity} onChange={setField('capacity')} />
            <TagsInput label="Tags" placeholder="Add a tag" value={draft.tags} onChange={setField('tags')} />

            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={closeModal} disabled={busy === 'edit'}>Cancel</Button>
              <Button type="submit" loading={busy === 'edit'}>Save changes</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  )
}
