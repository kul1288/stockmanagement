export interface Product {
    id: string;
    partNo: string;
    name: string;
    commonName: string;
    unit: string;
    currentStock: number;
    minimumQuantity?: number;
    lastPurchasePrice: number;
    // Add other properties as needed
}

export interface InvoiceProduct {
    product: Product;
    quantity: number;
    returnedQuantity: number;
    rate: number;
    discount: number;
}

export interface Invoice {
    id: string;
    sellDate: string;
    customerName: string;
    type: string;
    products: InvoiceProduct[];
    // Add other invoice properties as needed
}
