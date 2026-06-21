import { createInvoice as createInvoiceInDB, getInvoices, getInvoiceById, deleteInvoice as deleteInvoiceInDB } from "../repositories/invoice.js";
import { generateInvoiceNumber } from "../services/documentnumberservice.js";

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
export const fetchInvoices = async(req, res) => {
    try {
        const invoices = await getInvoices();
        res.json({success: true, data: invoices});
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
        });
    }
};
export const fetchInvoiceById = async (req, res) => {
    try {
        const invoice = await getInvoiceById(req.params.id);
        res.json({success: true, data:invoice});
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
        });
    }
};
export const deleteInvoice = async (req, res) => {
    try {
        const result = await deleteInvoiceInDB(req.params.id);
        res.json({success: true, ...result});
    } catch (error) {
        res.status(500).json({
            success:false,
            message: error.message,
        });
    }
};