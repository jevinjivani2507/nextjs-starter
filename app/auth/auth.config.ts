import { AuthConfig } from "@auth/core";
import Google from "@auth/core/providers/google";
import connectDB from "@/lib/mongodb";
import UserModel from "@/models/User";

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
      if (account?.provider === "google" && profile) {
        try {
          const db = await connectDB();
          console.log("db", db);

          if (!db) {
            console.error("Failed to connect to database");
            return false;
          }

          const googleProfile = profile as {
            sub?: string;
            given_name?: string;
            family_name?: string;
            name?: string;
            email?: string;
            picture?: string;
          };

          if (!googleProfile.sub || !googleProfile.email) {
            console.error("Required Google profile information missing");
            return false;
          }

          // Check if user exists
          const existingUser = await UserModel.findOne({
            googleId: googleProfile.sub,
          });

          if (!existingUser) {
            // Create new user if doesn't exist
            await UserModel.create({
              googleId: googleProfile.sub,
              firstName: googleProfile.given_name || "Unknown",
              lastName: googleProfile.family_name || "Unknown",
              displayName: googleProfile.name || "Unknown User",
              email: googleProfile.email,
              avatar: googleProfile.picture,
            });
          }

          return true;
        } catch (error) {
          console.error("Error saving user to database:", error);
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
