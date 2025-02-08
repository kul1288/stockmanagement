import Layout from "../../components/Layout";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AddProduct() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [partNo, setPartNo] = useState("");
    const [name, setName] = useState("");
    const [minimumQuantity, setMinimumQuantity] = useState(0);
    const [unit, setUnit] = useState(""); // Add this line
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!partNo || !name || !unit) { // Add unit validation
            setError("Part number, name, and unit are required.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3001/products",
                { partNo, name, minimumQuantity, unit }, // Add unit to payload
                {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                setSuccess("Product added successfully.");
                setError(""); // Clear the error message
                setTimeout(() => {
                    router.push("/product");
                }, 2000);
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setError(err.response.data.message);
            } else {
                setError("Failed to add product. Please try again.");
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Add Product</h2>
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
                    <div className="mb-4">
                        <label className="block text-gray-700">Minimum Quantity</label>
                        <input
                            type="number"
                            value={minimumQuantity}
                            onChange={(e) => setMinimumQuantity(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded"
                            min="0"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Unit</label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="PCS">PCS</option>
                            <option value="SET">SET</option>
                            <option value="KG">KG</option>
                            <option value="ML">ML</option>
                            <option value="LTR">LTR</option>
                            <option value="MTR">MTR</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Add Product
                    </button>
                </form>
            </div>
        </Layout>
    );
}
