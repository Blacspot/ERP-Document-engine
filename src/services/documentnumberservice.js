import { v4 as uuidv4 }
from "uuid";

export const generateInvoiceNumber =
  () => {
    const shortId = uuidv4().split("-")[0].toUpperCase();
    return  `INV-${shortId}`;
  }