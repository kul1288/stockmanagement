import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FaFileInvoiceDollar, FaRupeeSign, FaExclamationTriangle, FaCreditCard } from "react-icons/fa";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [salesData, setSalesData] = useState({ totalInvoices: 0, totalAmountSold: 0 });
    const [lowStockCount, setLowStockCount] = useState(0);
    const [creditSales, setCreditSales] = useState(0);

    useEffect(() => {
        if (status === "authenticated") {
            Promise.all([
                axios.get("http://localhost:3001/sell-invoices/report/todaysale", {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                }),
                axios.get("http://localhost:3001/products/low-stock/count", {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                }),
                axios.get("http://localhost:3001/sell-invoices/report/today-credit-sales", {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                })
            ]).then(([salesResponse, lowStockResponse, creditResponse]) => {
                setSalesData(salesResponse.data);
                setLowStockCount(lowStockResponse.data.count);
                setCreditSales(creditResponse.data.totalCreditSales);
            }).catch(error => {
                console.error("Failed to fetch dashboard data:", error);
            });
        }
    }, [status, session]);

    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Changed from lg:grid-cols-4 to md:grid-cols-2 */}
                    {/* Total Invoices Card */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm uppercase tracking-wider mb-1">Total Invoices</p>
                                <h3 className="text-white text-4xl font-bold">
                                    {salesData.totalInvoices}
                                </h3>
                                <p className="text-blue-100 mt-2">Generated Today</p>
                            </div>
                            <div className="bg-blue-400 rounded-full p-4">
                                <FaFileInvoiceDollar className="text-white text-3xl" />
                            </div>
                        </div>
                        <div className="mt-4 border-t border-blue-400 pt-4">
                            <p className="text-blue-100 text-sm">
                                All invoices generated for {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Total Amount Card */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm uppercase tracking-wider mb-1">Total Amount</p>
                                <h3 className="text-white text-4xl font-bold">
                                    ₹{salesData.totalAmountSold.toLocaleString()}
                                </h3>
                                <p className="text-green-100 mt-2">Sales Today</p>
                            </div>
                            <div className="bg-green-400 rounded-full p-4">
                                <FaRupeeSign className="text-white text-3xl" />
                            </div>
                        </div>
                        <div className="mt-4 border-t border-green-400 pt-4">
                            <p className="text-green-100 text-sm">
                                Total revenue generated for {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Credit Sales Card */}
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm uppercase tracking-wider mb-1">Credit Sales</p>
                                <h3 className="text-white text-4xl font-bold">
                                    ₹{creditSales.toLocaleString()}
                                </h3>
                                <p className="text-purple-100 mt-2">Today&apos;s Credit</p>
                            </div>
                            <div className="bg-purple-400 rounded-full p-4">
                                <FaCreditCard className="text-white text-3xl" />
                            </div>
                        </div>
                        <div className="mt-4 border-t border-purple-400 pt-4">
                            <p className="text-purple-100 text-sm">
                                Credit sales for {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Low Stock Alert Card */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm uppercase tracking-wider mb-1">Low Stock Alert</p>
                                <h3 className="text-white text-4xl font-bold">
                                    {lowStockCount}
                                </h3>
                                <p className="text-red-100 mt-2">Products Below Minimum</p>
                            </div>
                            <div className="bg-red-400 rounded-full p-4">
                                <FaExclamationTriangle className="text-white text-3xl" />
                            </div>
                        </div>
                        <div className="mt-4 border-t border-red-400 pt-4">
                            <p className="text-red-100 text-sm">
                                {lowStockCount} products need attention
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
