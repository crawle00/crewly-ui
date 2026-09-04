import { useEffect, useState } from 'react'
import { AppShell, Avatar, Divider, Image, NavLink, Stack } from '@mantine/core'
import { IconHome2, IconInfoCircle, IconShieldLock, IconUserCircle } from '@tabler/icons-react'
import { BrowserRouter, Routes, Route, Link, useLocation } from './router'
import { getCurrentUser } from './api/API'
import crewlyLogoLight from './assets/crewly-logo-light.svg'
import Home from './pages/Home'
import About from './pages/About'
import User from './pages/User'
import Login from './pages/Login'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import Listings from './pages/Listings'

function AppRoutes() {
  const { pathname } = useLocation()
  const isFullBleed = pathname === '/login'
  const [currentUser, setCurrentUser] = useState(null)

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
      <Route path="/about" element={<About />} />
      <Route path="/users/:id" element={<User />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="/Listings/:id" element={<Listings />} />
    </Routes>
  )

  if (isFullBleed) return routes

  return (
    <AppShell navbar={{ width: 220 }}>
      <AppShell.Navbar bg="blue.9" p="md">
        <Stack justify="space-between" h="100%">
          <Stack gap="xs">
            <Image className="sidebar-logo" src={crewlyLogoLight} alt="Crewly" w={160} mb="md" />
            <NavLink className="sidebar-link" component={Link} to="/" label="Home" leftSection={<IconHome2 size={18} />} active={pathname === '/'} />
            <NavLink className="sidebar-link" component={Link} to="/admin" label="Admin" leftSection={<IconShieldLock size={18} />} active={pathname === '/admin'} />
            <NavLink className="sidebar-link" component={Link} to="/about" label="About" leftSection={<IconInfoCircle size={18} />} active={pathname === '/about'} />
          </Stack>
          <Stack gap="sm">
            <Divider color="blue.7" />
            {currentUser ? (
              <NavLink
                component={Link}
                to={`/users/${currentUser._id}`}
                label={`${currentUser.firstName} ${currentUser.lastName}`}
                description="View profile"
                leftSection={<Avatar src={currentUser.pfp} radius="xl" size="sm" color="blue" />}
                className="sidebar-link"
              />
            ) : (
              <NavLink className="sidebar-link" component={Link} to="/login" label="Sign in" leftSection={<IconUserCircle size={18} />} />
            )}
          </Stack>
        </Stack>
      </AppShell.Navbar>
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
