import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";

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
     
    
    return template(data);  
};