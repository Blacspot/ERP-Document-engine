import supabase from "../config/supabase.js";
import { markInvoicePartiallyPaid } from "./invoice.js";

const FULL_SELECT =
    "*, customer:customers(*), branch:branches(*), invoice:invoices(invoice_number, total, currency)";

// Records the payment on the invoice AND issues the receipt.
export const createReceipt = async (receiptData) => {
    const { invoice_id, amount, payment_method, reference, payment_date, notes, receipt_number } = receiptData;

    const { data: before, error: fetchError } = await supabase
        .from("invoices").select("*").eq("id", invoice_id).single();
    if (fetchError) throw new Error(fetchError.message);

    const amountBefore = Number(before.amount_paid || 0);

    // Throws if the invoice is paid/cancelled or the amount is invalid
    const updated = await markInvoicePartiallyPaid(invoice_id, amount);

    // The invoice caps overpayments, so record what was actually applied
    const applied = Number(updated.amount_paid) - amountBefore;

    const { data, error } = await supabase
        .from("receipts")
        .insert([{
            receipt_number,
            invoice_id,
            customer_id: before.customer_id,
            branch_id: before.branch_id,
            amount: applied,
            balance_after: Number(updated.balance),
            currency: before.currency,
            payment_method,
            reference,
            payment_date,
            notes,
        }])
        .select()
        .single();

    if (error) {
        // Undo the payment so the invoice and receipts never disagree
        await supabase
            .from("invoices")
            .update({ amount_paid: amountBefore, status: before.status })
            .eq("id", invoice_id);
        throw new Error(error.message);
    }

    // The cached invoice PDF now shows an old status/balance: force a regenerate
    await supabase.from("invoices").update({ pdf_path: null }).eq("id", invoice_id);

    return data;
};

export const getReceipts = async (filters = {}) => {
    let query = supabase
        .from("receipts")
        .select("*, customer:customers(id, name), invoice:invoices(invoice_number)")
        .order("created_at", { ascending: false });
    if (filters.invoice_id) query = query.eq("invoice_id", filters.invoice_id);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

export const getReceiptById = async (id) => {
    const { data, error } = await supabase
        .from("receipts").select(FULL_SELECT).eq("id", id).single();
    if (error) throw new Error(error.message);
    return data;
};

export const savePdfPath = async (id, pdfPath) => {
    const { data, error } = await supabase
        .from("receipts").update({ pdf_path: pdfPath }).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
};