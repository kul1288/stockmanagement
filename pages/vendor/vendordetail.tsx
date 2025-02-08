import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function VendorDetail() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [vendor, setVendor] = useState(null);

    useEffect(() => {
        if (status === "authenticated" && id) {
            // Fetch vendor details
            axios.get(`http://localhost:3001/vendors/${id}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                setVendor(response.data);
            }).catch(error => {
                console.error("Failed to fetch vendor details:", error);
            });
        }
    }, [status, session, id]);

    if (!vendor) return <div>Loading...</div>;

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
    };

    return (
        <Layout>
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-2xl font-bold mb-6 text-blue-600">Vendor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-gray-700">Name</p>
                        <p className="text-gray-900">{vendor.name}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-gray-700">Address</p>
                        <p className="text-gray-900">{vendor.address}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-gray-700">Email</p>
                        <p className="text-gray-900">{vendor.email}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-gray-700">Phone No</p>
                        <p className="text-gray-900">{vendor.phoneno}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-gray-700">GST Number</p>
                        <p className="text-gray-900">{vendor.gstNo || 'Not provided'}</p>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-gray-700">Last Modified</p>
                        <p className="text-gray-900">{formatDate(vendor.modifiedAt)}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
