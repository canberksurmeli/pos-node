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

export const html = `
   `;

//create generic request sender
export const sendRequest = (url: string, method: string, data: any) => {
	return new Promise((resolve, reject) => {
		const req = https.request(url, { method }, (res) => {
			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});
			res.on("end", () => {
				resolve(data);
			});
		});
		req.on("error", (err) => {
			reject(err);
		});
		req.write(JSON.stringify(data));
		req.end();
	});
};

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