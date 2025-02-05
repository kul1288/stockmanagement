import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    // Mock data for today's sales
    const salesData = {
        totalInvoices: 10,
        totalAmount: 5000,
    };

    res.status(200).json(salesData);
}
