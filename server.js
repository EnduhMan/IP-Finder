const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors"); // Import the cors package
const app = express();

// Use the port provided by Render or default to 3000 for local development
const port = process.env.PORT || 3000;

// The password to protect your logs.
// IMPORTANT: Set this in your hosting environment, not directly in the code.
const LOGS_PASSWORD = process.env.LOGS_PASSWORD || "your_secret_password";

// Ensure data.txt exists
const filePath = path.join(__dirname, "data.txt");
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "");
}

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static(__dirname));

// Endpoint for logging the IP after user consent
app.post("/log-ip", (req, res) => {
  const ip = req.body.ip;
  if (ip) {
    const logEntry = `${new Date().toISOString()} - ${ip}\n`;
    fs.appendFile(filePath, logEntry, (err) => {
      if (err) {
        console.error("Error logging IP:", err);
        return res.status(500).send("Error logging IP.");
      }
      res.status(200).send("IP logged successfully.");
    });
  } else {
    res.status(400).send("No IP provided.");
  }
});

// New endpoint to view logs with password protection
app.get("/get-logs", (req, res) => {
  if (req.query.password === LOGS_PASSWORD) {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).send("Could not read logs.");
      }
      res.header("Content-Type", "text/plain").send(data);
    });
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});