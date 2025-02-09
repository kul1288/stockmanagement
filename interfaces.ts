export interface Product {
    id: string;
    partNo: string;
    name: string;
    unit: string;
    currentStock: number;
    minimumQuantity?: number;
    lastPurchasePrice: number;
    // Add other properties as needed
}
