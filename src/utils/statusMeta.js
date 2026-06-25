export const getStatusMeta = (status) => {
    const map = {
        draft: {
            label: "Draft",
            color: "#6B7280"
        },
        sent: {
            label: "Sent",
            color: "#2563EB"
        },
        overdue: {
            label: "Overdue",
            color: "#DC2626"
        },
        paid: {
            label: "Paid",
            color: "#16A34A"
        },
        cancelled: {
            label: "Cancelled",
            color: "#4B5563"
        },
        partially_paid: {
            label: "Partially Paid",
            color: "#F59E0B"
        }
    };
    return map[status];
};