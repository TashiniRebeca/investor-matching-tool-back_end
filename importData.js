const pool = require("./db");
const ExcelJS = require("exceljs");

const importInvestors = async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("PropTech VCs - Investor Matching.xlsx"); // Ensure this file is inside the backend folder
    const worksheet = workbook.getWorksheet("PropTech VCs"); // First sheet
    if (!worksheet) {
      console.error("No worksheet found! Check the sheet name.");
      return;
    }

    for (let i = 2; i <= worksheet.rowCount; i++) {
      // Skip headers
      const row = worksheet.getRow(i).values;

      console.log(row);

      const name = row[1] || "";
      const sector = row[12] || "";
      const email = row[2] || "";
      const funding_stage = row[13] || "";
      const country = row[5] || "";
      const investment_min = row[7] || 0;
      const investment_max = row[8] || 0;
      const city = row[6] || "";
      const prop_tech = row[11] || false; // Yes/No field
      const tech_medium = row[15] || "";
      const video_link = row[4] || ""; // Video URL

      if (name && sector) {
        // Only insert valid data
        await pool.query(
          `INSERT INTO investors 
                     (name, sector,email, funding_stage, country, investment_min, investment_max, city, prop_tech, tech_medium, video_link) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            name,
            sector,
            email,
            funding_stage,
            country,
            investment_min,
            investment_max,
            city,
            prop_tech,
            tech_medium,
            video_link,
          ]
        );
        console.log(
          `Inserted: ${name}, ${sector}, ${email}, ${funding_stage}, ${country}, ${investment_min}, ${investment_max}, ${city}, ${prop_tech}, ${tech_medium}, ${video_link}`
        );
      } else {
        console.log(`Skipped row ${i} due to missing required data`);
      }
    }
    console.log("Investor Data Imported Successfully!");
  } catch (err) {
    console.error("Error importing data:", err);
  } finally {
    pool.end(); // Close DB connection
  }
};

// Run the import function
importInvestors();
