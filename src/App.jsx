import { useEffect, useState } from 'react'
import { Anchor, AppShell, Avatar, Box, Burger, Drawer, Group, Image, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { BrowserRouter, Routes, Route, Link, useLocation } from './router'
import { getCurrentUser } from './api/API'
import crewlyLogoLight from './assets/crewly-logo-light.svg'
import Home from './pages/Home'
import User from './pages/User'
import Login from './pages/Login'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import Listings from './pages/Listings'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin' },
  { to: '/listings/new', label: 'Add listing' },
]

function AppRoutes() {
  const { pathname } = useLocation()
  const isFullBleed = pathname === '/login'
  const [currentUser, setCurrentUser] = useState(null)
  const [menuOpened, { close: closeMenu, toggle: toggleMenu }] = useDisclosure(false)

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  useEffect(() => {
    let isMounted = true
    getCurrentUser()
      .then((user) => {
        if (isMounted) setCurrentUser(user)
      })
      .catch(() => {
        if (isMounted) setCurrentUser(null)
      })

    return () => {
      isMounted = false
    }
  }, [pathname])

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users/:id" element={<User />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/Listings/:id" element={<Listings />} />
    </Routes>
  )

  if (isFullBleed) return routes

  const accountHref = currentUser ? `/users/${currentUser._id}` : '/login'
  const accountName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Sign in'
  const isAccountActive = currentUser && pathname === accountHref
  const accountAvatar = <Avatar src={currentUser?.pfp} radius="xl" size={32} color="blue" />

  const navLinks = NAV_ITEMS.map(({ to, label }) => (
    <Anchor
      key={to}
      component={Link}
      to={to}
      className="site-nav-link"
      c={pathname === to ? 'white' : 'blue.1'}
      fw={pathname === to ? 600 : 500}
      underline="never"
      aria-current={pathname === to ? 'page' : undefined}
    >
      {label}
    </Anchor>
  ))

  return (
    <AppShell header={{ height: { base: 64, sm: 76 } }}>
      <AppShell.Header className="site-header" bg="blue.9" px={{ base: 'sm', sm: 'xl' }}>
        <Group h="100%" justify="space-between" wrap="nowrap" gap="sm">
          <Group gap="md" wrap="nowrap">
            <Burger className="site-menu-button" hiddenFrom="sm" opened={menuOpened} onClick={toggleMenu} color="white" aria-label="Toggle navigation" />
            <Anchor className="site-brand" component={Link} to="/" aria-label="Crewly home">
              <Image src={crewlyLogoLight} alt="Crewly" w={{ base: 112, sm: 140 }} fit="contain" />
            </Anchor>
          </Group>

          <Group className="site-desktop-nav" visibleFrom="sm" gap="lg" wrap="nowrap">
            {navLinks}
            <Box className="site-nav-divider" w={1} h={28} bg="blue.7" />
            <Anchor
              className="site-account-link"
              component={Link}
              to={accountHref}
              c="white"
              underline="never"
              data-active={isAccountActive || undefined}
              aria-current={isAccountActive ? 'page' : undefined}
            >
              <Group gap="xs" wrap="nowrap">
                {accountAvatar}
                <Text size="sm" fw={500}>{accountName}</Text>
              </Group>
            </Anchor>
          </Group>

          <Anchor
            className="site-mobile-account site-account-link"
            component={Link}
            to={accountHref}
            hiddenFrom="sm"
            aria-label={accountName}
            data-active={isAccountActive || undefined}
            aria-current={isAccountActive ? 'page' : undefined}
          >
            {accountAvatar}
          </Anchor>

          <Drawer.Root opened={menuOpened} onClose={closeMenu} size="xs" hiddenFrom="sm">
            <Drawer.Overlay />
            <Drawer.Content bg="blue.9">
              <Drawer.Header bg="blue.9" h={64}>
                <Drawer.Title>
                  <Image src={crewlyLogoLight} alt="Crewly" w={112} fit="contain" />
                </Drawer.Title>
                <Drawer.CloseButton c="white" />
              </Drawer.Header>
              <Drawer.Body>
                <Stack gap="lg">{navLinks}</Stack>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Root>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{routes}</AppShell.Main>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
