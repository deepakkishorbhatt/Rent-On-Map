import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "select_account",
                }
            }
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                try {
                    await connectDB();
                    if (user.email) {
                        const existingUser = await User.findOne({ email: user.email });
                        if (!existingUser) {
                            await User.create({
                                name: user.name || user.email.split('@')[0] || 'User',
                                email: user.email,
                                image: user.image || '',
                                savedProperties: []
                            });
                        } else {
                            // Update existing user's image and name if changed (keep DB in sync)
                            existingUser.name = user.name || existingUser.name;
                            existingUser.image = user.image || existingUser.image;
                            await existingUser.save();
                        }
                    }
                    return true;
                } catch (error) {
                    console.error('Error saving user to DB:', error);
                    return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session?.user?.email) {
                try {
                    await connectDB();
                    const dbUser = await User.findOne({ email: session.user.email });
                    if (dbUser) {
                        // @ts-ignore
                        session.user.id = dbUser._id.toString();
                    }
                } catch (error) {
                    console.error("Error fetching user session:", error);
                }
            }
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
