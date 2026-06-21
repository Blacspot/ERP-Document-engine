import supabase from "../config/supabase.js"
import { calculateInvoiceTotals } from "../utils/calculateInvoiceTotals.js";

export const createInvoice = async (invoiceData) => {
    const { items, taxRate = 0, ...invoiceFields} = invoiceData;
    const calculations = calculateInvoiceTotals(items, taxRate);
    const {subtotal, tax, total, items: processedItems} = calculations;
    const { data: invoice, error } = await supabase
         .from("invoices")
         .insert([
            {
                ...invoiceFields,
                subtotal,
                tax,
                total,
            },
         ])
         .select()
         .single();
    if (error) {
       throw new Error(error.message); 
    }     
    let insertedItems = [];
    if(items && items.length > 0) {
        const itemsWithInvoiceId = processedItems.map((item) => ({
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

export const getInvoices = async () => {
    const { data: invoices, error } = await supabase
         .from("invoices")
         .select("*")
         .order("created_at", { ascending: false });
    if (error) {
        throw new Error(error.message);
    }
    
    const invoicesWithDetails = await Promise.all(
        invoices.map(async (invoice) => {
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
        })
    );
    return invoicesWithDetails;
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