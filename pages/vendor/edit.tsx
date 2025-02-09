import Layout from "../../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function EditVendor() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [name, setName] = useState("");
    const [phoneno, setPhoneno] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [gstNo, setGstNo] = useState(""); // Add this line
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (status === "authenticated" && id) {
            // Fetch vendor details
            axios.get(`http://localhost:3001/vendors/${id}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                const vendor = response.data;
                setName(vendor.name);
                setPhoneno(vendor.phoneno);
                setEmail(vendor.email);
                setAddress(vendor.address);
                setGstNo(vendor.gstNo || ""); // Add this line
            }).catch(error => {
                console.error("Failed to fetch vendor details:", error);
            });
        }
    }, [status, session, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !address || !phoneno) {
            setError("Name, address, and phone number are required.");
            return;
        }

        const payload = { name, address, phoneno, gstNo }; // Add gstNo to payload
        if (email) payload.email = email;

        try {
            const response = await axios.put(
                `http://localhost:3001/vendors/${id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setSuccess("Vendor updated successfully.");
                setError(""); // Clear the error message
                setTimeout(() => {
                    router.push("/vendor");
                }, 2000);
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setError(err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                setError("Vendor not found.");
            } else {
                setError("Failed to update vendor. Please try again.");
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Edit Vendor</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                {success && <div className="mb-4 text-green-500">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Phone No</label>
                        <input
                            type="text"
                            value={phoneno}
                            onChange={(e) => setPhoneno(e.target.value)}
                            placeholder="+919898454545"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Address</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-3 py-2 border rounded h-24"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">GST Number</label>
                        <input
                            type="text"
                            value={gstNo}
                            onChange={(e) => setGstNo(e.target.value)}
                            placeholder="GST Number"
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Update Vendor
                    </button>
                </form>
            </div>
        </Layout>
    );
}
