const ExifReader = require("exifreader");
const axios = require("axios");
const { formatDate, isValidClaimDate } = require("../utils/helpers");

// Extract EXIF data and validate the date
exports.extractExifData = (buffer, claimDate) => {
  const tags = ExifReader.load(buffer);
  const dateTimeExif = tags["DateTime"]?.description;
  const formattedDate = formatDate(dateTimeExif.split(" ")[0]);

  const validationMessage = isValidClaimDate(new Date(formattedDate), new Date(claimDate))
    ? "Valid Image"
    : "Please upload images that are taken recently";

  return { formattedDate, validationMessage };
};

// Analyze the content of the image using an external AI service
exports.analyzeImageContent = async (imageBuffer, itemCovered) => {
  try {
    const mimeType = "image/jpeg"; // You can dynamically determine this if needed

    // Prepare the request payload
    const data = JSON.stringify({
      contents: {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBuffer.toString("base64"),
            },
          },
          {
            text: `Analyze the image and tell me what object it contains. 
                   I'll also give you an object name, and you should return if both the image and the object name match.
                   The output should be in the following JSON format:
                   - Object Name
                   - Analyzed Image
                   - Matching Percentage.
                   The object name is: ${itemCovered}`,
          },
        ],
      },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: process.env.MIRA_AI_URL, // External AI API endpoint
      headers: {
        model: process.env.MIRA_AI_MODEL,
        "access-key": process.env.MIRA_AI_ACCESS_KEY,
        "Content-Type": "application/json",
      },
      data: data,
    };

    // Make a request to the external API
    const response = await axios.request(config);
    console.log("API Response:", response.data);

    // Extract the raw content from the response
    const rawContent = response.data.message.content;

    // Extract JSON from Markdown code block
    const jsonContentMatch = rawContent.match(/``` json\n([\s\S]*?)\n```/);

    if (jsonContentMatch) {
      const jsonContent = jsonContentMatch[1].trim();
      console.log("Extracted JSON Content:", jsonContent);

      try {
        // Parse the JSON content
        const parsedJson = JSON.parse(jsonContent);

        // Construct the result object
        const matchingPercentageStr = parsedJson["Matching percentage"];
        const matchingPercentage = parseInt(matchingPercentageStr.replace("%", "").trim());

        let claimStatus;
        if (matchingPercentage < 80) {
          claimStatus = {
            status: "Claim Rejected",
            reason: "The matching percentage is below the acceptable threshold.",
          };
        } else {
          claimStatus = {
            status: "Claim Authorized",
          };
        }

        const result = {
          "Object Name": parsedJson["Object Name"],
          "Analyzed Image": parsedJson["Analyzed Image"],
          "Matching percentage": matchingPercentage,
          "Claim Status": claimStatus,
        };

        console.log("Result:", result);

        // Return the result object
        return result;
      } catch (jsonError) {
        console.error("Error parsing JSON content:", jsonError.message);
        throw new Error("Error parsing JSON content.");
      }
    } else {
      throw new Error("No JSON content found in response.");
    }
  } catch (error) {
    console.error("Error analyzing image content:", error.message);
    throw error;
  }
};
