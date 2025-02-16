require("dotenv").config();
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { execSync } = require("child_process");

const app = express();

app.use(cors());

const PORT = 3001;
const PID_FILE = process.env.PID_FILE;

const isProcessRunning = (pid) => {
  try {
    return execSync(`ps -p ${pid} -o comm=`).toString().trim().length > 0;
  } catch {
    return false;
  }
};

app.get("/status", (req, res) => {
  if (!PID_FILE || !fs.existsSync(PID_FILE)) return res.json({ running: false, message: "PID file not found" });

  const pid = fs.readFileSync(PID_FILE, "utf8").trim();
  if (!pid || isNaN(pid)) return res.json({ running: false, message: "Invalid PID in file" });

  const running = isProcessRunning(pid);
  res.json({ running, pid: running ? pid : null, message: running ? `Process ${pid} is running` : `Process ${pid} is not running` });
});

app.listen(PORT, () => console.log(`Monitor API running on port ${PORT}`));

