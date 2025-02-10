import Layout from "../../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FaTimes } from "react-icons/fa";

export default function SearchProduct() {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<{ id: number; partNo: string; name: string; commonName: string; unit: string; currentStock: number; minimumQuantity?: number; lastPurchasePrice: number; }[]>([]);
    const [suggestions, setSuggestions] = useState<{ id: number; partNo: string; name: string; commonName: string; unit: string; currentStock: number; minimumQuantity?: number; lastPurchasePrice: number; }[]>([]);

    // Update the useEffect for suggestions
    useEffect(() => {
        if (searchTerm.length > 2) {
            // Check if we already have the exact product in results
            const exactMatch = products.some(p => p.partNo === searchTerm);
            if (!exactMatch) {
                axios.get(`http://localhost:3001/products/search?partNo=${searchTerm}`, {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                }).then(response => {
                    setSuggestions(response.data);
                }).catch(error => {
                    console.error("Failed to fetch product suggestions:", error);
                });
            }
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, session, products]); // Add products to dependencies

    // Update handleSuggestionClick to clear search term properly
    const handleSuggestionClick = (product) => {
        setSearchTerm(product.partNo);
        setSuggestions([]);
        // Check if product is not already in the list
        if (!products.some(p => p.id === product.id)) {
            setProducts([product]);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setSuggestions([]);
        setProducts([]);
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md"> {/* Changed from max-w-md to max-w-6xl */}
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Search Product</h2>
                <div className="mb-4 relative w-96"> {/* Added fixed width for search box */}
                    <label className="block text-gray-700">Part No</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 pr-8 border rounded"
                        />
                        {searchTerm && (
                            <FaTimes
                                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                                onClick={handleClearSearch}
                            />
                        )}
                    </div>
                    {suggestions.length > 0 && searchTerm.length > 2 && !products.some(p => p.partNo === searchTerm) && (
                        <ul className="border rounded mt-2 bg-white absolute w-full z-10">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.partNo} - {suggestion.name} - {suggestion.commonName} {/* Add this line */}
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
                            <th className="py-2 px-4 border-b">Common Name</th> {/* Add this line */}
                            <th className="py-2 px-4 border-b">Unit</th>
                            <th className="py-2 px-4 border-b">Current Stock</th>
                            <th className="py-2 px-4 border-b">Min Quantity</th>
                            <th className="py-2 px-4 border-b">Last Purchase Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="py-2 px-4 border-b">{product.partNo}</td>
                                <td className="py-2 px-4 border-b">{product.name}</td>
                                <td className="py-2 px-4 border-b">{product.commonName}</td> {/* Add this line */}
                                <td className="py-2 px-4 border-b">{product.unit}</td>
                                <td className="py-2 px-4 border-b">{product.currentStock}</td>
                                <td className="py-2 px-4 border-b">{product.minimumQuantity || 0}</td>
                                <td className="py-2 px-4 border-b">{product.lastPurchasePrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
