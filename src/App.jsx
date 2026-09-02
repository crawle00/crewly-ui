import { BrowserRouter, Routes, Route, Link, useLocation } from './router'
import Home from './pages/Home'
import About from './pages/About'
import User from './pages/User'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

function AppRoutes() {
  const { pathname } = useLocation()
  const isFullBleed = pathname === '/login'

  return (
    <main className={isFullBleed ? undefined : 'padded'}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="/login" element={<Login />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
