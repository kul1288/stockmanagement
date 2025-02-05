import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useSession } from "next-auth/react";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const [salesData, setSalesData] = useState({ totalInvoices: 0, totalAmountSold: 0 });

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
        { name: 'Total Invoices', value: salesData.totalInvoices },
        { name: 'Total Amount (₹)', value: salesData.totalAmountSold }
    ];

    return (
        <Layout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold">Today's Sales</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Layout>
    );
}
