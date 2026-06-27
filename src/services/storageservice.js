import supabase from "../config/supabase.js";

export const uploadInvoicePdf = async (
    invoiceNumber,
    pdfBuffer
) => {
    const fileName = `invoices/${invoiceNumber}.pdf`;
    const {error} = await supabase
                     .storage
                     .from("documentapi-bucket")
                     .upload(
                        fileName,
                        pdfBuffer,
                        {
                            contentType: "application/pdf",
                            upsert: true,
                        }
                     );
        if (error) {
            throw new Error(error.message);
        }             
        return fileName;
};