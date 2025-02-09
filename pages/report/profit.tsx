import Layout from "../../components/Layout";
import { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { FaTimes } from "react-icons/fa";

export default function ProfitReport() {
    const { data: session, status } = useSession();
    const [profitData, setProfitData] = useState(null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");

    const fetchProfitData = async () => {
        let url = `http://localhost:3001/sell-invoices/report/profit`;
        if (startDate) url += `?startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });
            setProfitData(response.data);
            setError("");
        } catch (error) {
            console.error("Failed to fetch profit data:", error);
            if (error.response && error.response.status === 400) {
                setError(error.response.data.message);
            } else {
                setError("Failed to fetch profit data. Please try again.");
            }
        }
    };

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
        setProfitData(null);
        setError("");
    };

    const handleApplyFilters = () => {
        if (!startDate || !endDate) {
            setError("Start date and end date are required.");
            return;
        }
        if (status === "authenticated") {
            fetchProfitData();
        }
    };

    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Profit Report</h2>

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
                    <button
                        onClick={handleApplyFilters}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                    >
                        Apply Filters
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={handleClearFilters}
                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 flex items-center"
                        >
                            <FaTimes className="mr-2" /> Clear Filters
                        </button>
                    )}
                </div>

                {error && <div className="mb-4 text-red-500">{error}</div>}

                {profitData && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4">Profit Details</h3>
                        <p><strong>Total Purchase:</strong> ₹{profitData.totalPurchase.toLocaleString()}</p>
                        <p><strong>Total Sell:</strong> ₹{profitData.totalSell.toLocaleString()}</p>
                        <p><strong>Total Return:</strong> ₹{profitData.totalReturn.toLocaleString()}</p>
                        <p><strong>Total Profit:</strong> ₹{profitData.totalProfit.toLocaleString()}</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
