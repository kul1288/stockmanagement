import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function PurchaseInvoice() {
    const { data: session, status } = useSession();
    const [invoices, setInvoices] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") {
            // Fetch purchase invoice list
            axios.get(`http://localhost:3001/purchase-invoices?page=${page}&limit=10`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                setInvoices(response.data.data);
                setTotalCount(response.data.count);
            }).catch(error => {
                console.error("Failed to fetch purchase invoices:", error);
            });
        }
    }, [status, session, page]);

    const handleCreateInvoice = () => {
        // Navigate to create purchase invoice page
        router.push("/purchase-invoice/create");
    };

    const handleViewInvoice = (id) => {
        // Navigate to view purchase invoice page
        router.push(`/purchase-invoice-detail?id=${id}`);
    };

    const handleDeleteInvoice = async () => {
        try {
            const response = await axios.delete(`http://localhost:3001/purchase-invoices/${invoiceToDelete}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });

            if (response.status === 200) {
                setShowModal(false);
                setError("");
                // Remove the deleted invoice from the state
                setInvoices(invoices.filter(invoice => invoice.id !== invoiceToDelete));
            }
        } catch (err) {
            setShowModal(false);
            if (err.response && err.response.status === 404) {
                setError("Purchase invoice not found.");
            } else if (err.response && err.response.status === 400) {
                setError("Cannot delete purchase invoice with products that have been partially used.");
            } else {
                setError("Failed to delete purchase invoice. Please try again.");
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Purchase Invoices</h2>
                <button
                    onClick={handleCreateInvoice}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Create Purchase Invoice
                </button>
            </div>
            {error && (
                <div className="mb-4 text-red-500">
                    {error}
                </div>
            )}
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">#</th>
                        <th className="py-2 px-4 border-b">Invoice Number</th>
                        <th className="py-2 px-4 border-b">Purchase Date</th>
                        <th className="py-2 px-4 border-b">Type</th>
                        <th className="py-2 px-4 border-b">Total Amount</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map((invoice, index) => {
                        const totalAmount = invoice.products.reduce((total, product) => {
                            const discountAmount = (product.rate * product.quantity) * (product.discount / 100);
                            return total + (product.rate * product.quantity) - discountAmount;
                        }, 0);

                        return (
                            <tr key={invoice.id}>
                                <td className="py-2 px-4 border-b">{index + 1 + (page - 1) * 10}</td>
                                <td className="py-2 px-4 border-b">{invoice.id}</td>
                                <td className="py-2 px-4 border-b">{new Date(invoice.purchaseDate).toLocaleDateString('en-GB')}</td>
                                <td className="py-2 px-4 border-b">{invoice.type}</td>
                                <td className="py-2 px-4 border-b">{totalAmount}</td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        onClick={() => handleViewInvoice(invoice.id)}
                                        className="bg-green-500 text-white py-1 px-2 rounded hover:bg-green-600 mr-2"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => {
                                            setInvoiceToDelete(invoice.id);
                                            setShowModal(true);
                                        }}
                                        className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page * 10 >= totalCount}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                    Next
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
                        <p className="mb-4">Are you sure you want to delete this purchase invoice?</p>
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
        </Layout>
    );
}
