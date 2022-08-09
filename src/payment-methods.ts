import { createHash, randomUUID } from "crypto";
import https from "https";
import xml2js from "xml2js";
import { Config, HTMLFormData } from "./models/common";
import { ISO4217CurrencyCode, Mode, Provider, ProviderUrl, StoreType, TransactionType } from "./models/enum";
import { createHtmlContent } from "./utils";

export class PayNode {
	private storeType: StoreType;
	private provider: Provider;
	private clientId: string;
	private username: string;
	private password: string;
	private storeKey: string;
	constructor(config: Config) {
		this.storeType = config.storeType;
		this.provider = config.provider;
		this.clientId = config.clientId;
		this.username = config.username;
		this.password = config.password;
		this.storeKey = config.storeKey;
	}

	/**
	 * @def if you dont pass the creditCard info, it will redirect customer to input page
	 * @returns html form. Send this form to client as html response.
	 */
	async purchase(params: {
		orderId?: string;
		creditCard?: {
			number?: string;
			expireMonth?: string;
			expireYear?: string;
			cvv?: string;
		};
		/** @default "tr" */
		lang?: "en" | "tr";
		amount: number;
		/** e.g. https://example.com/success */
		okUrl: string;
		/** e.g. https://example.com/failure */
		failUrl: string;
		/** e.g. https://example.com/callback */
		callbackUrl: string;
		/** counter value that provides redirection in seconds (time to redirect to okUl or fail Url) */
		refreshTime?: number;
		customParams?: Record<string, string>;
	}): Promise<string> {
		switch (this.storeType) {
			case StoreType._3DPayHosting:
				return this.purchase3DPayHosting(params);
			case StoreType.PayHosting:
				return this.purchasePayHosting(params);
			case StoreType.Pay:
				return this.purchasePay(params);
			default:
				break;
		}
		return "";
	}

	private async purchase3DPayHosting(params: {
		orderId?: string;
		creditCard?: {
			number?: string;
			expireMonth?: string;
			expireYear?: string;
			cvv?: string;
		};
		amount: number;
		lang?: "en" | "tr";
		refreshTime?: number;
		okUrl: string;
		failUrl: string;
		callbackUrl: string;
		customParams?: Record<string, string>;
	}) {
		const orderId = params.orderId || randomUUID();
		const rnd = new Date().getTime();
		const data = {
			form: {
				clientId: this.clientId,
				storetype: StoreType._3DPayHosting,
				islemTipi: TransactionType.Auth,
				hash: createHash("sha1")
					.update(
						this.clientId +
							orderId +
							params.amount +
							params.okUrl +
							params.failUrl +
							TransactionType.Auth +
							rnd +
							params.callbackUrl +
							this.storeKey
					)
					.digest("base64"),
				amount: params.amount,
				currency: ISO4217CurrencyCode.TRY,
				oid: orderId,
				okUrl: params.okUrl,
				callbackurl: params.callbackUrl,
				failUrl: params.failUrl,
				lang: params.lang || "tr",
				rnd,
				pan: params.creditCard?.number,
				cardExpDateYear: params.creditCard?.expireYear,
				cardExpDateMonth: params.creditCard?.expireMonth,
				cv2: params.creditCard?.cvv,
				refreshTime: params.refreshTime ?? 10,
				optionalParams: params.customParams,
			},
			url: ProviderUrl[this.provider],
		} as HTMLFormData;
		return createHtmlContent(data);
	}

	private async purchasePayHosting(params: {
		orderId?: string;
		creditCard?: {
			number?: string;
			expireMonth?: string;
			expireYear?: string;
			cvv?: string;
		};
		amount: number;
		refreshTime?: number;
		lang?: "en" | "tr";
		okUrl: string;
		callbackUrl: string;
		failUrl: string;
		customParams?: Record<string, string>;
	}) {
		const orderId = params.orderId || randomUUID();
		const rnd = new Date().getTime();
		const data = {
			form: {
				clientId: this.clientId,
				storetype: StoreType.PayHosting,
				islemTipi: TransactionType.Auth,
				hash: createHash("sha1")
					.update(
						this.clientId +
							orderId +
							params.amount +
							params.okUrl +
							params.failUrl +
							TransactionType.Auth +
							rnd +
							params.callbackUrl +
							this.storeKey
					)
					.digest("base64"),
				amount: params.amount,
				currency: ISO4217CurrencyCode.TRY,
				oid: orderId,
				okUrl: params.okUrl,
				callbackurl: params.callbackUrl,
				failUrl: params.failUrl,
				lang: params.lang || "tr",
				rnd,
				pan: params.creditCard?.number,
				cardExpDateYear: params.creditCard?.expireYear,
				cardExpDateMonth: params.creditCard?.expireMonth,
				cv2: params.creditCard?.cvv,
				refreshTime: params.refreshTime ?? 10,
				optionalParams: params.customParams,
			},
			url: ProviderUrl[this.provider],
		} as HTMLFormData;
		return createHtmlContent(data);
	}

	private async purchasePay(params: {
		orderId?: string;
		creditCard?: {
			number?: string;
			expireMonth?: string;
			expireYear?: string;
			cvv?: string;
		};
		lang?: "en" | "tr";
		amount: number;
		okUrl: string;
		failUrl: string;
		callbackUrl: string;
		refreshTime?: number;
		customParams?: Record<string, string>;
	}): Promise<string> {
		const orderId = params.orderId || randomUUID();
		const data = {
			Name: this.username,
			Password: this.password,
			ClientId: this.clientId,
			Mode: Mode.Production,
			Type: TransactionType.Auth,
			Currency: ISO4217CurrencyCode.TRY,
			OrderId: orderId,
			Total: params.amount,
			Number: params.creditCard?.number,
			Expires: `${params.creditCard?.expireMonth}/${params.creditCard?.expireYear}`,
			Cvv2Val: params.creditCard?.cvv,
			...params.customParams,
		};
		const xml = new xml2js.Builder({ rootName: "CC5Request" }).buildObject(data);
		const result = await sendRequest({ method: "POST", data: xml, url: ProviderUrl[this.provider] });
		const res = await new xml2js.Parser({ explicitArray: false }).parseStringPromise(result);
		return res;
	}
}

/**
 *
 * @param params.data xml CC5Request
 * @returns xml result
 */
const sendRequest = async (params: { method: "POST"; url: string; data: string }) => {
	return new Promise<string>((resolve, reject) => {
		const { hostname, pathname } = new URL(params.url);
		const options = {
			hostname,
			path: pathname,
			method: params.method,
			headers: {
				"Content-Type": "text/xml",
			},
		} as https.RequestOptions;

		const request = https.request(options, (res) => {
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
		request.write(params.data);
		request.end();
	});
};
