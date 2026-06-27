import supabase from "../config/supabase.js"
import { calculateInvoiceTotals } from "../utils/calculateInvoiceTotals.js";

export const createInvoice = async (invoiceData) => {
    const today = new Date().toISOString().split("T")[0];
    const { items, status, vat_rate: vatRate = 0, vat_inclusive: vatInclusive = false, issue_date = today, due_date, ...invoiceFields } = invoiceData;

    const invoicePayload = {
        ...invoiceFields,
        status: "draft",
        vat_rate: vatRate,
        vat_inclusive: vatInclusive,
        issue_date,
        due_date: due_date || new Date(new Date(issue_date + 'T00:00:00').getTime() + 30 * 86400000).toISOString().split("T")[0],
    };

    const calculations = calculateInvoiceTotals({
         items,
         vatRate,
         vatInclusive,
         discount: invoiceFields.discount ?? 0,
         shipping: invoiceFields.shipping ?? 0,
         currency: invoiceFields.currency ?? "KES",
        });
    const {subtotal, tax, total, items: processedItems} = calculations;
    const { data: invoice, error } = await supabase
         .from("invoices")
          .insert([
             {
                 ...invoicePayload,
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

export const deleteInvoice = async (id) => {
    const { error } = await supabase
         .from("invoices")
         .delete()
         .eq("id", id);
     if (error) {
        throw new Error(error.message); 
     }     
     return { success: true };
};

export const updateInvoice = async (id, invoiceData) => {
    const { items, vat_rate: vatRate = 0, vat_inclusive: vatInclusive = false, ...invoiceFields } = invoiceData;

    let calculations = null;
    if (items && items.length > 0) {
        calculations = calculateInvoiceTotals({
            items,
            vatRate,
            vatInclusive,
            discount: invoiceFields.discount ?? 0,
            shipping: invoiceFields.shipping ?? 0,
            currency: invoiceFields.currency ?? "KES",
        });
    }

    const updatePayload = {
        ...invoiceFields,
        ...(calculations
            ? { subtotal: calculations.subtotal, tax: calculations.tax, total: calculations.total }
            : {}),
        vat_rate: vatRate,
        vat_inclusive: vatInclusive,
    };

    const { data: invoice, error } = await supabase
         .from("invoices")
         .update(updatePayload)
         .eq("id", id)
         .select()
         .single();
    if (error) {
        throw new Error(error.message); 
    }

    if (invoice.amount_paid > updatePayload.total) {
        throw new Error(
            "Invoice total cannot be less than amount already paid"
        )
    }

    let updatedItems = [];
    if (items && items.length > 0 && calculations) {
        await supabase
             .from("invoice_items")
             .delete()
             .eq("invoice_id", id);

        const { data, error: itemsError } = await supabase
             .from("invoice_items")
             .insert(calculations.items.map(item => ({ ...item, invoice_id: id })))
             .select();
        if (itemsError) {
            throw new Error(itemsError.message);
        }
        updatedItems = data;
    } else {
        const { data: existingItems } = await supabase
             .from("invoice_items")
             .select("*")
             .eq("invoice_id", id);
        updatedItems = existingItems || [];
    }
    return { ...invoice, items: updatedItems };
};

export const searchInvoices = async (filters = {}) => {
    const { data, error } = await supabase.rpc('search_invoices', {
        p_search: filters.q || null,
        p_customer_id: filters.customer_id || null,
        p_status: filters.status || null,
        p_date_from: filters.date_from || null,
        p_date_to: filters.date_to || null,
        p_min_total: filters.min_total !== undefined && filters.min_total !== "" ? parseFloat(filters.min_total) : null,
        p_max_total: filters.max_total !== undefined && filters.max_total !== "" ? parseFloat(filters.max_total) : null,
        p_vat_inclusive: filters.vat_inclusive !== undefined && filters.vat_inclusive !== "" ? String(filters.vat_inclusive).toLowerCase() === "true" : null,
        p_page: parseInt(filters.page) || 1,
        p_page_size: parseInt(filters.limit) || 20,
    });
    if (error) {
        throw new Error(error.message);
    }
    const totalCount = data?.[0]?.total_count || 0;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    return {
        data: data || [],
        meta: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
    };
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
            const today = new Date();
            const dueDate = new Date(invoice.due_date);
            let computedStatus = invoice.status;
            if(
                invoice.status === "sent" && dueDate < today
            )  {
                computedStatus = "overdue";
            }  
            return {
                ...invoice,
                status: computedStatus,
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
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    let computedStatus = invoice.status;
    if (
        invoice.status === "sent" && dueDate < today
    ) {
        computedStatus = "overdue";
    }    
    return {
        ...invoice,
        status: computedStatus,
        customer,
        items,
    };         
};

export const cancelInvoice = async (id) => {
    const { data, error } = await supabase
        .from("invoices")
        .update({
            status: "cancelled"
        })
        .eq("id", id)
        .neq("status","paid")
        .select()
        .single();
    if (error) {
        throw new Error(error.message);
    }    
    return data;

};
export const markInvoicePaid = async (id) => {
    const {data, error} = await supabase
        .from("invoices")
        .update({status: "paid"})
        .eq("id", id)
        .neq("status", "cancelled")
        .select()
        .single();
    if (error) {
        throw new Error(error.message);
    }    
    return data;
};
export const markInvoicePartiallyPaid = async (
    id,
    amountPaid
) => {
    const { data: invoice, error: fetchError } = await supabase
           .from("invoices")
           .select("*")
           .eq("id", id)
           .single();
    if (fetchError) {
        throw new Error(fetchError.message);
    } 
    if (invoice.status === "paid") {
        throw new Error(
            "Invoice is already paid"
        );
    }
    if ( invoice.status === "cancelled"){
        throw new Error(
            "Cannot pay a cancelled invoice"
        );
    }      
    const newAmountPaid = Number(invoice.amount_paid || 0) + Number(amountPaid);
    if (amountPaid <= 0) {
        throw new Error(
            "Payment amount must be greater than zero"
        );
    }
    const cappedAmountPaid = Math.min(
        newAmountPaid,
        invoice.total
    ); 
    const status = cappedAmountPaid >= invoice.total
     ? "paid" 
     : "partially_paid";
    
    const {data, error } = await supabase 
           .from("invoices")
           .update({
               amount_paid:cappedAmountPaid,
               status,
           })
           .eq("id", id)
           .select()
           .single();
    if (error) {
        throw new Error(error.message);
    }       
    return { ...data, balance: data.total - data.amount_paid};
}
export const savePdfPath = async (id, pdfPath) => {
    const {data, error} = await supabase
         .from("invoices")
         .update({
            pdf_path: pdfPath,
            status: "sent",
         })
         .eq("id", id)
         .select()
         .single();
     if (error) {
        throw new Error(error.message);
     }    
     return data;
};