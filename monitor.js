require("dotenv").config();
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { execSync, exec } = require("child_process");

const app = express();

app.use(cors());

const PORT = 3001;
const PID_FILE = process.env.PID_FILE;
const START_SCRIPT_FILE = process.env.START_SCRIPT_FILE;
const KILL_SCRIPT_FILE = process.env.KILL_SCRIPT_FILE;
const CANCEL_SCRIPT_FILE = process.env.CANCEL_SCRIPT_FILE;

const isProcessRunning = (pid) => {
  try {
    return execSync(`ps -p ${pid} -o comm=`).toString().trim().length > 0;
  } catch {
    return false;
  }
};

const kill = () => {
  exec(KILL_SCRIPT_FILE, (error, stdout, stderr) => {
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

const cancel = () => {
  exec(CANCEL_SCRIPT_FILE, (error, stdout, stderr) => {
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
  exec(START_SCRIPT_FILE, (error, stdout, stderr) => {
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
  console.log("status endpoint hit")
  if (!PID_FILE || !fs.existsSync(PID_FILE)) return res.json({ running: false, message: "PID file not found" });

  const pid = fs.readFileSync(PID_FILE, "utf8").trim();
  if (!pid || isNaN(pid)) return res.json({ running: false, message: "Invalid PID in file" });

  const running = isProcessRunning(pid);
  res.json({ running, pid: running ? pid : null, message: running ? `Process ${pid} is running` : `Process ${pid} is not running` });
});

app.get("/start", (req, res) => {
  console.log("start endpoint hit")
  if (!START_SCRIPT_FILE) return res.json({ running: false, message: "No script path provided in .env file" });

  const pid = fs.existsSync(PID_FILE) ? fs.readFileSync(PID_FILE, "utf8").trim() : null;
  if (pid && isProcessRunning(pid)) {
    return res.json({ running: true, pid, message: `Process ${pid} is already running` });
  }

  start();
  res.json({ running: true, message: "Process started via script" });
});

app.get("/cancel", (req, res) => {
  console.log("cancel endpoint hit")
  if (!CANCEL_SCRIPT_FILE) return res.json({ running: false, message: "No script path provided in .env file" });
  cancel();
  res.json({ message: "Cancelled orders" });
});

app.get("/kill", (req, res) => {
  console.log("kill endpoint hit")
  if (!KILL_SCRIPT_FILE) return res.json({ running: false, message: "No script path provided in .env file" });

  const pid = fs.existsSync(PID_FILE) ? fs.readFileSync(PID_FILE, "utf8").trim() : null;
  if (pid && !isProcessRunning(pid)) {
    return res.json({ running: false, pid, message: `Process ${pid} is not running` });
  }

  kill();
  res.json({ running: false, message: "Process killed via script" });
});

app.listen(PORT, () => console.log(`Monitor API running on port ${PORT}`));

