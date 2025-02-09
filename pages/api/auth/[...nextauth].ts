/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { User } from "next-auth";

interface CustomUser extends User {
    refreshToken?: string;
}

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        refreshToken?: string;
    }
}

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) {
                    return null;
                }
                try {
                    const response = await axios.post("http://localhost:3001/login", {
                        username: credentials.username,
                        password: credentials.password,
                    });

                    if (response.status === 200 && response.data.access_token) {
                        return {
                            id: response.data.access_token,
                            name: credentials.username,
                            refreshToken: response.data.refresh_token,
                        };
                    } else {
                        return null;
                    }
                } catch (error) {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = user.id;
                token.refreshToken = (user as CustomUser).refreshToken;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            if (token.refreshToken) {
                session.refreshToken = token.refreshToken as string;
            }
            return session;
        },
    },
});
