import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaTimes } from "react-icons/fa";
import type { Invoice } from "../interfaces";

export default function SellInvoice() {
    const { data: session, status } = useSession();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnInvoice, setReturnInvoice] = useState<Invoice | null>(null);
    interface ReturnProduct {
        productId: number;
        partNo: string;
        quantity: number;
        reason: string;
        maxQuantity: number;
    }

    const [returnProducts, setReturnProducts] = useState<ReturnProduct[]>([]);
    const [returnError, setReturnError] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            let url = `http://localhost:3001/sell-invoices?page=${page}&limit=10`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                setInvoices(response.data.data);
                setTotalCount(response.data.count);
            }).catch(error => {
                console.error("Failed to fetch sell invoices:", error);
            });
        }
    }, [status, session, page, startDate, endDate]);

    const handleCreateInvoice = () => {
        router.push("/sell-invoice/create");
    };

    const handleViewInvoice = (invoice) => {
        router.push({
            pathname: '/sell-invoice-detail',
            query: {
                id: invoice.id,
                data: JSON.stringify(invoice) // Add invoice data to query
            }
        });
    };

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    const calculateTotal = (products) => {
        return products.reduce((total, item) => {
            const netQuantity = item.quantity - item.returnedQuantity;
            const itemTotal = netQuantity * item.rate;
            const discountAmount = (itemTotal * item.discount) / 100;
            return total + (itemTotal - discountAmount);
        }, 0);
    };

    const handleDeleteInvoice = async () => {
        try {
            const response = await axios.delete(`http://localhost:3001/sell-invoices/${invoiceToDelete}`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });

            if (response.status === 200) {
                setShowModal(false);
                setSuccessMessage(response.data.message);
                setShowSuccessModal(true);
                // Remove the deleted invoice from the state
                setInvoices(invoices.filter(invoice => invoice.id !== invoiceToDelete));
                setInvoiceToDelete(null);
            }
        } catch (err) {
            console.error("Failed to delete invoice:", err);
            if (axios.isAxiosError(err) && err.response) {
                alert(err.response.data.message || "Failed to delete invoice. Please try again.");
            } else {
                alert("Failed to delete invoice. Please try again.");
            }
        }
    };

    const handleReturnInvoice = (invoice) => {
        setReturnInvoice(invoice);
        setReturnProducts(invoice.products.map(product => ({
            productId: product.product.id,
            partNo: product.product.partNo,
            quantity: 0,
            reason: "",
            maxQuantity: product.quantity - product.returnedQuantity
        })));
        setShowReturnModal(true);
    };

    const handleReturnProductChange = (index, field, value) => {
        const newReturnProducts = [...returnProducts];
        newReturnProducts[index][field] = field === "quantity" ? Number(value) : value;
        setReturnProducts(newReturnProducts);
    };

    const handleSubmitReturn = async () => {
        if (returnProducts.some(product => product.quantity > product.maxQuantity)) {
            setReturnError("Returned quantity cannot be greater than purchased quantity.");
            return;
        }

        try {
            const response = await axios.patch("http://localhost:3001/sell-invoices/return", {
                sellInvoiceId: returnInvoice?.id ?? 0,
                products: returnProducts
                    .filter(product => product.quantity > 0)
                    .map(({ productId, quantity, reason }) => ({ productId, quantity, reason }))
            }, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200) {
                setShowReturnModal(false);
                setSuccessMessage(response.data.message);
                setShowSuccessModal(true);
                setReturnInvoice(null);
                setReturnProducts([]);
            }
        } catch (err) {
            console.error("Failed to return products:", err);
            if (axios.isAxiosError(err) && err.response && err.response.status === 400) {
                setReturnError(err.response.data.message.join(", "));
            } else {
                setReturnError("Failed to return products. Please try again.");
            }
        }
    };

    return (
        <Layout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Sales Invoices</h2>
                    <button
                        onClick={handleCreateInvoice}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Create Sale Invoice
                    </button>
                </div>

                <div className="mb-6 flex items-end gap-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 border rounded"
                        />
                    </div>
                    {(startDate || endDate) && (
                        <button
                            onClick={handleClearFilters}
                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 flex items-center"
                        >
                            <FaTimes className="mr-2" /> Clear Filters
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 border-b">#</th>
                                <th className="py-2 px-4 border-b">Invoice Number</th>
                                <th className="py-2 px-4 border-b">Date</th>
                                <th className="py-2 px-4 border-b">Customer</th>
                                <th className="py-2 px-4 border-b">Type</th>
                                <th className="py-2 px-4 border-b">Total Amount</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice, index) => (
                                <tr key={invoice.id}>
                                    <td className="py-2 px-4 border-b">{index + 1 + (page - 1) * 10}</td>
                                    <td className="py-2 px-4 border-b">{invoice.id}</td>
                                    <td className="py-2 px-4 border-b">
                                        {new Date(invoice.sellDate).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="py-2 px-4 border-b">{invoice.customerName}</td>
                                    <td className="py-2 px-4 border-b capitalize">{invoice.type}</td>
                                    <td className="py-2 px-4 border-b">₹{calculateTotal(invoice.products).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button
                                            onClick={() => handleViewInvoice(invoice)}
                                            className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 mr-2"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setInvoiceToDelete(invoice.id);
                                                setShowModal(true);
                                            }}
                                            className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 mr-2"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleReturnInvoice(invoice)}
                                            className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600"
                                        >
                                            Return
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span>Page {page}</span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page * 10 >= totalCount}
                        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded shadow-md">
                            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                            <p className="mb-4">Are you sure you want to delete this invoice?</p>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteInvoice}
                                    className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Return Modal */}
                {showReturnModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
                            <h3 className="text-xl font-bold mb-4">Return Products</h3>
                            {returnError && <div className="mb-4 text-red-500">{returnError}</div>}
                            {returnProducts.map((product, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span>{product.partNo}</span>
                                        <span>Max: {product.maxQuantity}</span>
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Quantity"
                                        value={product.quantity}
                                        onChange={(e) => handleReturnProductChange(index, "quantity", e.target.value)}
                                        className="w-full px-3 py-2 border rounded mb-2"
                                        max={product.maxQuantity}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Reason (optional)"
                                        value={product.reason}
                                        onChange={(e) => handleReturnProductChange(index, "reason", e.target.value)}
                                        className="w-full px-3 py-2 border rounded"
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowReturnModal(false)}
                                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReturn}
                                    className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                                >
                                    Return
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded shadow-md">
                            <h3 className="text-xl font-bold mb-4">Success</h3>
                            <p className="mb-4">{successMessage}</p>
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
            </div>
        </Layout>
    );
}
