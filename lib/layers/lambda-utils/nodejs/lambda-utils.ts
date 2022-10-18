import { generateResponse, getErrorMessage } from "@smashtaps/lambda-utils";
import { Status } from "@smashtaps/lambda-utils/build/types";

const ERROR_CODES: any = {
    ERROR_UNAUTHORIZED: 'Unauthorized account: Missing auth data',
    ERROR_MISSING_EVENT_BODY: 'Missing body',
    ERROR_MISSING_ENV_PROPS: 'Missing required parameters',
    ERROR_AXIO_API_REQUEST: 'API request Error',
}

function errorParser(error: any) {
    let errorLog;
    let errorResponse = {
        message: '',
        status: error?.status,
    };
    if (error.isAxiosError) {
        // axio api request errors
        errorLog = error?.response?.data;
        if (errorLog?.errors[0] && (errorLog?.errors[0]?.code || errorLog?.errors[0]?.title)) {
            // unit API error
            errorResponse.message = errorLog?.errors[0]?.code || errorLog?.errors[0]?.title;
        } else if (errorLog?.errors?.title) {
            // invoicia API error
            errorResponse.message = errorLog?.errors?.title;
        } else {
            errorResponse.message = ERROR_CODES.ERROR_AXIO_API_REQUEST;
        }
    } else if (error.message && ERROR_CODES[error.message]) {
        // track system known errors
        errorResponse.message = ERROR_CODES[error.message];
    } else {
        errorResponse.message = error.message;
    }

    console.error(errorLog ? JSON.stringify(errorLog) : errorResponse.message);

    return errorResponse;
}

function jsonResponse(status: Status, error: any, isSuccess: boolean = true) {
    let errorResponse;
    if (!isSuccess) {
       errorResponse = errorParser(error);
    }
    return generateResponse(errorResponse?.status ?? status, error, isSuccess, errorResponse?.message ?? error.message);
}

export { jsonResponse, generateResponse, getErrorMessage };
