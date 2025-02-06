import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function PurchaseInvoiceDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { data: session, status } = useSession();
    const [invoiceData, setInvoiceData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (status === "authenticated" && id) {
            // Fetch purchase invoice details
            axios.get(`http://localhost:3001/purchase-invoices/${id}`, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                setInvoiceData(response.data);
            }).catch(error => {
                if (error.response && error.response.status === 404) {
                    setError("Purchase invoice not found.");
                } else {
                    console.error("Failed to fetch purchase invoice details:", error);
                }
            });
        }
    }, [status, session, id]);

    if (!invoiceData) {
        return (
            <Layout>
                <div>{error || "Loading..."}</div>
            </Layout>
        );
    }

    const totalAmount = invoiceData.products.reduce((total, product) => {
        const discountAmount = (product.rate * product.quantity) * (product.discount / 100);
        return total + (product.rate * product.quantity) - discountAmount;
    }, 0);

    const totalDiscountAmount = invoiceData.products.reduce((total, product) => {
        return total + (product.rate * product.quantity) * (product.discount / 100);
    }, 0);

    const taxAmount = invoiceData.tax > 0 ? (totalAmount * invoiceData.tax / 100) : 0;
    const finalAmount = totalAmount + taxAmount;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold mb-6 text-blue-600 text-center">Purchase Invoice</h2>
                <div className="flex justify-between mb-4">
                    <div>
                        <p><strong>Invoice Number:</strong> {invoiceData.id}</p>
                        <p><strong>Purchase Date:</strong> {new Date(invoiceData.purchaseDate).toLocaleDateString('en-GB')}</p>
                        <p><strong>Type:</strong> {invoiceData.type}</p>
                    </div>
                    <div>
                        <p><strong>Name:</strong> {invoiceData.vendor.name}</p>
                        <p><strong>Address:</strong> {invoiceData.vendor.address}</p>
                        <p><strong>Email:</strong> {invoiceData.vendor.email}</p>
                        <p><strong>Phone No:</strong> {invoiceData.vendor.phoneno}</p>
                    </div>
                </div>
                <table className="min-w-full bg-white mt-4">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Part No</th>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Quantity</th>
                            <th className="py-2 px-4 border-b">Rate</th>
                            <th className="py-2 px-4 border-b">Discount (%)</th>
                            <th className="py-2 px-4 border-b">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceData.products.map((product) => {
                            const discountAmount = (product.rate * product.quantity) * (product.discount / 100);
                            const total = (product.rate * product.quantity) - discountAmount;
                            return (
                                <tr key={product.id}>
                                    <td className="py-2 px-4 border-b">{product.product.partNo}</td>
                                    <td className="py-2 px-4 border-b">{product.product.name}</td>
                                    <td className="py-2 px-4 border-b">{product.quantity}</td>
                                    <td className="py-2 px-4 border-b">{product.rate}</td>
                                    <td className="py-2 px-4 border-b">{product.discount}</td>
                                    <td className="py-2 px-4 border-b">{total}</td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td colSpan="4"></td>
                            <td className="py-2 px-4 border-b">Discount</td>
                            <td className="py-2 px-4 border-b">{totalDiscountAmount}</td>
                        </tr>
                        <tr>
                            <td colSpan="4"></td>
                            <td className="py-2 px-4 border-b font-bold">{taxAmount > 0 ? "Subtotal" : "Total Amount"}</td>
                            <td className="py-2 px-4 border-b font-bold">{totalAmount}</td>
                        </tr>
                        {taxAmount > 0 && (
                            <tr>
                                <td colSpan="4"></td>
                                <td className="py-2 px-4 border-b font-bold">Tax ({invoiceData.tax}%)</td>
                                <td className="py-2 px-4 border-b font-bold">{taxAmount}</td>
                            </tr>
                        )}
                        {taxAmount > 0 && (
                            <tr>
                                <td colSpan="4"></td>
                                <td className="py-2 px-4 border-b font-bold">Total Amount</td>
                                <td className="py-2 px-4 border-b font-bold">{finalAmount}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
