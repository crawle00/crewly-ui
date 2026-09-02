import { useState } from 'react'
import { Anchor, Button, Container, PasswordInput, Text, TextInput, Title } from '@mantine/core'

export default function Login() {
  const [mode, setMode] = useState('login')
  const isLogin = mode === 'login'

  return (
    <Container size={420} my={80}>
      <Title ta="center">{isLogin ? 'Welcome back' : 'Create an account'}</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {isLogin ? "Don't have an account yet? " : 'Already have an account? '}
        <Anchor size="sm" component="button" type="button" onClick={() => setMode(isLogin ? 'signup' : 'login')}>
          {isLogin ? 'Create one' : 'Log in'}
        </Anchor>
      </Text>

      {!isLogin && <TextInput label="Name" placeholder="Your name" required mt="xl" />}
      <TextInput label="Email" placeholder="you@example.com" required mt={isLogin ? 'xl' : 'md'} />
      <PasswordInput label="Password" placeholder="Your password" required mt="md" />
      {!isLogin && <PasswordInput label="Confirm password" placeholder="Confirm your password" required mt="md" />}
      <Button fullWidth mt="xl">
        {isLogin ? 'Log in' : 'Sign up'}
      </Button>
    </Container>
  )
}
