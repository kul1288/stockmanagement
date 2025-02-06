import Layout from "../../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function EditProduct() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id } = router.query;
    const [partNo, setPartNo] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (status === "authenticated" && id) {
            // Fetch product details
            axios.get(`http://localhost:3001/products/${id}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                const product = response.data;
                setPartNo(product.partNo);
                setName(product.name);
            }).catch(error => {
                if (error.response && error.response.status === 404) {
                    setError("Product not found.");
                } else {
                    console.error("Failed to fetch product details:", error);
                }
            });
        }
    }, [status, session, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!partNo || !name) {
            setError("Part number and name are required.");
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:3001/products/${id}`,
                { partNo, name },
                {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setSuccess("Product updated successfully.");
                setError(""); // Clear the error message
                setTimeout(() => {
                    router.push("/product");
                }, 2000);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError("Product not found.");
            } else {
                setError("Failed to update product. Please try again.");
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Edit Product</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                {success && <div className="mb-4 text-green-500">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Part No</label>
                        <input
                            type="text"
                            value={partNo}
                            onChange={(e) => setPartNo(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Update Product
                    </button>
                </form>
            </div>
        </Layout>
    );
}
