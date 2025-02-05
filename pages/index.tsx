import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Do nothing while loading
        if (!session) {
            router.push("/login");
        } else {
            router.push("/dashboard");
        }
    }, [session, status, router]);

    if (status === "loading") return <div>Loading...</div>; // Show loading state

    return null;
}
