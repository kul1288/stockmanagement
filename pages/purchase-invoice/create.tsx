import Layout from "../../components/Layout";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaTimes } from "react-icons/fa";
import debounce from "lodash.debounce";

export default function CreatePurchaseInvoice() {
    const { data: session, status } = useSession();
    const [vendors, setVendors] = useState<{ id: number; name: string }[]>([]);
    const [selectedVendor, setSelectedVendor] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [tax, setTax] = useState(false);
    const [type, setType] = useState("cash");
    const [invoiceProducts, setInvoiceProducts] = useState([{ productId: "", partNo: "", quantity: 1, rate: 0, discount: 0 }]);
    const [error, setError] = useState("");
    const [productSearchTerms, setProductSearchTerms] = useState([""]);
    const [productSuggestions, setProductSuggestions] = useState<{ id: number; partNo: string; name: string }[][]>([[]]);
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            // Fetch vendors
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

    // Update the fetchProductSuggestions function with debouncing and proper dependencies
    const fetchProductSuggestions = useCallback(
        debounce(async (term, index) => {
            if (term.length > 2) {
                try {
                    const response = await axios.get(`http://localhost:3001/products/search?partNo=${term}`, {
                        headers: {
                            Authorization: `Bearer ${session?.accessToken}`,
                        },
                    });

                    setProductSuggestions(prev => {
                        const newSuggestions = [...prev];
                        newSuggestions[index] = response.data;
                        return newSuggestions;
                    });
                } catch (error) {
                    console.error("Failed to fetch product suggestions:", error);
                }
            } else {
                setProductSuggestions(prev => {
                    const newSuggestions = [...prev];
                    newSuggestions[index] = [];
                    return newSuggestions;
                });
            }
        }, 300), // 300ms debounce delay
        [session]
    );

    const handleAddProduct = () => {
        setInvoiceProducts([...invoiceProducts, { productId: "", partNo: "", quantity: 1, rate: 0, discount: 0 }]);
        setProductSearchTerms([...productSearchTerms, ""]);
        setProductSuggestions([...productSuggestions, []]);
    };

    const handleRemoveProduct = (index) => {
        const newInvoiceProducts = [...invoiceProducts];
        newInvoiceProducts.splice(index, 1);
        setInvoiceProducts(newInvoiceProducts);

        const newSearchTerms = [...productSearchTerms];
        newSearchTerms.splice(index, 1);
        setProductSearchTerms(newSearchTerms);

        const newSuggestions = [...productSuggestions];
        newSuggestions.splice(index, 1);
        setProductSuggestions(newSuggestions);
    };

    const handleProductChange = (index, field, value) => {
        const newInvoiceProducts = [...invoiceProducts];
        newInvoiceProducts[index][field] = value;
        setInvoiceProducts(newInvoiceProducts);
    };

    // Update the handleProductSearchChange function
    const handleProductSearchChange = (index, value) => {
        const newSearchTerms = [...productSearchTerms];
        newSearchTerms[index] = value;
        setProductSearchTerms(newSearchTerms);

        // Directly call the debounced function
        fetchProductSuggestions(value, index);
    };

    const handleProductSuggestionClick = (index, product) => {
        const newInvoiceProducts = [...invoiceProducts];
        newInvoiceProducts[index].productId = product.id;
        newInvoiceProducts[index].partNo = product.partNo;
        newInvoiceProducts[index].rate = product.lastPurchasePrice;
        setInvoiceProducts(newInvoiceProducts);

        const newSearchTerms = [...productSearchTerms];
        newSearchTerms[index] = product.partNo;
        setProductSearchTerms(newSearchTerms);

        const newSuggestions = [...productSuggestions];
        newSuggestions[index] = [];
        setProductSuggestions(newSuggestions);
    };

    const handleClearProductSearch = (index) => {
        const newSearchTerms = [...productSearchTerms];
        newSearchTerms[index] = "";
        setProductSearchTerms(newSearchTerms);

        const newSuggestions = [...productSuggestions];
        newSuggestions[index] = [];
        setProductSuggestions(newSuggestions);

        const newInvoiceProducts = [...invoiceProducts];
        newInvoiceProducts[index].productId = "";
        newInvoiceProducts[index].partNo = "";
        newInvoiceProducts[index].rate = 0;
        setInvoiceProducts(newInvoiceProducts);

        fetchProductSuggestions("", index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const productIds = invoiceProducts.map(p => p.productId);
        const hasDuplicateProductIds = new Set(productIds).size !== productIds.length;

        if (!selectedVendor || !purchaseDate || invoiceProducts.some(p => !p.productId || p.quantity <= 0 || p.rate <= 0 || p.partNo === "")) {
            setError("Please fill in all required fields.");
            return;
        }

        if (hasDuplicateProductIds) {
            setError("Products must be unique.");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3001/purchase-invoices", {
                vendorId: Number(selectedVendor),
                purchaseDate,
                tax: tax ? true : false,
                type,
                products: invoiceProducts.map(p => ({
                    productId: Number(p.productId),
                    quantity: Number(p.quantity),
                    rate: Number(p.rate),
                    discount: Number(p.discount),
                })),
            }, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 201) {
                router.push("/purchase-invoice");
            }
        } catch (error) {
            console.error("Failed to create purchase invoice:", error);
            if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
                setError(error.response.data.message.join(", "));
            } else {
                setError("Failed to create purchase invoice. Please try again.");
            }
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-blue-600">Create Purchase Invoice</h2>
                {error && <div className="mb-4 text-red-500">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Vendor</label>
                        <select
                            value={selectedVendor}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="">Select Vendor</option>
                            {Array.isArray(vendors) && vendors.map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Purchase Date</label>
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            max={new Date().toISOString().split("T")[0]}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Tax</label>
                        <input
                            type="checkbox"
                            checked={tax}
                            onChange={(e) => setTax(e.target.checked)}
                            className="mr-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="cash">Cash</option>
                            <option value="credit">Credit</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between mb-2 font-bold">
                            <span className="w-1/4">Product</span>
                            <span className="w-1/4">Quantity</span>
                            <span className="w-1/4">Rate</span>
                            <span className="w-1/4">Discount (%)</span>
                        </div>
                        {invoiceProducts.map((product, index) => (
                            <div key={index} className="mb-4 border p-4 rounded">
                                <div className="flex justify-between mb-2">
                                    <div className="relative w-1/4">
                                        <input
                                            type="text"
                                            placeholder="Search Product"
                                            value={productSearchTerms[index]}
                                            onChange={(e) => {
                                                handleProductSearchChange(index, e.target.value);
                                            }}
                                            className="w-full px-3 py-2 border rounded"
                                        />
                                        {productSearchTerms[index] && (
                                            <FaTimes
                                                className="absolute top-3 right-3 cursor-pointer text-gray-500"
                                                onClick={() => handleClearProductSearch(index)}
                                            />
                                        )}
                                        {productSuggestions[index] && productSuggestions[index].length > 0 && (
                                            <ul className="border rounded mt-2 bg-white absolute z-10 w-full">
                                                {productSuggestions[index].map((suggestion) => (
                                                    <li
                                                        key={suggestion.id}
                                                        className="px-3 py-2 cursor-pointer hover:bg-gray-200"
                                                        onClick={() => handleProductSuggestionClick(index, suggestion)}
                                                    >
                                                        {suggestion.partNo} - {suggestion.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                        className="w-1/4 px-3 py-2 border rounded"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Rate"
                                        value={product.rate}
                                        onChange={(e) => handleProductChange(index, "rate", e.target.value)}
                                        className="w-1/4 px-3 py-2 border rounded"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Discount (%)"
                                        value={product.discount}
                                        onChange={(e) => handleProductChange(index, "discount", e.target.value)}
                                        className="w-1/4 px-3 py-2 border rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveProduct(index)}
                                        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Add Product
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Create Invoice
                    </button>
                </form>
            </div>
        </Layout>
    );
}
