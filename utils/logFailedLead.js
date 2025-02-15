import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const logFailedVisionEmail = (emailData) => {
  try {
    const filePath = path.join(__dirname, "failed_emails.json");

    let failedEmails = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      failedEmails = fileContent ? JSON.parse(fileContent) : [];
    }

    failedEmails.push(emailData);
    fs.writeFileSync(filePath, JSON.stringify(failedEmails, null, 2));

    console.log("Failed email logged successfully.");
  } catch (error) {
    console.error("Error logging failed email:");
  }
};
