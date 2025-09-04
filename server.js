const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
const LOGS_PASSWORD = process.env.LOGS_PASSWORD || "default_password";

// Create data.txt if it doesn't exist
const filePath = path.join(__dirname, "data.txt");
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "");
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Routes
app.post("/log-ip", (req, res) => {
  const ip = req.body.ip;
  if (ip) {
    const logEntry = `${new Date().toISOString()} - ${ip}\n`;
    fs.appendFile(filePath, logEntry, (err) => {
      if (err) {
        return res.status(500).send("Error logging IP.");
      }
      res.status(200).send("IP logged successfully.");
    });
  } else {
    res.status(400).send("No IP provided.");
  }
});

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

app.get("/", (req, res) => {
  res.send("IP Finder Server is Running!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
