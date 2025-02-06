import Layout from "../../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function SearchProduct() {
    const { data: session, status } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (searchTerm.length > 2) {
            // Fetch product suggestions
            axios.get(`http://localhost:3001/products/search?partNo=${searchTerm}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                setSuggestions(response.data);
            }).catch(error => {
                console.error("Failed to fetch product suggestions:", error);
            });
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, session]);

    const handleSearch = async () => {
        if (status === "authenticated") {
            try {
                const response = await axios.get(`http://localhost:3001/products/search?partNo=${searchTerm}`, {
                    headers: {
                        Authorization: `Bearer ${session.accessToken}`,
                    },
                });
                setProducts(response.data);
                setSuggestions([]); // Clear suggestions after search
            } catch (error) {
                console.error("Failed to search products:", error);
            }
        }
    };

    const handleSuggestionClick = (product) => {
        setSearchTerm(product.partNo);
        setSuggestions([]);
        setProducts([product]);
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Search Product</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Part No</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />
                    {suggestions.length > 0 && (
                        <ul className="border rounded mt-2 bg-white">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.partNo}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <table className="min-w-full bg-white mt-4">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Part No</th>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Unit</th>
                            <th className="py-2 px-4 border-b">Current Stock</th>
                            <th className="py-2 px-4 border-b">Last Purchase Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="py-2 px-4 border-b">{product.partNo}</td>
                                <td className="py-2 px-4 border-b">{product.name}</td>
                                <td className="py-2 px-4 border-b">{product.unit}</td>
                                <td className="py-2 px-4 border-b">{product.currentStock}</td>
                                <td className="py-2 px-4 border-b">{product.lastPurchasePrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
