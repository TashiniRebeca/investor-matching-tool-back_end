const express = require("express");
const cors = require("cors");
const pool = require("./db");
const path = require("path");
const xlsx = require("xlsx");

const backendURL = process.env.BACKEND_URL || "http://localhost:5000";

const frontendURL =
  process.env.FRONTEND_URL?.replace(/\/$/, "") ||
  "https://investor-matching-tool-f-e.vercel.app";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: frontendURL,
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies if needed
    optionsSuccessStatus: 200,
  })
);

const investorsFilePath = path.join(
  __dirname,
  "PropTech VCs - Investor Matching.xlsx"
);

//Fetch unique dropdown options for frontend
app.get("/api/investor-options", async (req, res) => {
  try {
    const sectors = await pool.query(
      "SELECT DISTINCT sector FROM investors WHERE sector IS NOT NULL"
    );
    const geographies = await pool.query(
      "SELECT DISTINCT country FROM investors WHERE country IS NOT NULL"
    );
    const seriesStages = await pool.query(
      "SELECT DISTINCT funding_stage FROM investors WHERE funding_stage IS NOT NULL"
    );
    const cities = await pool.query(
      "SELECT DISTINCT city FROM investors WHERE city IS NOT NULL"
    );
    const techMediums = await pool.query(
      "SELECT DISTINCT tech_medium FROM investors WHERE tech_medium IS NOT NULL"
    );
    const propTechOptions = await pool.query(
      "SELECT DISTINCT prop_tech FROM investors WHERE prop_tech IS NOT NULL"
    );

    res.json({
      sectors: sectors.rows.map((row) => row.sector),
      geographies: geographies.rows.map((row) => row.country),
      seriesStages: seriesStages.rows.map((row) => row.funding_stage),
      cities: cities.rows.map((row) => row.city),
      techMediums: techMediums.rows.map((row) => row.tech_medium),
      propTechOptions: propTechOptions.rows.map((row) => row.prop_tech),
    });
  } catch (err) {
    console.error("Error fetching investor options:", err);
    res.status(500).send("Server Error");
  }
});

// Search Investors (Normal & Advanced)
app.get("/api/investors/search", async (req, res) => {
  try {
    const {
      sector,
      geography,
      investmentMin,
      investmentMax,
      series,
      city,
      propTech,
      techMedium,
      isAdvanced,
    } = req.query;

    let query = "SELECT * FROM investors WHERE 1=1";
    let params = [];
    let paramIndex = 1;

    // Normal Search Criteria
    if (sector) {
      query += ` AND sector = $${paramIndex++}`;
      params.push(sector);
    }
    if (geography) {
      query += ` AND country = $${paramIndex++}`;
      params.push(geography);
    }
    if (investmentMin) {
      query += ` AND investment_min >= $${paramIndex++}`;
      params.push(investmentMin);
    }
    if (investmentMax) {
      query += ` AND investment_max <= $${paramIndex++}`;
      params.push(investmentMax);
    }
    if (series) {
      query += ` AND funding_stage = $${paramIndex++}`;
      params.push(series);
    }

    // Advanced Search Criteria
    if (isAdvanced === "true") {
      if (city) {
        query += ` AND city = $${paramIndex++}`;
        params.push(city);
      }
      if (propTech) {
        query += ` AND prop_tech = $${paramIndex++}`;
        params.push(propTech);
      }
      if (techMedium) {
        query += ` AND tech_medium ILIKE $${paramIndex++}`;
        params.push(`%${techMedium}%`);
      }
    }

    const investors = await pool.query(query, params);
    res.json(investors.rows);
  } catch (err) {
    console.error("Error searching investors:", err);
    res.status(500).send("Server Error");
  }
});

// API Endpoint to search investors via manual search
app.get("/api/searchInvestors", async (req, res) => {
  try {
    const { sector } = req.query;
    if (!sector) return res.status(400).json({ error: "Sector is required" });

    // Read the Excel file
    const workbook = xlsx.readFile(investorsFilePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Filter investors by sector
    const results = data.filter((investor) =>
      investor.Sector?.toLowerCase().includes(sector.toLowerCase())
    );

    res.json(results);
  } catch (error) {
    console.error("Error searching investors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/manual-search", async (req, res) => {
  try {
    const { sector } = req.query;
    if (!sector) {
      return res.status(400).json({ error: "Sector is required" });
    }

    // Case-insensitive search in the database
    const query = `
      SELECT * FROM investors 
      WHERE LOWER(sector) LIKE LOWER($1)
    `;
    const investors = await pool.query(query, [`%${sector}%`]);

    res.json(investors.rows);
  } catch (error) {
    console.error("Error fetching manual search results:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
module.exports = app;
