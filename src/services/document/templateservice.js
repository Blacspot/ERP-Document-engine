import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import { getStatusMeta } from "../../utils/statusMeta.js";
import { downloadFile } from "./storageservice.js";

Handlebars.registerHelper(
        "money",
        (value, currency = "KES") => {
            const amount = Number(value || 0);
            return `${currency} ${amount
              .toLocaleString(
                "en-KE",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
              )}`;
        }
    ); 
Handlebars.registerHelper("date", (v) =>
    v ? new Date(v).toLocaleDateString("en-KE", {
        day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
    }) : ""
);
Handlebars.registerHelper("percent", (v) => Number((Number(v || 0) * 100).toFixed(2)));
Handlebars.registerHelper("statusLabel", (s) => getStatusMeta(s)?.label ?? s);
Handlebars.registerHelper("gt", (a, b) => Number(a || 0) > Number(b || 0));
Handlebars.registerHelper("balance", (total, paid) => Number(total || 0) - Number(paid || 0));    
Handlebars.registerHelper("methodLabel", (m) => ({
    cash: "Cash", mpesa: "M-Pesa", bank_transfer: "Bank transfer", card: "Card", cheque: "Cheque",
}[m] ?? m));
export const compileTemplate = async (
    templateName,
    data
) => {
    const templatePath = path.join(
        process.cwd(),
        "src",
        "templates",
        templateName
    );

    const templateSource =
      await fs.readFile(
        templatePath,
        "utf8"
      );
    const template =
       Handlebars.compile(
        templateSource
       );
    const toDataUri = async (key) => {
        if (!key) return null;
        try {
            const { buffer, contentType } = await downloadFile(key);
            return `data:${contentType || "image/png"};base64,${buffer.toString("base64")}`;
        } catch {
            return null;
        }
    };
     
    const sharedCss = await fs.readFile(
         path.join(process.cwd(), "src", "templates", "shared.css"), "utf8"
    ).catch(() => "");
    const ownCss = await fs.readFile(templatePath.replace(/\.hbs$/, ".css"), "utf8").catch(() => "");
    const css = sharedCss + ownCss;

    // Resolve branch image keys (R2 object keys) to inline data URIs so the PDF
    // header logo and signature render correctly instead of broken relative paths.
    if (data?.branch) {
        if (data.branch.logo_url) {
            data.branch.logoDataUri = await toDataUri(data.branch.logo_url);
        }
        if (data.branch.signature_url) {
            data.branch.signatureDataUri = await toDataUri(data.branch.signature_url);
        }
    }

    return template({ ...data, css, toDataUri });
};