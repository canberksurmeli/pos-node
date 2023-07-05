import crypto from "crypto";
import https from "https";
import { Iyzico } from "./business/iyzico";
import { HTMLFormData } from "./models/common";
import { IyzicoCard, IyzicoStoredCard } from "./models/iyzico";

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

export const convertMapToUrlPathParameters = (data: Map<any, any> | Map<any, any>[]) => {
	const items: string[] = [];

	if (Array.isArray(data)) {
		for (const map of data) {
			items.push(`${convertMapToUrlPathParameters(map)}`);
		}
		return `[${items.join(", ")}]`;
	}

	for (const [key, value] of data.entries()) {
		if (value instanceof Map || Array.isArray(value)) {
			items.push(`${key}=${convertMapToUrlPathParameters(value)}`);
		} else {
			items.push(`${key}=${value.toString()}`);
		}
	}
	return `[${items.join(",")}]`;
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

export function createHashMapFromObjectForPurchase(
	params: Parameters<InstanceType<typeof Iyzico>["purchase"]>[0] & { callbackUrl?: string }
) {
	const map = new Map<keyof typeof params, (typeof params)[keyof typeof params]>();
	map.set("locale", params.locale);
	if (params.conversationId) map.set("conversationId", params.conversationId);
	map.set("price", params.price);
	map.set("paidPrice", params.paidPrice);
	map.set("installment", params.installment);
	map.set("paymentChannel", params.paymentChannel);
	map.set("paymentGroup", params.paymentGroup);
	const cardMap = new Map<string, IyzicoCard[keyof IyzicoCard] | IyzicoStoredCard[keyof IyzicoStoredCard]>();
	if ((params.paymentCard as IyzicoCard).cardNumber) {
		const paymentCard = params.paymentCard as IyzicoCard;
		cardMap.set("cardHolderName", paymentCard.cardHolderName);
		cardMap.set("cardNumber", paymentCard.cardNumber);
		cardMap.set("expireYear", paymentCard.expireYear);
		cardMap.set("expireMonth", paymentCard.expireMonth);
		cardMap.set("cvc", paymentCard.cvc);
	} else {
		const paymentCard = params.paymentCard as IyzicoStoredCard;
		cardMap.set("cardUserKey", paymentCard.cardUserKey);
		cardMap.set("cardToken", paymentCard.cardToken);
	}
	map.set("paymentCard", cardMap as unknown as (typeof params)["paymentCard"]);
	const buyerMap = new Map();
	buyerMap.set("id", params.buyer.id);
	buyerMap.set("name", params.buyer.name);
	buyerMap.set("surname", params.buyer.surname);
	buyerMap.set("identityNumber", params.buyer.identityNumber);
	buyerMap.set("email", params.buyer.email);
	if (params.buyer.gsmNumber) buyerMap.set("gsmNumber", params.buyer.gsmNumber);
	if (params.buyer.registrationDate) buyerMap.set("registrationDate", params.buyer.registrationDate);
	if (params.buyer.lastLoginDate) buyerMap.set("lastLoginDate", params.buyer.lastLoginDate);
	buyerMap.set("registrationAddress", params.buyer.registrationAddress);
	buyerMap.set("city", params.buyer.city);
	buyerMap.set("country", params.buyer.country);
	if (params.buyer.zipCode) buyerMap.set("zipCode", params.buyer.zipCode);
	buyerMap.set("ip", params.buyer.ip);
	map.set("buyer", buyerMap as unknown as (typeof params)["buyer"]);

	const addressMap = new Map();
	addressMap.set("address", params.shippingAddress.address);
	addressMap.set("contactName", params.shippingAddress.contactName);
	addressMap.set("city", params.shippingAddress.city);
	addressMap.set("country", params.shippingAddress.country);
	if (params.shippingAddress.zipCode) addressMap.set("zipCode", params.shippingAddress.zipCode);
	map.set("shippingAddress", addressMap as unknown as (typeof params)["shippingAddress"]);
	map.set("billingAddress", addressMap as unknown as (typeof params)["billingAddress"]);

	const basketItemsMap: Map<string, Parameters<InstanceType<typeof Iyzico>["purchase"]>[0]["basketItems"][0]>[] = [];
	params.basketItems.forEach((item) => {
		const itemMap = new Map();
		itemMap.set("id", item.id);
		itemMap.set("price", item.price);
		itemMap.set("name", item.name);
		itemMap.set("category1", item.category1);
		if (item.category2) itemMap.set("category2", item.category2);
		itemMap.set("itemType", item.itemType);
		if (item.subMerchantKey) itemMap.set("subMerchantKey", item.subMerchantKey);
		if (item.subMerchantPrice) itemMap.set("subMerchantPrice", item.subMerchantPrice);
		basketItemsMap.push(itemMap);
	});
	map.set("basketItems", basketItemsMap as unknown as (typeof params)["basketItems"]);
	map.set("currency", params.currency);
	if (params.callbackUrl) map.set("callbackUrl", params.callbackUrl);
	return map;
}

export function createHashMapFromObjectForSaveCard(params: Parameters<InstanceType<typeof Iyzico>["saveCard"]>[0]) {
	const map = new Map<keyof typeof params | "cardUserKey", (typeof params)[keyof typeof params]>();
	if (params.locale) map.set("locale", params.locale);
	if (params.conversationId) map.set("conversationId", params.conversationId);
	if (params.externalId) map.set("externalId", params.externalId);
	if (params.email) map.set("email", params.email);
	if (params.userKey) map.set("cardUserKey", params.userKey);

	const cardMap = new Map<string, IyzicoCard[keyof IyzicoCard]>();
	if (params.card.alias) cardMap.set("cardAlias", params.card.alias);
	cardMap.set("cardNumber", params.card.number);
	cardMap.set("expireYear", params.card.expireYear);
	cardMap.set("expireMonth", params.card.expireMonth);
	cardMap.set("cardHolderName", params.card.holderName);
	map.set("card", cardMap as unknown as (typeof params)["card"]);
	return map;
}

export function createHashMapFromObjectForGetSavedCard(params: Parameters<InstanceType<typeof Iyzico>["getSavedCards"]>[0]) {
	const map = new Map<keyof typeof params, (typeof params)[keyof typeof params]>();
	if (params.locale) map.set("locale", params.locale);
	if (params.conversationId) map.set("conversationId", params.conversationId);
	map.set("cardUserKey", params.cardUserKey);
	return map;
}

export function createHashMapFromObjectForDeleteSavedCard(params: Parameters<InstanceType<typeof Iyzico>["deleteCard"]>[0]) {
	const map = new Map<keyof typeof params, (typeof params)[keyof typeof params]>();
	if (params.locale) map.set("locale", params.locale);
	if (params.conversationId) map.set("conversationId", params.conversationId);
	map.set("cardUserKey", params.cardUserKey);
	map.set("cardToken", params.cardToken);
	return map;
}

export function createHashMapFromObjectForComplete3D(params: Parameters<InstanceType<typeof Iyzico>["complete3D"]>[0]) {
	const map = new Map<keyof typeof params, (typeof params)[keyof typeof params]>();
	if (params.locale) map.set("locale", params.locale);
	if (params.conversationId) map.set("conversationId", params.conversationId);
	map.set("paymentId", params.paymentId);
	if (params.conversationData) map.set("conversationData", params.conversationData);
	return map;
}

export function convertMapToObject(data: Map<any, any> | Map<any, any>[]): any {
	const obj: any = {};
	if (Array.isArray(data)) {
		const arr = [];
		for (const map of data) {
			arr.push(convertMapToObject(map));
		}
		return arr;
	}
	for (const [key, value] of data.entries()) {
		if (typeof value === "object") {
			obj[key] = convertMapToObject(value);
		} else {
			obj[key] = value;
		}
	}
	return obj;
}
