import {
    createReceipt,
    getReceipts,
    getReceiptById,
} from "../repositories/receipt.js";
import { generateReceiptNumber } from "../services/numbering/documentnumberservice.js";
import { generateReceiptDocument } from "../services/document/documentservice.js";
import { compileTemplate } from "../services/document/templateservice.js";

const PAYMENT_METHODS = ["cash", "mpesa", "bank_transfer", "card", "cheque"];

const fail = (res, error) =>
    res.status(500).json({ success: false, message: error.message });

// Records a payment against an invoice and issues the receipt
export const addReceipt = async (req, res) => {
    try {
        const { invoice_id, amount, payment_method } = req.body;

        if (!invoice_id) {
            return res.status(400).json({ success: false, message: "invoice_id is required" });
        }
        if (!(Number(amount) > 0)) {
            return res.status(400).json({ success: false, message: "amount must be a number greater than zero" });
        }
        if (!PAYMENT_METHODS.includes(payment_method)) {
            return res.status(400).json({ success: false, message: `payment_method must be one of: ${PAYMENT_METHODS.join(", ")}` });
        }

        const receipt = await createReceipt({
            ...req.body,
            amount: Number(amount),
            receipt_number: generateReceiptNumber(),
        });
        res.status(201).json({ success: true, data: receipt });
    } catch (error) {
        fail(res, error);
    }
};

export const fetchReceipts = async (req, res) => {
    try {
        res.json({ success: true, data: await getReceipts(req.query) });
    } catch (error) {
        fail(res, error);
    }
};

export const fetchReceiptById = async (req, res) => {
    try {
        res.json({ success: true, data: await getReceiptById(req.params.id) });
    } catch (error) {
        fail(res, error);
    }
};

export const previewReceipt = async (req, res) => {
    try {
        const receipt = await getReceiptById(req.params.id);
        res.send(await compileTemplate("receipt/receipt.hbs", receipt));
    } catch (error) {
        fail(res, error);
    }
};

export const downloadReceipt = async (req, res) => {
    try {
        const receipt = await getReceiptById(req.params.id);
        const document = await generateReceiptDocument(receipt);
        const disposition = req.query.download === "true" ? "attachment" : "inline";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `${disposition}; filename=${receipt.receipt_number}.pdf`);
        res.send(document.pdfBuffer);
    } catch (error) {
        fail(res, error);
    }
};