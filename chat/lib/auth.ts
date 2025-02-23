import NextAuth from "next-auth"
import AsgardeoProvider from "next-auth/providers/asgardeo"

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        AsgardeoProvider({
            issuer: process.env.AUTH_ASGARDEO_ISSUER,
            clientId: process.env.ASGARDEO_CLIENT_ID!,
            clientSecret: process.env.ASGARDEO_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken
            return session
        },
    },
})
