export const calculateInvoiceTotals = (
    items,
    taxRate = 0
) => {
    const processedItems = items.map(
        (items) => {
            const line_total =
              items.quantity * items.rate;
            return {
                ...items,
                line_total,
            };  
        }
    );
    const subtotal =
       processedItems.reduce(
        (sum, item) => 
            sum + item.line_total,
        0
       );
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return {
        items: processedItems,
        subtotal,
        tax,
        total,
    };   
};