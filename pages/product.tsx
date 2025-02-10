import Layout from "../components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import type { Product } from "../interfaces";
import type { AxiosError } from 'axios';

export default function Product() {
    const { data: session, status } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session) {
            // Fetch product list
            axios.get(`http://localhost:3001/products?page=${page}&limit=10`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            }).then(response => {
                setProducts(response.data.data);
                setTotalCount(response.data.count);
            }).catch(error => {
                console.error("Failed to fetch products:", error);
            });
        }
    }, [status, session, page]);

    const handleAddProduct = () => {
        // Navigate to add product page
        router.push("/product/add");
    };

    const handleSearchProduct = () => {
        // Navigate to search product page
        router.push("/product/search");
    };

    const handleEditProduct = (id: string) => {
        // Navigate to edit product page
        router.push(`/product/edit?id=${id}`);
    };

    const handleDeleteProduct = async () => {
        try {
            const response = await axios.delete(`http://localhost:3001/products/${productToDelete}`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            });

            if (response.status === 200) {
                setShowModal(false);
                setShowSuccessModal(true);
                // Remove the deleted product from the state
                setProducts(products.filter(product => product.id !== productToDelete));
            }
        } catch (err: unknown) {
            const error = err as AxiosError;
            if (error.response && error.response.status === 404) {
                alert("Product not found.");
            } else {
                alert("Failed to delete product. Please try again.");
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Products</h2>
                <div>
                    <button
                        onClick={handleAddProduct}
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2"
                    >
                        Add Product
                    </button>
                    <button
                        onClick={handleSearchProduct}
                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                        Search Product
                    </button>
                </div>
            </div>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">#</th>
                        <th className="py-2 px-4 border-b">Part No</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Common Name</th>
                        <th className="py-2 px-4 border-b">Current Stock</th>
                        <th className="py-2 px-4 border-b">Last Purchase Price</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product.id}>
                            <td className="py-2 px-4 border-b">{index + 1 + (page - 1) * 10}</td>
                            <td className="py-2 px-4 border-b">{product.partNo}</td>
                            <td className="py-2 px-4 border-b">{product.name}</td>
                            <td className="py-2 px-4 border-b">{product.commonName}</td>
                            <td className="py-2 px-4 border-b">{product.currentStock}</td>
                            <td className="py-2 px-4 border-b">{product.lastPurchasePrice}</td>
                            <td className="py-2 px-4 border-b">
                                <button
                                    onClick={() => handleEditProduct(product.id)}
                                    className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600 mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setProductToDelete(product.id);
                                        setShowModal(true);
                                    }}
                                    className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
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
                        <p className="mb-4">Are you sure you want to delete this product?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProduct}
                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <h3 className="text-xl font-bold mb-4">Success</h3>
                        <p className="mb-4">Product deleted successfully.</p>
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
        </Layout>
    );
}
