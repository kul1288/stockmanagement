import { SessionProvider, useSession, signOut } from "next-auth/react"; // Add signOut import
import "../styles/globals.css";
import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router"; // Add this import

import { AppProps } from "next/app";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <AxiosInterceptor />
            <TokenRefreshHandler />
            <Component {...pageProps} />
        </SessionProvider>
    );
}

// Add new interceptor component
function AxiosInterceptor() {
    const router = useRouter();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    signOut({ redirect: false }).then(() => {
                        router.push('/login');
                    });
                }
                return Promise.reject(error);
            }
        );

        // Clean up interceptor on unmount
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [router]);

    return null;
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
