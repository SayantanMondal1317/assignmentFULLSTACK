// Raw QR String = 02.250996,1,MEUCIDd/xGvGnz9+hibXwpu0v3PtABnd7z8/QuSgqX+UBWi/AiEAjDbPCDFYBJU52iDpmo5kasOQrLN0nlBLqhGwBoQ43IY=.iitkidcard
// The roll number is the 6 digit number in the string after 02., which is 250996 in this case.

function extractRollNumber(qrString) {
  if (!qrString) return null;
  const matches = qrString.match(/\d{6}/);
  return matches ? matches[0] : null;
}

function isRegistered(rollNumber) {
  const num = Number(rollNumber);
  return num >= 240001 && num <= 240400;
  // return num >= 250001 && num <= 251500; // mock range for testing my friends
}

if (require.main === module) {
  const testString =
    "02.250996,1,MEUCIDd/xGvGnz9+hibXwpu0v3PtABnd7z8/QuSgqX+UBWi/AiEAjDbPCDFYBJU52iDpmo5kasOQrLN0nlBLqhGwBoQ43IY=.iitkidcard";
  const roll = extractRollNumber(testString);
  console.log("Extracted Roll:", roll);
  console.log("Is Registered:", roll ? isRegistered(roll) : false);

  const validTestString = "02.240123,1,MEUCID...randomstuff...iitkidcard";
  const validRoll = extractRollNumber(validTestString);
  console.log("Mock Valid Extracted Roll:", validRoll);
  console.log(
    "Mock Valid Is Registered:",
    validRoll ? isRegistered(validRoll) : false,
  );
}

module.exports = { extractRollNumber, isRegistered };
