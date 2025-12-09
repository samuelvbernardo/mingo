import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {
    // Middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: ["/chat", "/api/chat/:path*", "/api/messages/:path*", "/api/rooms/:path*"],
}
