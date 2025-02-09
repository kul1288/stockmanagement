import Layout from "../components/Layout";
import { useRouter } from "next/router";
import { FaChartLine } from "react-icons/fa";

export default function Report() {
    const router = useRouter();

    const handleProfitReportClick = () => {
        router.push("/report/profit");
    };

    return (
        <Layout>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                        className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105"
                        onClick={handleProfitReportClick}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm uppercase tracking-wider mb-1">Profit Report</p>
                                <h3 className="text-white text-4xl font-bold">View</h3>
                                <p className="text-green-100 mt-2">Details</p>
                            </div>
                            <div className="bg-green-400 rounded-full p-4">
                                <FaChartLine className="text-white text-3xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
