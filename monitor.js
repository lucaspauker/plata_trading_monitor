require("dotenv").config();
const fs = require("fs");
const express = require("express");
const { execSync } = require("child_process");

const app = express();
const PORT = 3001;
const PID_FILE = process.env.PID_FILE;
const START_SCRIPT_PATH = process.env.START_SCRIPT_PATH;
const KILL_SCRIPT_PATH = process.env.KILL_SCRIPT_PATH;

const isProcessRunning = (pid) => {
  try {
    return execSync(`ps -p ${pid} -o comm=`).toString().trim().length > 0;
  } catch {
    return false;
  }
};

const kill = () => {
  exec(KILL_SCRIPT_PATH, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return;
    }
    console.log(`Script output: ${stdout}`);
  });
};

const start = () => {
  exec(START_SCRIPT_PATH, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Script stderr: ${stderr}`);
      return;
    }
    console.log(`Script output: ${stdout}`);
  });
};

app.get("/status", (req, res) => {
  if (!PID_FILE || !fs.existsSync(PID_FILE)) return res.json({ running: false, message: "PID file not found" });

  const pid = fs.readFileSync(PID_FILE, "utf8").trim();
  if (!pid || isNaN(pid)) return res.json({ running: false, message: "Invalid PID in file" });

  const running = isProcessRunning(pid);
  res.json({ running, pid: running ? pid : null, message: running ? `Process ${pid} is running` : `Process ${pid} is not running` });
});

app.get("/start", (req, res) => {
  if (!START_SCRIPT_PATH) return res.json({ running: false, message: "No script path provided in .env file" });

  const pid = fs.existsSync(PID_FILE) ? fs.readFileSync(PID_FILE, "utf8").trim() : null;
  if (pid && isProcessRunning(pid)) {
    return res.json({ running: true, pid, message: `Process ${pid} is already running` });
  }

  start();
  res.json({ running: true, message: "Process started via script" });
});

app.get("/kill", (req, res) => {
  if (!KILL_SCRIPT_PATH) return res.json({ running: false, message: "No script path provided in .env file" });

  const pid = fs.existsSync(PID_FILE) ? fs.readFileSync(PID_FILE, "utf8").trim() : null;
  if (pid && isProcessRunning(pid)) {
    return res.json({ running: true, pid, message: `Process ${pid} is already running` });
  }

  kill();
  res.json({ running: true, message: "Process killed via script" });
});

app.listen(PORT, () => console.log(`Monitor API running on port ${PORT}`));

