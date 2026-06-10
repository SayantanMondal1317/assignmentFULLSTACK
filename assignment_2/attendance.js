const fs = require("fs");
const FILE_PATH = "./attendance.json";

let attendanceStore = {};

try {
  if (fs.existsSync(FILE_PATH)) {
    const rawData = fs.readFileSync(FILE_PATH, "utf8");
    attendanceStore = JSON.parse(rawData || "{}");
  } else {
    attendanceStore = {};
  }
} catch (error) {
  console.error("Error initializing store:", error.message);
  attendanceStore = {};
}

function markPresent(rollNumber) {
  if (attendanceStore[rollNumber]) {
    return {
      success: false,
      reason: "already_marked",
      timestamp: attendanceStore[rollNumber],
    };
  }

  const timestamp = new Date().toISOString();
  attendanceStore[rollNumber] = timestamp;

  try {
    fs.writeFileSync(
      FILE_PATH,
      JSON.stringify(attendanceStore, null, 2),
      "utf8",
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving to disk:", error.message);
    return { success: false, reason: "disk_error" };
  }
}

function getStats() {
  const rollNumbers = Object.keys(attendanceStore).sort();
  return {
    total: rollNumbers.length,
    rollNumbers: rollNumbers,
  };
}

if (require.main === module) {
  console.log("Testing Attendance Store...");

  console.log("Marking 240123:", markPresent("240123"));
  console.log("Marking 240123 again:", markPresent("240123"));
  console.log("Marking 240005:", markPresent("240005"));

  console.log("Current Stats:", getStats());
}

module.exports = { markPresent, getStats };
