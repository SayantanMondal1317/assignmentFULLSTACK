require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { decodeQR } = require("./qr");
const { extractRollNumber, isRegistered } = require("./parser");
const { markPresent, getStats } = require("./attendance");

const token = process.env.BOT_TOKEN;
if (!token) {
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome to the IITK QR Attendance Bot! Send me a photo of an ID card to mark attendance, or type /report to see current stats.",
  );
});

bot.onText(/\/report/, (msg) => {
  const stats = getStats();
  if (stats.total === 0) {
    bot.sendMessage(msg.chat.id, "No attendance records marked yet.");
  } else {
    const list = stats.rollNumbers
      .map((roll, index) => `${index + 1}. ${roll}`)
      .join("\n");
    bot.sendMessage(
      msg.chat.id,
      `Total Attendance: ${stats.total}\n\nPresent Roll Numbers:\n${list}`,
    );
  }
});

bot.on("photo", async (msg) => {
  const chatId = msg.chat.id;
  try {
    const photo = msg.photo[msg.photo.length - 1];
    const localPath = await bot.downloadFile(photo.file_id, "./");

    const qrData = await decodeQR(localPath);
    if (!qrData) {
      return bot.sendMessage(chatId, "No QR code found");
    }

    const rollNumber = extractRollNumber(qrData);
    if (!rollNumber) {
      return bot.sendMessage(chatId, "No valid roll number found");
    }

    if (!isRegistered(rollNumber)) {
      return bot.sendMessage(
        chatId,
        `Roll number ${rollNumber} is out of registered range`,
      );
    }

    const result = markPresent(rollNumber);
    if (result.success) {
      bot.sendMessage(
        chatId,
        `Attendance marked for roll number: ${rollNumber}`,
      );
    } else if (result.reason === "already_marked") {
      bot.sendMessage(
        chatId,
        `Roll number ${rollNumber} is already marked. Original timestamp: ${result.timestamp}`,
      );
    } else {
      bot.sendMessage(chatId, "Error saving record");
    }
  } catch (error) {
    bot.sendMessage(chatId, "An error occurred during processing");
  }
});
