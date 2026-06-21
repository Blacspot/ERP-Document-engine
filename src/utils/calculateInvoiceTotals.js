export const calculateInvoiceTotals = ({
    items,
    vatRate = 0,
    discount = 0,
    shipping = 0,
    currency = "KES",
    vatInclusive = false,
}) => {
    const processedItems = items.map(
        (item) => {
            const line_total =
              item.quantity * item.rate;
            return {
                ...item,
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
    let taxableAmount = subtotal - discount;
    let tax = 0;
    
    if (vatInclusive) {
        tax = taxableAmount - taxableAmount / (1 + vatRate);
        
    } else {
        tax = taxableAmount * vatRate;
        
    }
    
    const total = taxableAmount + (vatInclusive ? 0 : tax) + shipping;
    return {
        items: processedItems,
        subtotal,
        discount,
        tax,
        shipping,
        total,
    };   
};