import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";
import { useSession } from "next-auth/react";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [salesData, setSalesData] = useState({ totalInvoices: 0, totalAmountSold: 0 });
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (status === "authenticated") {
            // Fetch today's sales data
            axios.get("http://localhost:3001/sell-invoices/report/todaysale", {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }).then(response => {
                setSalesData(response.data);
            }).catch(error => {
                console.error("Failed to fetch sales data:", error);
            });
        }
    }, [status, session]);

    const data = [
        {
            name: 'Total Invoices',
            value: salesData.totalInvoices,
            color: '#8884d8'
        },
        {
            name: 'Total Amount (₹)',
            value: salesData.totalAmountSold,
            color: '#82ca9d'
        }
    ];

    const handleBarClick = (data, index) => {
        setActiveIndex(index);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded shadow-lg">
                    <p className="font-bold text-gray-700">{label}</p>
                    <p className="text-blue-600">
                        {label === 'Total Amount (₹)' ?
                            `₹${payload[0].value.toLocaleString()}` :
                            payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Layout>
            <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Today's Sales Overview</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#666' }}
                            axisLine={{ stroke: '#ccc' }}
                        />
                        <YAxis
                            tick={{ fill: '#666' }}
                            axisLine={{ stroke: '#ccc' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{
                                paddingTop: "20px"
                            }}
                        />
                        <Bar
                            dataKey="value"
                            onClick={handleBarClick}
                            animationBegin={0}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    cursor="pointer"
                                    fill={index === activeIndex ? '#ff7300' : entry.color}
                                    key={`cell-${index}`}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    {data.map((item, index) => (
                        <div
                            key={item.name}
                            className={`p-4 rounded-lg ${index === activeIndex
                                    ? 'bg-orange-100 border-2 border-orange-500'
                                    : 'bg-gray-50'
                                }`}
                        >
                            <h3 className="text-lg font-semibold text-gray-700">{item.name}</h3>
                            <p className="text-2xl font-bold text-blue-600">
                                {item.name === 'Total Amount (₹)'
                                    ? `₹${item.value.toLocaleString()}`
                                    : item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
