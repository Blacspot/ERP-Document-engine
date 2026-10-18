import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import { getStatusMeta } from "../../utils/statusMeta.js";

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
     
    const cssPath = templatePath.replace(/\.hbs$/, ".css");
    const css = await fs.readFile(cssPath, "utf8").catch(() => "");
    return template({ ...data, css }); 
};