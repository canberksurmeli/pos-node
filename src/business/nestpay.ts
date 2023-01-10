import { createHash, randomUUID } from "crypto";
import xml2js from "xml2js";
import { AssecoOptions, HTMLFormData } from "../models/common.js";
import { ISO4217CurrencyCode, Mode, Provider, ProviderUrl, StoreType, TransactionType } from "../models/enum.js";
import { createHtmlContent, sendHttpsRequest } from "../utils.js";
export class Nestpay {
	public storeType: StoreType;
	public provider: Provider;
	private clientId: string;
	private username: string;
	private password: string;
	private storeKey: string;
	constructor() {
		this.storeType = StoreType.Pay;
		this.provider = Provider.IyzicoTest;
		this.clientId = "";
		this.username = "";
		this.password = "";
		this.storeKey = "";
	}

	setOptions(options: AssecoOptions): void {
		this.storeType = options.storeType;
		this.provider = options.provider;
		this.clientId = options.clientId;
		this.username = options.username;
		this.password = options.password;
		this.storeKey = options.storeKey;
	}

	/**
	 * @def if you dont pass the creditCard info, it will redirect customer to input page
	 * @returns html form. Send this form to client as html response.
	 */

	/** 3DPayHosting */
	async purchase3D(params: {
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
	}): Promise<string> {
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
			url: this.provider === Provider.AssecoTest ? ProviderUrl.AssecoTest : ProviderUrl.AssecoZiraat3D,
		} as HTMLFormData;
		return createHtmlContent(data);
	}

	/** PayHosting */
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
			url: this.provider === Provider.AssecoTest ? ProviderUrl.AssecoTest : ProviderUrl.AssecoZiraat,
		} as HTMLFormData;
		return createHtmlContent(data);
	}

	/** Pay */
	async purchase(params: {
		orderId?: string;
		creditCard?: {
			number?: string;
			expireMonth?: string;
			expireYear?: string;
			cvv?: string;
		};
		lang?: "en" | "tr";
		amount: number;
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

		const providerUrl = this.provider === Provider.AssecoTest ? ProviderUrl.AssecoTest : ProviderUrl.AssecoZiraat;
		const { hostname, pathname } = new URL(`${providerUrl}/fim/api`);
		const result = await sendHttpsRequest({
			body: xml,
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					"content-type": "text/xml",
				},
			},
		});
		return new xml2js.Parser({ explicitArray: false }).parseStringPromise(result);
	}
}
