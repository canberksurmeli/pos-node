import crypto from "crypto";
import https from "https";
import { HTMLFormData } from "./models/common";

/**
 *
 * @param optionalParams optional parameters will be returned on response callbacks
 */
export function createHtmlContent({ form, url }: HTMLFormData): string {
	return `
	<!DOCTYPE html>
    <html>
    <head>
		<meta charset="utf-8">
    </head>
    <body>
        <form id="nestPay3d" method="post" action="${url}">
            <input type="hidden" name="clientid" value="${form.clientId}" />
            <input type="hidden" name="storetype" value="${form.storetype}" />
            <input type="hidden" name="hash" value="${form.hash}" />
            <input type="hidden" name="islemtipi" value="${form.islemTipi}" />
            <input type="hidden" name="amount" value="${form.amount}" />
            <input type="hidden" name="currency" value="${form.currency}" />
            <input type="hidden" name="oid" value="${form.oid}" />
            <input type="hidden" name="okUrl" value="${form.okUrl}" />
            <input type="hidden" name="callbackurl" value="${form.callbackurl}" />
            <input type="hidden" name="failUrl" value="${form.failUrl}" />
            <input type="hidden" name="lang" value="${form.lang}" />
            <input type="hidden" name="pan" value="${form.pan}" />
            <input type="hidden" name="Ecom_Payment_Card_ExpDate_Year" value="${form.cardExpDateYear}" />
            <input type="hidden" name="Ecom_Payment_Card_ExpDate_Month" value="${form.cardExpDateMonth}" />
            <input type="hidden" name="rnd" value="${form.rnd}" />
            <input type="hidden" name="cv2" value="${form.cv2}" />
            <input type="hidden" name="refreshtime" value="${form.refreshTime}" />
            ${Object.entries(form.optionalParams || {})
				.map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
				.join("\n")}
			</form>
        <script type="text/javascript">
            document.getElementById("nestPay3d").submit();
        </script>
    </body>
    </html> `;
}

export const convertJsonToUrlPathParameters = (data: Record<string, unknown> | Record<string, unknown>[]): string => {
	const isArray = Array.isArray(data);
	const items: string[] = [];
	for (const key in data) {
		if (isArray) {
			items.push(`${convertJsonToUrlPathParameters(data[key as unknown as number])}`);
		} else if (typeof data[key] === "object") {
			items.push(`${key}=${convertJsonToUrlPathParameters(data[key] as Record<string, unknown>)}`);
		} else {
			items.push(`${key}=${(data[key] as number).toString()}`);
		}
	}
	return `[${items.join(isArray ? ", " : ",")}]`;
};

export const formatPrice = (price: number): string => {
	if ((typeof price !== "number" && typeof price !== "string") || !isFinite(price)) {
		return price.toString();
	}
	if (Number.isInteger(price)) {
		return price.toFixed(1);
	}
	return price.toString();
};

export const removeEmptyProperties = (obj: {}) => {
	return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};

export const generateIyzicoAuthorizationHeaderParamV2 = (params: {
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

export const generateIyzicoAuthorizationHeaderParamV1 = (params: {
	apiKey: string;
	secretKey: string;
	randomString: string;
	body: string;
}) => {
	const { apiKey, secretKey, randomString, body } = params;
	const hash = crypto
		.createHash("sha1")
		.update(apiKey + randomString + secretKey + body, "utf-8")
		.digest("base64");
	return `IYZWS ${apiKey}:${hash}`;
};

/**
 *
 * @param params.data xml CC5Request
 */
export const sendHttpsRequest = async (params: { body: string; options: https.RequestOptions }): Promise<string> => {
	return new Promise<string>((resolve, reject) => {
		const request = https.request(params.options, (res) => {
			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});

			res.on("end", () => {
				resolve(data);
			});

			res.on("error", () => {
				reject();
			});
		});
		request.write(params.body);
		request.end();
	});
};
