import { useEffect, useState } from 'react'
import { Anchor, Button, Container, PasswordInput, TagsInput, Text, TextInput, Title } from '@mantine/core'
import { useNavigate } from '../router'
import { login, register } from '../api/publicAPI'
import { getCurrentUser } from '../api/userAPI'
import crewlyLogo from '../assets/crewly-logo.svg'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [interests, setInterests] = useState([])
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const navigate = useNavigate()
  const isLogin = mode === 'login'

  useEffect(() => {
    let isMounted = true

    getCurrentUser()
      .then(() => {
        if (isMounted) navigate('/')
      })
      .catch(() => {
        if (isMounted) setIsCheckingAuth(false)
      })

    return () => {
      isMounted = false
    }
  }, [navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors({})

    if (!isLogin && password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match.' })
      return
    }

    setIsSubmitting(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register({ firstName, lastName, email, password, interests })
      }
      navigate('/')
    } catch (requestError) {
      const apiError = requestError.response?.data?.error
      const details = apiError?.details?.map((detail) => {
        return detail.field ? `${detail.field}: ${detail.message}` : detail.message
      }) || []
      const nextFieldErrors = {}
      apiError?.details?.forEach((detail) => {
        if (detail.field) nextFieldErrors[detail.field] = detail.message
      })
      setFieldErrors(nextFieldErrors)
      setError(details.length ? '' : apiError?.message || 'Unable to complete your request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingAuth) return null

  return (
    <div className="login-shell">
      <section className="login-panel">
        <Container size={420} className="login-content">
          <img className="login-logo" src={crewlyLogo} alt="Crewly" />
          <Title ta="center">{isLogin ? 'Welcome back' : 'Create an account'}</Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            {isLogin ? "Don't have an account yet? " : 'Already have an account? '}
            <Anchor size="sm" component="button" type="button" onClick={() => setMode(isLogin ? 'signup' : 'login')}>
              {isLogin ? 'Create one' : 'Log in'}
            </Anchor>
          </Text>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <TextInput
                  label="First name"
                  placeholder="Your first name"
                  required
                  mt="xl"
                  error={fieldErrors.firstName}
                  value={firstName}
                  onChange={(event) => setFirstName(event.currentTarget.value)}
                />
                <TextInput
                  label="Last name"
                  placeholder="Your last name"
                  required
                  mt="md"
                  error={fieldErrors.lastName}
                  value={lastName}
                  onChange={(event) => setLastName(event.currentTarget.value)}
                />
                <TagsInput
                  label="Interests"
                  placeholder={interests.length < 5 ? 'Add an interest' : undefined}
                  description="Add up to 5 interests"
                  maxTags={5}
                  mt="md"
                  value={interests}
                  onChange={setInterests}
                />
              </>
            )}
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              mt={isLogin ? 'xl' : 'md'}
              error={fieldErrors.email}
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              error={fieldErrors.password}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
            {!isLogin && (
              <PasswordInput
                label="Confirm password"
                placeholder="Confirm your password"
                required
                mt="md"
                error={fieldErrors.confirmPassword}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.currentTarget.value)}
              />
            )}
            {error && <Text c="red" size="sm" mt="md">{error}</Text>}
            <Button type="submit" fullWidth mt="xl" loading={isSubmitting}>
              {isLogin ? 'Log in' : 'Sign up'}
            </Button>
          </form>
        </Container>
      </section>
    </div>
  )
}
