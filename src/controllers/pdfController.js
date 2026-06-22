import { compileTemplate } from "../services/templateservice.js";
import { getInvoiceById } from "../repositories/invoice.js";
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