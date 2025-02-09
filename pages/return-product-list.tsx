import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FaTimes } from "react-icons/fa";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export default function ReturnProductList() {
    const { data: session, status } = useSession();
    const [returns, setReturns] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (status === "authenticated") {
            fetchReturns();
        }
    }, [status, session, page, startDate, endDate]);

    const fetchReturns = async () => {
        let url = `http://localhost:3001/sell-invoices/return-history?page=${page}&limit=10`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });
            setReturns(response.data.data);
            setTotalCount(response.data.count);
        } catch (error) {
            console.error("Failed to fetch return products:", error);
        }
    };

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
    };

    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Return Product List</h2>

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
                                <th className="py-2 px-4 border-b">Return Date</th>
                                <th className="py-2 px-4 border-b">Invoice No</th>
                                <th className="py-2 px-4 border-b">Customer</th>
                                <th className="py-2 px-4 border-b">Part No</th>
                                <th className="py-2 px-4 border-b">Quantity Returned</th>
                                <th className="py-2 px-4 border-b">Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map((returnItem, index) => (
                                <tr key={returnItem.id}>
                                    <td className="py-2 px-4 border-b">{index + 1 + (page - 1) * 10}</td>
                                    <td className="py-2 px-4 border-b">{new Date(returnItem.returnDate).toLocaleDateString('en-GB')}</td>
                                    <td className="py-2 px-4 border-b">{returnItem.sellInvoice.id}</td>
                                    <td className="py-2 px-4 border-b">{returnItem.sellInvoice.customerName}</td>
                                    <td className="py-2 px-4 border-b">{returnItem.product.partNo}</td>
                                    <td className="py-2 px-4 border-b">{returnItem.quantityReturned}</td>
                                    <td className="py-2 px-4 border-b">
                                        {returnItem.reason.length > 20 ? (
                                            <Tippy content={returnItem.reason}>
                                                <span className="cursor-pointer text-blue-500 underline">
                                                    {`${returnItem.reason.slice(0, 20)}...`}
                                                </span>
                                            </Tippy>
                                        ) : (
                                            returnItem.reason
                                        )}
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
            </div>
        </Layout>
    );
}
