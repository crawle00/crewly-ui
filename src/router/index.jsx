import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const RouterContext = createContext(null)

function matchPath(pattern, pathname) {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = pathname.split('/').filter(Boolean)

  if (patternParts.length !== pathParts.length) return null

  const params = {}
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart)
    } else if (patternPart !== pathPart) {
      return null
    }
  }
  return params
}

export function BrowserRouter({ children }) {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (to) => {
    if (to === pathname) return
    window.history.pushState({}, '', to)
    setPathname(to)
  }

  const value = useMemo(() => ({ pathname, navigate }), [pathname])

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function Routes({ children }) {
  const { pathname } = useRouterContext()
  const routes = Array.isArray(children) ? children : [children]

  for (const route of routes) {
    if (!route) continue
    const { path, element } = route.props
    const params = matchPath(path, pathname)
    if (params) {
      return <ParamsProvider params={params}>{element}</ParamsProvider>
    }
  }

  return null
}

// eslint-disable-next-line no-unused-vars
export function Route(_props) {
  return null
}

export function Link({ to, children, ...rest }) {
  const { navigate } = useRouterContext()

  const onClick = (event) => {
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={onClick} {...rest}>
      {children}
    </a>
  )
}

export function useNavigate() {
  return useRouterContext().navigate
}

export function useLocation() {
  const { pathname } = useRouterContext()
  return { pathname }
}

const ParamsContext = createContext({})

function ParamsProvider({ params, children }) {
  return <ParamsContext.Provider value={params}>{children}</ParamsContext.Provider>
}

export function useParams() {
  return useContext(ParamsContext)
}

function useRouterContext() {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('Router hooks/components must be used within a <BrowserRouter>')
  }
  return context
}
