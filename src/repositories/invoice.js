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
            await supabase
                 .from("invoices")
                 .delete()
                 .eq("id", invoice.id);

            throw new Error(itemsError.message);
        }     
        insertedItems = data;
    }
    return { ...invoice, items: insertedItems};
};

export const getInvoiceById = async (id) => {
    const { data: invoice, error } = await supabase
         .from("invoices")
         .select("*")
         .eq("id", id)
         .single();
    if (error) {
        throw new Error(error.message);
    }     
    const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("id", invoice.customer_id)
        .single();
    const { data: items } = await supabase
         .from("invoice_items")
         .select("*")
         .eq("invoice_id", invoice.id);
    return {
        ...invoice,
        customer,
        items,
    };         
};