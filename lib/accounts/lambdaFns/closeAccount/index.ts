import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyCallback,
} from "aws-lambda";
import { jsonResponse } from "/opt/nodejs/lambda-utils";
import { axios } from "/opt/nodejs/nodeModules";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: APIGatewayProxyCallback
) {
  try {
    if (!event.body) {
      throw new Error('ERROR_MISSING_EVENT_BODY');
    }

    if (!event?.requestContext.authorizer) {
      throw new Error('ERROR_UNAUTHORIZED');
    }

    if (!process.env.unitBaseUrl || !process.env.unitAPIKey) {
      throw new Error('ERROR_MISSING_ENV_PROPS');
    }

    const { accountId } = event?.requestContext.authorizer;
    const unitBaseUrl = process.env.unitBaseUrl;

    let options = {
      method: "POST",
      url: `${unitBaseUrl}/accounts/${accountId}/close`,
      data: {},
      headers: {
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${process.env.unitAPIKey}`,
      },
    };

    const res = await axios(options);

    return callback(
      null,
      jsonResponse(
        "success",
        {
          ...res.data.data,
        },
      )
    );
  } catch (error: any) {
    return callback(
      null,
      jsonResponse("internalServerError", error, false),
    );
  }
}
