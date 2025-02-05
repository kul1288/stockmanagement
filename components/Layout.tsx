import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FaHome, FaUser, FaBox, FaFileInvoice, FaChartLine, FaSignOutAlt } from "react-icons/fa";

export default function Layout({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return; // Do nothing while loading
        if (!session) {
            router.push("/login");
        }
    }, [session, status, router]);

    const handleLogout = async () => {
        try {
            await signOut({ callbackUrl: "/login" });
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    if (status === "loading") return <div>Loading...</div>; // Show loading state

    if (!session) return null;

    const menuItems = [
        { name: "Dashboard", icon: FaHome, href: "/dashboard" },
        { name: "Vendor", icon: FaUser, href: "/vendor" },
        { name: "Product", icon: FaBox, href: "/product" },
        { name: "Purchase Invoice", icon: FaFileInvoice, href: "/purchase-invoice" },
        { name: "Sell Invoice", icon: FaFileInvoice, href: "/sell-invoice" },
        { name: "Report", icon: FaChartLine, href: "/report" },
    ];

    return (
        <div className="flex">
            <aside className="w-1/4 bg-gray-800 text-white h-screen p-4 flex flex-col justify-between">
                <ul className="space-y-4">
                    {menuItems.map((item) => (
                        <li
                            key={item.name}
                            className={`hover:bg-gray-700 p-2 rounded cursor-pointer flex items-center ${router.pathname === item.href ? "bg-gray-700" : ""
                                }`}
                        >
                            <item.icon className="mr-2" />
                            <a href={item.href}>{item.name}</a>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 flex items-center mt-4"
                >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                </button>
            </aside >
            <main className="w-3/4 p-8">
                {children}
            </main>
        </div >
    );
}
