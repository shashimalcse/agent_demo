import NextAuth from "next-auth"
import AsgardeoProvider from "next-auth/providers/asgardeo"

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        AsgardeoProvider({
            issuer: process.env.AUTH_ASGARDEO_ISSUER,
            clientId: process.env.ASGARDEO_CLIENT_ID!,
            clientSecret: process.env.ASGARDEO_CLIENT_SECRET!,
            authorization: { params: { scope: 'openid profile' } },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token
                token.idToken = account.id_token
            }
            if (profile) {
                token.username = profile.username;
                token.given_name = profile.given_name;
                token.user_id = profile.sub;
              }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.username = token.username as string;
                session.user.given_name = token.given_name as string;
                session.accessToken = token.accessToken
                session.idToken = token.idToken
                session.user.id = token.user_id
              }
            return session
        },
    },
})
