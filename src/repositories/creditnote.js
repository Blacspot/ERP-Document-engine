import supabase from "../config/supabase.js";
import { calculateInvoiceTotals } from "../utils/calculateInvoiceTotals.js";

const FULL_SELECT =
    "*, customer:customers(*), branch:branches(*), invoice:invoices(invoice_number, issue_date), items:credit_note_items(*)";

export const createCreditNote = async (creditNoteData) => {
    const {
        items,
        invoice_id,
        reason,
        issue_date,
        discount = 0,
        shipping = 0,
        credit_note_number,
    } = creditNoteData;

    if (!invoice_id) throw new Error("invoice_id is required");
    if (!items || items.length === 0) throw new Error("A credit note needs at least one item");

    const { data: invoice, error: invoiceError } = await supabase
        .from("invoices").select("*").eq("id", invoice_id).single();
    if (invoiceError) throw new Error(invoiceError.message);

    if (["draft", "cancelled"].includes(invoice.status)) {
        throw new Error(`Cannot raise a credit note against a ${invoice.status} invoice`);
    }

    // VAT settings default to the invoice's own
    const vatRate = creditNoteData.vat_rate ?? Number(invoice.vat_rate || 0);
    const vatInclusive = creditNoteData.vat_inclusive ?? invoice.vat_inclusive ?? false;

    const calc = calculateInvoiceTotals({
        items, vatRate, vatInclusive, discount, shipping, currency: invoice.currency,
    });

    // Total credited can never exceed the invoice total
    const { data: existing, error: existingError } = await supabase
        .from("credit_notes").select("total")
        .eq("invoice_id", invoice_id).neq("status", "cancelled");
    if (existingError) throw new Error(existingError.message);

    const alreadyCredited = existing.reduce((sum, c) => sum + Number(c.total || 0), 0);
    if (alreadyCredited + calc.total > Number(invoice.total)) {
        throw new Error("Credit notes cannot exceed the invoice total");
    }

    const { data: creditNote, error } = await supabase
        .from("credit_notes")
        .insert([{
            credit_note_number,
            invoice_id,
            customer_id: invoice.customer_id,
            branch_id: invoice.branch_id,
            issue_date,
            reason,
            subtotal: calc.subtotal,
            tax: calc.tax,
            total: calc.total,
            discount,
            shipping,
            currency: invoice.currency,
            vat_rate: vatRate,
            vat_inclusive: vatInclusive,
            status: "draft",
        }])
        .select()
        .single();
    if (error) throw new Error(error.message);

    const { data: insertedItems, error: itemsError } = await supabase
        .from("credit_note_items")
        .insert(calc.items.map((item) => ({ ...item, credit_note_id: creditNote.id })))
        .select();
    if (itemsError) {
        await supabase.from("credit_notes").delete().eq("id", creditNote.id);
        throw new Error(itemsError.message);
    }

    return { ...creditNote, items: insertedItems };
};

export const getCreditNotes = async (filters = {}) => {
    let query = supabase
        .from("credit_notes")
        .select("*, customer:customers(id, name), invoice:invoices(invoice_number)")
        .order("created_at", { ascending: false });
    if (filters.invoice_id) query = query.eq("invoice_id", filters.invoice_id);
    if (filters.status) query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

export const getCreditNoteById = async (id) => {
    const { data, error } = await supabase
        .from("credit_notes").select(FULL_SELECT).eq("id", id).single();
    if (error) throw new Error(error.message);
    return data;
};

// Clears pdf_path so the PDF regenerates with the new status
export const setCreditNoteStatus = async (id, status) => {
    const { data, error } = await supabase
        .from("credit_notes")
        .update({ status, pdf_path: null })
        .eq("id", id)
        .neq("status", "cancelled")
        .select();
    if (error) throw new Error(error.message);
    if (!data.length) throw new Error("Credit note not found or already cancelled");
    return data[0];
};

export const deleteCreditNote = async (id) => {
    const { data, error } = await supabase
        .from("credit_notes").delete().eq("id", id).eq("status", "draft").select();
    if (error) throw new Error(error.message);
    if (!data.length) throw new Error("Only draft credit notes can be deleted");
    return { success: true };
};

export const savePdfPath = async (id, pdfPath) => {
    const { data: creditNote, error: fetchError } = await supabase
        .from("credit_notes").select("status").eq("id", id).single();
    if (fetchError) throw new Error(fetchError.message);

    const updatePayload = { pdf_path: pdfPath };
    if (creditNote.status === "draft") {
        updatePayload.status = "issued";
    }

    const { data, error } = await supabase
        .from("credit_notes").update(updatePayload).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
};