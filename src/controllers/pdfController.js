import { compileTemplate } from "../services/document/templateservice.js";
import { getInvoiceById } from "../repositories/invoice.js";
import { generateInvoiceDocument } from "../services/document/documentservice.js";
export const previewInvoice = async (req, res) => {
    try {
        const invoice = await getInvoiceById(req.params.id);
        const html = await compileTemplate("invoice/invoice.hbs", invoice); res.send(html);
    } catch (error) {
        res.status(500).json({
            error:
              error.message,
        });
    }
};
export const downloadInvoice = async (req,res) => {
    try {
        const invoice = await getInvoiceById(req.params.id);
        const document = await generateInvoiceDocument(invoice);
        res.setHeader("Content-Type","application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=${invoice.invoice_number}.pdf`);
        res.send(document.pdfBuffer);
    } catch (error) {
        res.status(500).json({
            error:error.message,
        });
    }
};