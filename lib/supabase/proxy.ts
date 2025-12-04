import { NextResponse, type NextRequest } from "next/server"

const SESSION_COOKIE = "trippack_session"

function getSessionFromRequest(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)
    // Validate session has required fields
    if (session && session.id && session.username) {
      return session
    }
    return null
  } catch {
    return null
  }
}

export async function updateSession(request: NextRequest) {
  const session = getSessionFromRequest(request)
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/dashboard") && !session) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/trip/") && !session) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/auth/") && session) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}
