import Invoice from "../repositories/invoice.js";
import { generateInvoiceNumber } from "../services/documentnumberservice.js";

export const createInvoice = async (req, res) => {
    try {
        const data = req.body;

        const invoice = await Invoice.create({
            ...data,
            invoiceNumber:
                generateInvoiceNumber(),
        });
        res.status(201).json(
            invoice
        );
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};
