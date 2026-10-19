import { compileTemplate } from "./templateservice.js";
import { generatePdf } from "./pdfservice.js";
import { uploadPdf, downloadPdf } from "./storageservice.js";
import { savePdfPath as saveInvoicePdfPath } from "../../repositories/invoice.js";
import { savePdfPath as saveCreditNotePdfPath } from "../../repositories/creditnote.js";
import { savePdfPath as saveQuotationPdfPath } from "../../repositories/quotation.js";
import { savePdfPath as saveReceiptPdfPath } from "../../repositories/receipt.js";

// One implementation, four document types.
const generateDocument = async ({ doc, template, folder, numberField, savePath }) => {
    // Already generated: return the stored PDF
    if (doc.pdf_path) {
        const pdfBuffer = await downloadPdf(doc.pdf_path);
        return { pdfBuffer, pdfPath: doc.pdf_path, alreadyGenerated: true };
    }

    const html = await compileTemplate(template, doc);
    const pdfBuffer = await generatePdf(html);
    const filePath = `${folder}/${doc.id}-${doc[numberField]}.pdf`;

    await uploadPdf(filePath, pdfBuffer);
    await savePath(doc.id, filePath);

    return { pdfBuffer, pdfPath: filePath, alreadyGenerated: false };
};

export const generateInvoiceDocument = (invoice) =>
    generateDocument({
        doc: invoice,
        template: "invoice/invoice.hbs",
        folder: "invoices",
        numberField: "invoice_number",
        savePath: saveInvoicePdfPath,
    });

export const generateCreditNoteDocument = (creditNote) =>
    generateDocument({
        doc: creditNote,
        template: "credit-note/credit-note.hbs",
        folder: "credit-notes",
        numberField: "credit_note_number",
        savePath: saveCreditNotePdfPath,
    });

export const generateQuotationDocument = (quotation) =>
    generateDocument({
        doc: quotation,
        template: "quotation/quotation.hbs",
        folder: "quotations",
        numberField: "quotation_number",
        savePath: saveQuotationPdfPath,
    });

export const generateReceiptDocument = (receipt) =>
    generateDocument({
        doc: receipt,
        template: "receipt/receipt.hbs",
        folder: "receipts",
        numberField: "receipt_number",
        savePath: saveReceiptPdfPath,
    });