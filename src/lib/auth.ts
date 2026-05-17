import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import type { NextAuthOptions } from "next-auth"

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user) return session

      ;(session.user as any).id = user.id

      const account = await prisma.account.findFirst({
        where: { userId: user.id, provider: "google" },
      })

      if (!account) return session

      const nowSec = Math.floor(Date.now() / 1000)
      const expiredOrSoon = account.expires_at && account.expires_at < nowSec + 60

      if (!expiredOrSoon && account.access_token) {
        ;(session as any).accessToken = account.access_token
        return session
      }

      // 토큰 만료 → refresh_token으로 갱신
      if (account.refresh_token) {
        try {
          const refreshed = await refreshAccessToken(account.refresh_token)
          await prisma.account.update({
            where: { id: account.id },
            data: {
              access_token: refreshed.access_token,
              expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
              ...(refreshed.refresh_token && { refresh_token: refreshed.refresh_token }),
            },
          })
          ;(session as any).accessToken = refreshed.access_token
        } catch (e) {
          console.error("Token refresh failed:", e)
        }
      }

      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
