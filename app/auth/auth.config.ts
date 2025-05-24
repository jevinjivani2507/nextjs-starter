import { AuthConfig } from "@auth/core";
import Google from "@auth/core/providers/google";
import db from "@/lib/db";

export const authConfig: AuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered:", { user, account, profile });

      if (account?.provider === "google" && profile) {
        try {
          const googleProfile = profile as {
            sub?: string;
            given_name?: string;
            family_name?: string;
            name?: string;
            email?: string;
            picture?: string;
          };

          console.log("Google profile:", googleProfile);

          if (!googleProfile.sub || !googleProfile.email) {
            console.error("Required Google profile information missing");
            return false;
          }

          // Check if user exists by email
          const existingUser = await db.user.findUnique({
            where: { email: googleProfile.email },
            include: { accounts: true },
          });

          console.log("Existing user check:", existingUser);

          if (existingUser) {
            // If user exists but doesn't have a Google account, link it
            if (
              !existingUser.accounts.some((acc) => acc.provider === "google")
            ) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: "oauth",
                  provider: "google",
                  providerAccountId: googleProfile.sub,
                  access_token: account.access_token || null,
                  refresh_token: account.refresh_token || null,
                  expires_at: account.expires_at || null,
                  token_type: account.token_type || null,
                  scope: account.scope || null,
                  id_token: account.id_token || null,
                  session_state: (account.session_state as string) || null,
                },
              });
            }
            return true;
          }

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          userId: user.id,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
        userId: token.userId,
      };
    },
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
