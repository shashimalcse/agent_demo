import NextAuth from "next-auth"
import Asgardeo from "next-auth/providers/asgardeo"

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [Asgardeo({
        issuer: process.env.AUTH_ASGARDEO_ISSUER
    })],
})
