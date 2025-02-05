import { SessionProvider, useSession } from "next-auth/react";
import "../styles/globals.css";
import { useEffect } from "react";
import axios from "axios";
// ...existing code...

import { AppProps } from "next/app";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <TokenRefreshHandler />
            <Component {...pageProps} />
        </SessionProvider>
    );
}

function TokenRefreshHandler() {
    const { data: session } = useSession();

    useEffect(() => {
        const interval = setInterval(async () => {
            if (session?.refreshToken) {
                try {
                    const response = await axios.post(
                        "http://localhost:3001/auth/refresh-token",
                        {
                            refresh_token: session.refreshToken,
                        },
                        {
                            headers: {
                                Cookie: `jwt=${session.accessToken}`,
                            },
                        }
                    );

                    if (response.status === 200 && response.data.access_token) {
                        // Update the session with the new access token
                        session.accessToken = response.data.access_token;
                    }
                } catch (error) {
                    console.error("Failed to refresh token:", error);
                }
            }
        }, 15 * 60 * 1000); // Refresh token every 15 minutes

        return () => clearInterval(interval);
    }, [session]);

    return null;
}

export default MyApp;
