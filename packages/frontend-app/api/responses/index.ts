import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  try {
    // Array of strings simulating the documents to parse
    // We must replace with actual results from the Open API Service
    const longStrings = [
      "This is a long string with some relevant information.",
      "Another long string containing important details.",
      "A third long string that might have the answer you seek.",
    ];

    const requestBody = req.body;

    if (!requestBody || !requestBody.question) {
      context.res = {
        status: 400,
        body: { message: "Bad Request: Please provide a 'question' in the request body." },
        headers: {
          "Content-Type": "application/json", 
        },
      };
    } else {
      const question = requestBody.question.toLowerCase();
      let matchingString = "We couldn't find a good answer. Try again!";

      for (const longString of longStrings) {
        console.log(question, '#### This question was asked ####');
        if (longString.toLowerCase().includes(question)) {
          matchingString = longString;
          break;
        }
      }

      context.res = {
        status: 200,
        body: { response: matchingString },
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: `Internal Server Error: ${error.message}` },
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};

export default httpTrigger;
