import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function Login() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "loading") return; // Do nothing while loading
        if (session) {
            router.push("/dashboard");
        }
    }, [session, status, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }
        const result = await signIn("credentials", {
            redirect: false,
            username,
            password,
        });

        if (result && result.ok) {
            window.location.href = "/dashboard";
        } else {
            setError("Invalid credentials. Please try again.");
        }
    };

    if (status === "loading") return <div>Loading...</div>; // Show loading state

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Head>
                <title>InventoryFlow</title>
            </Head>
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6">InventoryFlow</h1>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Username</label>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
