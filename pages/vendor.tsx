import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Vendor() {
    const { data: session, status } = useSession();
    const [vendors, setVendors] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [vendorToDelete, setVendorToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            // Fetch vendor list
            axios.get("http://localhost:3001/vendors", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                setVendors(response.data);
            }).catch(error => {
                console.error("Failed to fetch vendors:", error);
            });
        }
    }, [status, session]);

    const handleView = (id) => {
        // Navigate to vendor detail page
        router.push(`/vendor/vendordetail?id=${id}`);
    };

    const handleEdit = (id) => {
        // Navigate to edit vendor page
        router.push(`/vendor/edit?id=${id}`);
    };

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`http://localhost:3001/vendors/${vendorToDelete}`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });

            if (response.status === 200) {
                setShowModal(false);
                setShowSuccessModal(true);
                // Remove the deleted vendor from the state
                setVendors(vendors.filter(vendor => vendor.id !== vendorToDelete));
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                alert("Vendor not found.");
            } else {
                alert("Failed to delete vendor. Please try again.");
            }
        }
    };

    const handleAddVendor = () => {
        // Navigate to add vendor page
        router.push("/vendor/add");
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Vendors</h2>
                <button
                    onClick={handleAddVendor}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Add Vendor
                </button>
            </div>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">#</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Email</th>
                        <th className="py-2 px-4 border-b">Phone No</th>
                        <th className="py-2 px-4 border-b">GST Number</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vendors.map((vendor, index) => (
                        <tr key={vendor.id}>
                            <td className="py-2 px-4 border-b">{index + 1}</td>
                            <td className="py-2 px-4 border-b">{vendor.name}</td>
                            <td className="py-2 px-4 border-b">{vendor.email}</td>
                            <td className="py-2 px-4 border-b">{vendor.phoneno}</td>
                            <td className="py-2 px-4 border-b">{vendor.gstNo || '-'}</td>
                            <td className="py-2 px-4 border-b">
                                <button
                                    onClick={() => handleView(vendor.id)}
                                    className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 mr-2"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleEdit(vendor.id)}
                                    className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600 mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setVendorToDelete(vendor.id);
                                        setShowModal(true);
                                    }}
                                    className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-4">Are you sure you want to delete this vendor?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h3 className="text-xl font-bold mb-4">Success</h3>
                        <p className="mb-4">Vendor deleted successfully.</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
