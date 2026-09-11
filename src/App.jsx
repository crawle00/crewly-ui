import { useEffect, useState } from 'react'
import { ActionIcon, Anchor, AppShell, Avatar, Box, Burger, Drawer, Divider, Group, Image, Indicator, ScrollArea, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconBell } from '@tabler/icons-react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from './router'
import { getCurrentUser, getMyFaqQuestions, getVolunteering } from './api/API'
import crewlyLogoLight from './assets/crewly-logo-light.svg'
import Home from './pages/Home'
import User from './pages/User'
import Login from './pages/Login'
import Admin from './pages/Admin'
import CreateListing from './pages/CreateListing'
import NotFound from './pages/NotFound'
import Listings from './pages/Listings'

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin' },
  { to: '/createListing', label: 'Add listing' },
]

function formatEventWhen(startsAt) {
  const date = new Date(startsAt)
  if (Number.isNaN(date.getTime())) return 'Date to be announced'
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function AppRoutes() {
  const { pathname } = useLocation()
  const isFullBleed = pathname === '/login'
  const [currentUser, setCurrentUser] = useState(null)
  const [menuOpened, { close: closeMenu, toggle: toggleMenu }] = useDisclosure(false)
  const [notificationsOpened, { close: closeNotifications, toggle: toggleNotifications }] = useDisclosure(false)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [faqReplies, setFaqReplies] = useState([])

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  function ListingsRedirect() {
    const navigate = useNavigate()

    useEffect(() => {
      navigate("/")
    }, [navigate])
    return null
  }

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

  useEffect(() => {
    if (!currentUser) {
      setUpcomingEvents([])
      return
    }
    let isMounted = true

    getVolunteering(currentUser._id)
      .then((listings) => {
        if (!isMounted) return
        const now = new Date()
        const upcoming = (listings ?? [])
          .filter((listing) => new Date(listing.startsAt) > now)
          .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
        setUpcomingEvents(upcoming)
      })
      .catch(() => {
        if (isMounted) setUpcomingEvents([])
      })

    return () => {
      isMounted = false
    }
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) {
      setFaqReplies([])
      return
    }
    let isMounted = true

    getMyFaqQuestions()
      .then((questions) => {
        if (isMounted) setFaqReplies(questions)
      })
      .catch(() => {
        if (isMounted) setFaqReplies([])
      })

    return () => {
      isMounted = false
    }
  }, [currentUser])

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/users/:id" element={<User />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/createListing" element={<CreateListing />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/listings" element={<ListingsRedirect />} />
      <Route path="/listings/:id" element={<Listings />} />
    </Routes>
  )

  if (isFullBleed) return routes

  const accountHref = currentUser ? `/users/${currentUser._id}` : '/login'
  const accountName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Sign in'
  const isAccountActive = currentUser && pathname === accountHref
  const accountAvatar = <Avatar src={currentUser?.pfp} radius="xl" size={32} color="blue" />
  const navItems = NAV_ITEMS.filter(({ to }) => to !== '/admin' || currentUser?.isAdmin)

  const notificationCount = upcomingEvents.length + faqReplies.length

  const notificationBell = (
    <Indicator label={notificationCount} size={16} disabled={notificationCount === 0} color="red" offset={4}>
      <ActionIcon
        className="site-notification-button"
        variant="transparent"
        color="white"
        size="lg"
        onClick={toggleNotifications}
        aria-label="Notifications"
      >
        <IconBell size={20} />
      </ActionIcon>
    </Indicator>
  )

  const navLinks = navItems.map(({ to, label }) => (
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
            {notificationBell}
          </Group>

          <Group hiddenFrom="sm" gap="xs" wrap="nowrap">
            <Anchor
              className="site-mobile-account site-account-link"
              component={Link}
              to={accountHref}
              aria-label={accountName}
              data-active={isAccountActive || undefined}
              aria-current={isAccountActive ? 'page' : undefined}
            >
              {accountAvatar}
            </Anchor>
            {notificationBell}
          </Group>
          <Drawer.Root opened={notificationsOpened} onClose={closeNotifications} position="right" size="sm">
            <Drawer.Overlay />
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title fw={600}>Notifications</Drawer.Title>
                <Drawer.CloseButton />
              </Drawer.Header>
              <Drawer.Body>
                <ScrollArea.Autosize mah="calc(100vh - 80px)">
                  <Stack gap="lg">
                    <Box>
                      <Text size="sm" c="dimmed" fw={600} mb={6}>Upcoming events you volunteered for</Text>
                      {upcomingEvents.length > 0 ? (
                        <Stack gap="xs">
                          {upcomingEvents.map((event) => (
                            <Anchor
                              key={event._id}
                              component={Link}
                              to={`/listings/${event._id}`}
                              underline="never"
                              c="inherit"
                              onClick={closeNotifications}
                            >
                              <Box p="sm" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
                                <Text fw={500} size="sm">{event.title}</Text>
                                <Text size="xs" c="dimmed">{formatEventWhen(event.startsAt)}</Text>
                              </Box>
                            </Anchor>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed" fs="italic">No upcoming events.</Text>
                      )}
                    </Box>

                    <Divider />

                    <Box>
                      <Text size="sm" c="dimmed" fw={600} mb={6}>FAQ replies</Text>
                      {faqReplies.length > 0 ? (
                        <Stack gap="xs">
                          {faqReplies.map((item) => (
                            <Anchor
                              key={item._id}
                              component={Link}
                              to={`/listings/${item.listingId}`}
                              underline="never"
                              c="inherit"
                              onClick={closeNotifications}
                            >
                              <Box p="sm" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
                                <Text fw={500} size="sm" lineClamp={1}>{item.question}</Text>
                                <Text size="xs" c="dimmed">
                                  {item.replyCount} {item.replyCount === 1 ? 'reply' : 'replies'} on {item.listingTitle || 'a listing'}
                                </Text>
                              </Box>
                            </Anchor>
                          ))}
                        </Stack>
                      ) : (
                        <Text size="sm" c="dimmed" fs="italic">No new replies.</Text>
                      )}
                    </Box>
                  </Stack>
                </ScrollArea.Autosize>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Root>
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
