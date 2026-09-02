import { BrowserRouter, Routes, Route, Link } from './router'
import Home from './pages/Home'
import About from './pages/About'
import User from './pages/User'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <main>
        <h1>Crewly</h1>
        <nav>
          <Link to="/">Home</Link>{' | '}
          <Link to="/about">About</Link>{' | '}
          <Link to="/users/42">User 42</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/users/:id" element={<User />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
