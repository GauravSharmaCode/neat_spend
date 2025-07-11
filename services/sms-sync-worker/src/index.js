const express = require("express");
const app = express();
app.use(express.json());

app.post("/ingest", (req, res) => {
  // Placeholder for SMS ingestion logic
  res.send("SMS received!");
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`SMS Sync Worker running on port ${PORT}`);
});
