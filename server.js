const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(express.json()); // Ensure JSON requests/responses work
app.use(cors()); // Allow frontend to access API

app.get("/api/investor-options", async (req, res) => {
    try {
        console.log("🔄 Fetching investor options...");

        // Fetch unique values from the database
        const sectorsResult = await pool.query("SELECT DISTINCT sector FROM investors WHERE sector IS NOT NULL");
        const fundingStagesResult = await pool.query("SELECT DISTINCT funding_stage FROM investors WHERE funding_stage IS NOT NULL");
        const countriesResult = await pool.query("SELECT DISTINCT country FROM investors WHERE country IS NOT NULL");

        // Extract values from rows
        const sectors = sectorsResult.rows.map(row => row.sector).filter(Boolean);
        const fundingStages = fundingStagesResult.rows.map(row => row.funding_stage).filter(Boolean);
        const countries = countriesResult.rows.map(row => row.country).filter(Boolean);

        console.log("✅ Successfully fetched options:", { sectors, fundingStages, countries });

        // Send response
        res.json({ sectors, fundingStages, countries });

    } catch (err) {
        console.error("❌ Error fetching investor options:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch all investors
app.get("/investors", async (req, res) => {
    try {
        const investors = await pool.query("SELECT * FROM investors");
        res.json(investors.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Search & Filter Investors
app.get("/investors/search", async (req, res) => {
    const { sector, funding_stage } = req.query;

    try {
        const query = `
  SELECT * FROM investors
  WHERE ($1::TEXT IS NULL OR sector = $1::TEXT)
  AND ($2::TEXT IS NULL OR funding_stage = $2::TEXT)
`;
        const values = [sector || null, funding_stage || null];

        const investors = await pool.query(query, values);
        res.json(investors.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
