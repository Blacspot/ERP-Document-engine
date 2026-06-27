import puppeteer from "puppeteer";

export const generatePdf = async (html) => {
    const browser = await puppeteer.launch({
        headless: true,
    });

    try{
        const page = await browser.newPage();
        await page.setContent(html, {
            waitUntil: "networkidle0",
        });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom:"20mm",
                left:"15mm",
                right:"15mm",
            },
        });
        return pdfBuffer;
    } finally {
        await browser.close();
    }
};