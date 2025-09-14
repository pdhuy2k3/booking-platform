import NextAuth, { type NextAuthOptions } from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import { type JWT } from "next-auth/jwt"
import { type Session } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "storefront-bff",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "wYUpnvBO9kXw9Aa7M1fU9DakJQ5XNIvx",
      issuer: process.env.KEYCLOAK_ISSUER || "http://localhost:9090/realms/BookingSmart",
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: any }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken as string
      return session
    }
  }
}

export default NextAuth(authOptions)