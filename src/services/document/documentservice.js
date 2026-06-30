import { compileTemplate } from "./templateservice.js";
import { generatePdf } from "./pdfservice.js";
import { uploadPdf, downloadPdf } from "./storageservice.js";
import { savePdfPath } from "../../repositories/invoice.js";

export const generateInvoiceDocument = async (
    invoice
) => {
    if (invoice.pdf_path) {
        const pdfBuffer = await downloadPdf(invoice.pdf_path);
        return{
            pdfBuffer,
            pdfPath:invoice.pdf_path,
            alreadyGenerated: true,
        };
    }
   const html = await compileTemplate(
    "invoice/invoice.hbs",
    invoice
   );
   const pdfBuffer = await generatePdf(html);
   const filePath = `invoices/${invoice.id}-${invoice.invoice_number}.pdf`;
   await uploadPdf(filePath, pdfBuffer);
   await savePdfPath(invoice.id, filePath);

return{
    pdfBuffer, pdfPath: filePath, alreadyGenerated: false,
};
};
