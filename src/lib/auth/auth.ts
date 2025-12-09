import NextAuth, { type DefaultSession } from "next-auth"
import { getServerSession as getServerSessionNextAuth } from "next-auth/next"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { connectDB } from "@/lib/db/mongoose"
import { UserService } from "@/models/user/user.service"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
    }
  }
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          await connectDB()

          const user = await UserService.findByEmail(credentials.email as string)

          if (!user) {
            return null
          }

          const isPasswordValid = await UserService.verifyPassword(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar,
          }
        } catch (error) {
          console.error("[AUTH_CREDENTIALS_ERROR]", error)
          return null
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      try {
        // Se é OAuth (Google ou GitHub), sincronizar com BD
        if (account?.type === "oauth" && user.email) {
          await connectDB()

          let dbUser: any = await UserService.findByEmail(user.email)

          // Se usuário não existe, criar
          if (!dbUser) {
            dbUser = await UserService.createUser({
              name: user.name || profile?.name || "User",
              email: user.email,
              password: "", // OAuth não precisa de senha
              avatar: user.image,
            })
          }

          // Definir o ID MongoDB no user object
          user.id = dbUser._id?.toString() || dbUser.id
        }

        return true
      } catch (error) {
        console.error("[AUTH_SIGNIN_ERROR]", error)
        return "/login?error=auth"
      }
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { auth, signIn, signOut } = NextAuth(authConfig)

export async function getServerSession() {
  return getServerSessionNextAuth(authConfig)
}
