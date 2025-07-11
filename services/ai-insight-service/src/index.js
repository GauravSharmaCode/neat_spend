const express = require("express");
const app = express();
app.use(express.json());

app.post("/get-insight", (req, res) => {
  // Placeholder for Gemini API integration
  res.send("AI insight generated!");
});

const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`AI Insight Service running on port ${PORT}`);
});
