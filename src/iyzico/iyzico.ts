import crypto from "crypto";

export const generateAuthorizationHeaderParamV2 = (params: {
	apiKey: string;
	secretKey: string;
	randomString: string;
	uri: string;
	body: string;
}) => {
	const { apiKey, secretKey, randomString, uri, body } = params;
	const signature = crypto
		.createHmac("sha256", secretKey)
		.update(randomString + uri + body)
		.digest("hex");
	const authorizationParams = ["apiKey:" + apiKey, "randomKey:" + randomString, "signature:" + signature];
	const hash = Buffer.from(authorizationParams.join("&")).toString("base64");
	return `IYZWSv2 ${hash}`;
};

export const generateAuthorizationHeaderParamV1 = (params: { apiKey: string; secretKey: string; randomString: string; body: string }) => {
	const { apiKey, secretKey, randomString, body } = params;
	const hash = crypto
		.createHash("sha1")
		.update(apiKey + randomString + secretKey + body, "utf-8")
		.digest("base64");
	return `IYZWS ${apiKey}:${hash}`;
};

//convert json to urlpath parameters
function convertJsonToUrlPathParameters(data: Record<string, unknown> | Record<string, unknown>[]): string {
	const isArray = Array.isArray(data);
	const items: string[] = [];
	Object.keys(data).map((key) => {
		if (isArray) {
			items.push(`${convertJsonToUrlPathParameters(data[key as unknown as number])}`);
		} else if (typeof data[key] === "object") {
			items.push(`${key}=${convertJsonToUrlPathParameters(data[key] as Record<string, unknown>)}`);
		} else {
			items.push(`${key}=${data[key]}`);
		}
	});
	return `[${items.join(isArray ? ", " : ",")}]`;
}
