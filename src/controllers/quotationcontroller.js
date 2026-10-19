import {
    createQuotation,
    getQuotations,
    getQuotationById,
    setQuotationStatus,
    deleteQuotation as deleteQuotationInDB,
} from "../repositories/quotation.js";
import { generateQuotationNumber } from "../services/numbering/documentnumberservice.js";
import { generateQuotationDocument } from "../services/document/documentservice.js";
import { compileTemplate } from "../services/document/templateservice.js";

// "expired" is computed from valid_until, so it can't be set manually
const STATUSES = ["draft", "sent", "accepted", "rejected"];

const fail = (res, error) =>
    res.status(500).json({ success: false, message: error.message });

export const addQuotation = async (req, res) => {
    try {
        const quotation = await createQuotation({
            ...req.body,
            quotation_number: generateQuotationNumber(),
        });
        res.status(201).json({ success: true, data: quotation });
    } catch (error) {
        fail(res, error);
    }
};

export const fetchQuotations = async (req, res) => {
    try {
        res.json({ success: true, data: await getQuotations(req.query) });
    } catch (error) {
        fail(res, error);
    }
};

export const fetchQuotationById = async (req, res) => {
    try {
        res.json({ success: true, data: await getQuotationById(req.params.id) });
    } catch (error) {
        fail(res, error);
    }
};

export const updateQuotationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of: ${STATUSES.join(", ")}` });
        }
        res.json({ success: true, data: await setQuotationStatus(req.params.id, status) });
    } catch (error) {
        fail(res, error);
    }
};

export const deleteQuotation = async (req, res) => {
    try {
        res.json({ success: true, ...(await deleteQuotationInDB(req.params.id)) });
    } catch (error) {
        fail(res, error);
    }
};

export const previewQuotation = async (req, res) => {
    try {
        const quotation = await getQuotationById(req.params.id);
        res.send(await compileTemplate("quotation/quotation.hbs", quotation));
    } catch (error) {
        fail(res, error);
    }
};

export const downloadQuotation = async (req, res) => {
    try {
        const quotation = await getQuotationById(req.params.id);
        const document = await generateQuotationDocument(quotation);
        const disposition = req.query.download === "true" ? "attachment" : "inline";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `${disposition}; filename=${quotation.quotation_number}.pdf`);
        res.send(document.pdfBuffer);
    } catch (error) {
        fail(res, error);
    }
};