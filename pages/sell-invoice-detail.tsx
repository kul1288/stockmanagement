import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { useReactToPrint } from "react-to-print";
import { useEffect, useState, useRef } from "react";
import { FaPrint } from "react-icons/fa";

export default function SellInvoiceDetail() {
    const router = useRouter();
    const [invoiceData, setInvoiceData] = useState(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({
        contentRef,
        documentTitle: invoiceData?.id ? `Invoice-${invoiceData.id}` : 'Invoice',
        pageStyle: `
            @page {
                size: A4;
                margin: 10mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
                .no-print {
                    display: none;
                }
            }
        `,
        onPrintError: (error) => {
            console.error('Failed to print:', error);
        }
    });

    useEffect(() => {
        if (router.query.data) {
            try {
                const data = JSON.parse(router.query.data);
                setInvoiceData(data);
            } catch (e) {
                console.error("Error parsing invoice data:", e);
            }
        }
    }, [router.query]);

    if (!invoiceData) {
        return (
            <Layout>
                <div>Loading...</div>
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
            <div className="no-print flex justify-end mb-6">
                <button
                    onClick={() => reactToPrintFn()}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
                >
                    <FaPrint /> Print Invoice
                </button>
            </div>
            <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md" ref={contentRef}>
                <div className="flex justify-between mb-6">
                    <div className="flex-grow text-center">
                        <h2 className="text-3xl font-bold text-blue-600">Invoice</h2>
                    </div>
                </div>

                <div className="p-6 bg-white">
                    {/* Invoice Details */}
                    <div className="flex justify-between mb-6">
                        <div>
                            <p>{invoiceData.customerName}</p>
                            <p>{invoiceData.customerPhoneNumber}</p>
                            <p>{invoiceData.customerEmail || 'N/A'}</p>
                            <p>{invoiceData.customerAddress}</p>
                            {invoiceData.customerGstNo && (
                                <p><strong>GST No:</strong> {invoiceData.customerGstNo}</p>
                            )}
                        </div>
                        <div>
                            <p><strong>AUTOVRITTI</strong></p>
                            <p>Tahsil Road Sahjanwa</p>
                            <p><strong>Invoice Number:</strong> {invoiceData.id}</p>
                            <p><strong>Date:</strong> {new Date(invoiceData.sellDate).toLocaleDateString('en-GB')}</p>
                            <p><strong>Payment Type:</strong> {invoiceData.type.toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Products Table */}
                    <table className="min-w-full bg-white border mb-6">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border">Part No</th>
                                <th className="py-2 px-4 border">Name</th>
                                <th className="py-2 px-4 border">Quantity</th>
                                <th className="py-2 px-4 border">Rate</th>
                                <th className="py-2 px-4 border">Discount (%)</th>
                                <th className="py-2 px-4 border">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.products.map((product) => {
                                const discountAmount = (product.rate * product.quantity) * (product.discount / 100);
                                const total = (product.rate * product.quantity) - discountAmount;
                                return (
                                    <tr key={product.id}>
                                        <td className="py-2 px-4 border">{product.product.partNo}</td>
                                        <td className="py-2 px-4 border">{product.product.name}</td>
                                        <td className="py-2 px-4 border">{product.quantity}</td>
                                        <td className="py-2 px-4 border">₹{product.rate}</td>
                                        <td className="py-2 px-4 border">{product.discount}%</td>
                                        <td className="py-2 px-4 border">₹{total}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Amount Summary */}
                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-2">
                                <span>Subtotal:</span>
                                <span>₹{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span>Total Discount:</span>
                                <span>₹{totalDiscountAmount.toFixed(2)}</span>
                            </div>
                            {taxAmount > 0 && (
                                <div className="flex justify-between py-2">
                                    <span>Tax ({invoiceData.tax}%):</span>
                                    <span>₹{taxAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 font-bold border-t">
                                <span>Final Amount:</span>
                                <span>₹{finalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center text-sm">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}