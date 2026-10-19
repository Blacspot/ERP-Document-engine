import {
    createCreditNote,
    getCreditNotes,
    getCreditNoteById,
    setCreditNoteStatus,
    deleteCreditNote as deleteCreditNoteInDB,
} from "../repositories/creditnote.js";
import { generateCreditNoteNumber } from "../services/numbering/documentnumberservice.js";
import { generateCreditNoteDocument } from "../services/document/documentservice.js";
import { compileTemplate } from "../services/document/templateservice.js";

const STATUSES = ["draft", "issued", "cancelled"];

const fail = (res, error) =>
    res.status(500).json({ success: false, message: error.message });

export const addCreditNote = async (req, res) => {
    try {
        const creditNote = await createCreditNote({
            ...req.body,
            credit_note_number: generateCreditNoteNumber(),
        });
        res.status(201).json({ success: true, data: creditNote });
    } catch (error) {
        fail(res, error);
    }
};

export const fetchCreditNotes = async (req, res) => {
    try {
        res.json({ success: true, data: await getCreditNotes(req.query) });
    } catch (error) {
        fail(res, error);
    }
};

export const fetchCreditNoteById = async (req, res) => {
    try {
        res.json({ success: true, data: await getCreditNoteById(req.params.id) });
    } catch (error) {
        fail(res, error);
    }
};

export const updateCreditNoteStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of: ${STATUSES.join(", ")}` });
        }
        res.json({ success: true, data: await setCreditNoteStatus(req.params.id, status) });
    } catch (error) {
        fail(res, error);
    }
};

export const deleteCreditNote = async (req, res) => {
    try {
        res.json({ success: true, ...(await deleteCreditNoteInDB(req.params.id)) });
    } catch (error) {
        fail(res, error);
    }
};

export const previewCreditNote = async (req, res) => {
    try {
        const creditNote = await getCreditNoteById(req.params.id);
        res.send(await compileTemplate("credit-note/credit-note.hbs", creditNote));
    } catch (error) {
        fail(res, error);
    }
};

// ?download=true forces a file download instead of opening in the browser
export const downloadCreditNote = async (req, res) => {
    try {
        const creditNote = await getCreditNoteById(req.params.id);
        const document = await generateCreditNoteDocument(creditNote);
        const disposition = req.query.download === "true" ? "attachment" : "inline";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `${disposition}; filename=${creditNote.credit_note_number}.pdf`);
        res.send(document.pdfBuffer);
    } catch (error) {
        fail(res, error);
    }
};