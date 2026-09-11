import { useState } from 'react'
import { Button, Group, Modal, PinInput, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { redeemVerificationCode } from '../api/API'

const CODE_LENGTH = 6

function getErrorMessage(requestError) {
  return requestError.response?.data?.error?.message || 'Unable to check in right now.'
}

export default function CheckInDialog({ opened, onClose, onCheckedIn, onViewTimeline }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)

  // Reset once the close animation finishes so the dialog doesn't visibly flash back to empty.
  const reset = () => {
    setCode('')
    setError('')
    setIsCheckedIn(false)
  }

  const submit = async (value = code) => {
    if (isSubmitting || value.length !== CODE_LENGTH) return
    setIsSubmitting(true)
    setError('')
    try {
      const user = await redeemVerificationCode(value)
      setIsCheckedIn(true)
      onCheckedIn(user)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setCode('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} onExitTransitionEnd={reset} title="Check in to an event" centered size="sm">
      {isCheckedIn ? (
        <Stack align="center" gap="xs" py="md">
          <ThemeIcon color="green" size={56} radius="xl">
            <IconCheck size={32} stroke={3} />
          </ThemeIcon>
          <Text fw={600} size="lg" mt="xs">You're checked in</Text>
          <Text size="sm" c="dimmed" ta="center">This event has been added to your timeline.</Text>
          <Group mt="md">
            <Button variant="default" onClick={onClose}>Done</Button>
            <Button onClick={onViewTimeline}>View timeline</Button>
          </Group>
        </Stack>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <Stack align="center" gap="md">
            <Text size="sm" c="dimmed" ta="center">
              Enter the 6-digit code from the event organizer. You can check in to events you signed up for while they're happening.
            </Text>
            <PinInput
              length={CODE_LENGTH}
              type="number"
              oneTimeCode
              size="lg"
              value={code}
              onChange={(value) => {
                setCode(value)
                setError('')
              }}
              onComplete={submit}
              error={Boolean(error)}
              disabled={isSubmitting}
              aria-label="Check-in code"
            />
            {error && <Text size="sm" c="red" ta="center">{error}</Text>}
            <Button type="submit" fullWidth loading={isSubmitting} disabled={code.length !== CODE_LENGTH}>
              Check in
            </Button>
          </Stack>
        </form>
      )}
    </Modal>
  )
}
