export const calculateInvoiceStatus = (invoice) => {
    const today = new Date();

    // Never touch these
    if (
        invoice.status === "cancelled" ||
        invoice.status === "paid"
    ) {
        return invoice.status;
    }

    // Payment overrides sent
    if (
        Number(invoice.amount_paid || 0) > 0 &&
        Number(invoice.amount_paid) < Number(invoice.total)
    ) {
        return "partially_paid";
    }

    if (
        Number(invoice.amount_paid || 0) >= Number(invoice.total)
    ) {
        return "paid";
    }

    // Draft invoices stay drafts
    if (invoice.status === "draft") {
        return "draft";
    }

    // Due date passed
    if (
        invoice.status === "sent" &&
        new Date(invoice.due_date) < today
    ) {
        return "overdue";
    }

    return invoice.status;
};