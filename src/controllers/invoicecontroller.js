import { createInvoice as createInvoiceInDB } from "../repositories/invoice.js";
import { generateInvoiceNumber } from "../services/documentnumberservice.js";
import { getInvoiceById } from "../repositories/invoice.js";

export const createInvoice = async (req, res) => {
    try {
        const data = req.body;
        const invoice = await createInvoiceInDB({
            ...data,
            invoice_number: generateInvoiceNumber(),
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}
export const fetchInvoiceById = async (req, res) => {
    try {
        const invoice = await getInvoiceById(req.params.id);
        res.json({success: true, data:invoice});
    } catch (error) {
        res.status(500),json({
            success:false,
            message: error.message,
        });
    }
};