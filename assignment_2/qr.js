const { Jimp } = require("jimp");
const jsQR = require("jsqr");

async function decodeQR(imagePath) {
  try {
    const image = await Jimp.read(imagePath);
    const { data, width, height } = image.bitmap;
    const qrCode = jsQR(new Uint8ClampedArray(data), width, height);

    if (qrCode) {
      return qrCode.data;
    } else {
      throw new Error("No QR code found in the image.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    decodeQR(args[0]).then((result) => {
      if (result) {
        console.log("Result:", result);
      } else {
        console.log("Decoding failed.");
      }
    });
  } else {
    console.log(
      "Please provide an image file path. Example: node qr.js test.jpeg",
    );
  }
}

module.exports = { decodeQR };
