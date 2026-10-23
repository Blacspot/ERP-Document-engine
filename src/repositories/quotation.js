import supabase from "../config/supabase.js";
import { calculateInvoiceTotals } from "../utils/calculateInvoiceTotals.js";

const FULL_SELECT =
    "*, customer:customers(*), branch:branches(*), items:quotation_items(*)";

// "expired" is computed, never stored
const withComputedStatus = (quotation) => {
    const today = new Date().toISOString().split("T")[0];
    if (quotation.status === "sent" && quotation.valid_until && quotation.valid_until < today) {
        return { ...quotation, status: "expired" };
    }
    return quotation;
};

export const createQuotation = async (quotationData) => {
    const {
        items,
        customer_id,
        branch_id,
        notes,
        quotation_number,
        vat_rate: vatRate = 0,
        vat_inclusive: vatInclusive = false,
        discount = 0,
        shipping = 0,
        currency = "KES",
        issue_date = new Date().toISOString().split("T")[0],
    } = quotationData;

    if (!customer_id) throw new Error("customer_id is required");
    if (!items || items.length === 0) throw new Error("A quotation needs at least one item");

    const valid_until =
        quotationData.valid_until ||
        new Date(new Date(issue_date + "T00:00:00").getTime() + 30 * 86400000)
            .toISOString().split("T")[0];

    const calc = calculateInvoiceTotals({ items, vatRate, vatInclusive, discount, shipping, currency });

    const { data: quotation, error } = await supabase
        .from("quotations")
        .insert([{
            quotation_number,
            customer_id,
            branch_id,
            issue_date,
            valid_until,
            notes,
            subtotal: calc.subtotal,
            tax: calc.tax,
            total: calc.total,
            discount,
            shipping,
            currency,
            vat_rate: vatRate,
            vat_inclusive: vatInclusive,
            status: "draft",
        }])
        .select()
        .single();
    if (error) throw new Error(error.message);

    const { data: insertedItems, error: itemsError } = await supabase
        .from("quotation_items")
        .insert(calc.items.map((item) => ({ ...item, quotation_id: quotation.id })))
        .select();
    if (itemsError) {
        await supabase.from("quotations").delete().eq("id", quotation.id);
        throw new Error(itemsError.message);
    }

    return { ...quotation, items: insertedItems };
};

export const getQuotations = async (filters = {}) => {
    let query = supabase
        .from("quotations")
        .select("*, customer:customers(id, name)")
        .order("created_at", { ascending: false });
    if (filters.customer_id) query = query.eq("customer_id", filters.customer_id);
    if (filters.status && filters.status !== "expired") query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const result = data.map(withComputedStatus);
    return filters.status === "expired" ? result.filter((q) => q.status === "expired") : result;
};

export const getQuotationById = async (id) => {
    const { data, error } = await supabase
        .from("quotations").select(FULL_SELECT).eq("id", id).single();
    if (error) throw new Error(error.message);
    return withComputedStatus(data);
};

export const setQuotationStatus = async (id, status) => {
    const { data, error } = await supabase
        .from("quotations")
        .update({ status, pdf_path: null })
        .eq("id", id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

export const deleteQuotation = async (id) => {
    const { data, error } = await supabase
        .from("quotations").delete().eq("id", id).eq("status", "draft").select();
    if (error) throw new Error(error.message);
    if (!data.length) throw new Error("Only draft quotations can be deleted");
    return { success: true };
};

export const savePdfPath = async (id, pdfPath) => {
    const { data: quotation, error: fetchError } = await supabase
        .from("quotations").select("status").eq("id", id).single();
    if (fetchError) throw new Error(fetchError.message);

    const updatePayload = { pdf_path: pdfPath };
    if (quotation.status === "draft") {
        updatePayload.status = "sent";
    }

    const { data, error } = await supabase
        .from("quotations").update(updatePayload).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data;
};