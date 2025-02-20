const pool = require("./db");
const ExcelJS = require("exceljs");

const importInvestors = async () => {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile("PropTech VCs - Investor Matching.xlsx"); // Make sure the file is in the backend folder
        const worksheet = workbook.getWorksheet("PropTech VCs"); // First sheet
        if (!worksheet) {
            console.error("❌ No worksheet found! Check the sheet name.");
            return;
        }

        for (let i = 2; i <= worksheet.rowCount; i++) {
            // Skip headers
            const row = worksheet.getRow(i).values;

            console.log(row);

            const name = row[1] || null; // Adjust column index based on the Excel file
            const sector = row[12] || null;
            const funding_stage = row[7] || null;
            const country = row[6] || null;

            if (name && sector && funding_stage) {
                // Only insert valid data
                await pool.query(
                    "INSERT INTO investors (name, sector, funding_stage, country) VALUES ($1, $2, $3, $4)",
                    [name, sector, funding_stage, country]
                );
                console.log(
                    `✅ Inserted: ${name}, ${sector}, ${funding_stage}, ${country}`
                );
            } else {
                console.log(`⚠️ Skipped row ${i} due to missing data`);
            }
        }
        console.log("🎉 Investor Data Imported Successfully!");
    } catch (err) {
        console.error("❌ Error importing data:", err);
    } finally {
        pool.end(); // Close DB connection
    }
};

importInvestors();
