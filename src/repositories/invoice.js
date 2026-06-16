import supabase from "../config/supabase.js"

export const createInvoice = async (invoiceData) => {
    const { items, ...invoiceFields } = invoiceData;
    const { data: invoice, error } = await supabase
         .from("invoices")
         .insert([invoiceFields])
         .select()
         .single();
    if (error) {
       throw new Error(error.message); 
    }     
    let insertedItems = [];
    if(items && items.length > 0) {
        const itemsWithInvoiceId = items.map((item) => ({
            ...item,
            invoice_id: invoice.id,
        }));
        const {data, error: itemsError } = await supabase 
             .from("invoice_items")
             .insert(itemsWithInvoiceId)
             .select();
        if (itemsError) {
            throw new Error(itemsError.message);
        }     
        insertedItems = data;
    }
    return { ...invoice, items: insertedItems};
};