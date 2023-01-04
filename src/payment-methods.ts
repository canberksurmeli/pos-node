import { createHash, randomUUID } from "crypto";
import https from "https";
import { URL } from "url";
import xml2js from "xml2js";
import { generateAuthorizationHeaderParamV1 } from "./iyzico/iyzico";
import { AssecoOptions, HTMLFormData, IyzicoOptions } from "./models/common";
import { ISO4217CurrencyCode, Mode, Provider, ProviderUrl, StoreType, TransactionType } from "./models/enum";
import { AddCardResponse, BasketItemType, DeleteCardResponse, PaymentChannel, PaymentGroup } from "./models/iyzico.js";
import { convertJsonToUrlPathParameters, createHtmlContent, formatPrice } from "./utils";

export class PaymentFactory {
	static createPaymentMethod<P extends Provider>(
		provider: P
	): {
		[Provider.Iyzico]: Iyzico;
		[Provider.IyzicoTest]: Iyzico;
		[Provider.AssecoTest]: Asseco;
		[Provider.Ziraat]: Asseco;
	}[P] {
		switch (provider) {
			case Provider.Iyzico:
			case Provider.IyzicoTest:
				return new Iyzico() as any;
			case Provider.AssecoTest:
			case Provider.Ziraat:
				return new Asseco() as any;
			default:
				throw new Error("Unsupported payment type");
		}
	}
}
export class Asseco {
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
export class Iyzico {
	public provider: Provider.Iyzico | Provider.IyzicoTest;
	private apiKey: string;
	private secretKey: string;
	constructor() {
		this.provider = Provider.IyzicoTest;
		this.apiKey = "";
		this.secretKey = "";
	}

	setOptions(options: IyzicoOptions): void {
		this.provider = options.provider;
		this.apiKey = options.apiKey;
		this.secretKey = options.secretKey;
	}

	async saveCard(card: {
		alias: string;
		holderName: string;
		number: string;
		expire: {
			month: string;
			year: string;
		};
		email: string;
		/** The id given by the authority to the card to be stored. */
		externalId?: string;
		locale?: string;
		/** A value that you can send and receive during the request can be used to match the request/response. */
		conversationId?: string;
	}): Promise<AddCardResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/cardstorage/card");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		const body = {
			locale: card.locale,
			conversationId: card.conversationId,
			externalId: card.externalId,
			email: card.email,
			card: {
				cardAlias: card.alias,
				cardNumber: card.number,
				expireYear: card.expire.year,
				expireMonth: card.expire.month,
				cardHolderName: card.holderName,
			},
		};
		const result = await sendHttpsRequest({
			body: JSON.stringify(body),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertJsonToUrlPathParameters(body),
						randomString,
						secretKey: this.secretKey,
					}),
					"content-type": "application/json",
				},
			} as https.RequestOptions,
		});
		return JSON.parse(result) as AddCardResponse;
	}

	async deleteCard(params: {
		locale?: string;
		conversationId?: string;
		cardToken: string;
		cardUserKey: string;
	}): Promise<DeleteCardResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/cardstorage/card");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		const body = Object.freeze({
			locale: params.locale,
			conversationId: params.conversationId,
			cardUserKey: params.cardUserKey,
			cardToken: params.cardToken,
		});
		console.log(convertJsonToUrlPathParameters(body));
		const result = await sendHttpsRequest({
			body: JSON.stringify(body),
			options: {
				hostname,
				path: pathname,
				method: "DELETE",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertJsonToUrlPathParameters(body),
						randomString,
						secretKey: this.secretKey,
					}),
				},
			} as https.RequestOptions,
		});
		return JSON.parse(result);
	}

	/** purchaseWithSubMerchant */
	async purchase(params: {
		locale: "tr" | "en";
		/** orderId */
		conversationId: string;
		/** total price without discounts @example 1.7*/
		price: number;
		/** price that customer will pay @example 1.2*/
		paidPrice: number;
		/** @default 1*/
		currency: "TRY";
		installment: number;
		paymentChannel: PaymentChannel;
		paymentGroup: PaymentGroup;
		paymentCard: {
			cardHolderName: string;
			cardNumber: string;
			expireYear: string;
			expireMonth: string;
			cvc: string;
		};
		buyer: {
			id: string;
			name: string;
			surname: string;
			identityNumber: string;
			email: string;
			gsmNumber?: string;
			/** @example 2013-04-21 15:12:09 */
			registrationDate?: string;
			/** @example 2015-10-05 12:43:35 */
			lastLoginDate?: string;
			registrationAddress: string;
			city: string;
			country: string;
			zipCode?: string;
			ip: string;
		};
		shippingAddress: {
			contactName: string;
			address: string;
			city: string;
			country: string;
			zipCode?: string;
		};
		billingAddress: {
			contactName: string;
			address: string;
			city: string;
			country: string;
			zipCode?: string;
		};
		basketItems: {
			id: string;
			price: number;
			name: string;
			category1: string;
			category2?: string; //optional
			itemType: BasketItemType;
			subMerchantKey: string;
			subMerchantPrice: number;
		}[];
	}): Promise<string> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/payment/auth");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		params.price = formatPrice(params.price) as any;
		params.paidPrice = formatPrice(params.paidPrice) as any;
		params.basketItems.forEach((item) => {
			item.price = formatPrice(params.paidPrice) as any;
			item.subMerchantPrice = formatPrice(params.paidPrice) as any;
		});

		return sendHttpsRequest({
			body: JSON.stringify(params),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertJsonToUrlPathParameters(params),
						randomString,
						secretKey: this.secretKey,
					}),
					"Content-Type": "application/json",
				},
			} as https.RequestOptions,
		});
	}

	/** purchase3DWithSubMerchant */
	async purchase3D(params: {
		locale: "tr" | "en";
		/** orderId */
		conversationId: string;
		/** total price without discounts @example 1.7*/
		price: number;
		/** price that customer will pay @example 1.2*/
		paidPrice: number;
		/** @default 1*/
		currency: "TRY";
		installment: number;
		paymentChannel: PaymentChannel;
		paymentGroup: PaymentGroup;
		/** @example https://test.io/callback */
		callbackUrl: string;
		paymentCard: {
			cardHolderName: string;
			cardNumber: string;
			expireYear: string;
			expireMonth: string;
			cvc: string;
		};
		buyer: {
			id: string;
			name: string;
			surname: string;
			identityNumber: string;
			email: string;
			gsmNumber?: string;
			/** @example 2013-04-21 15:12:09 */
			registrationDate?: string;
			/** @example 2015-10-05 12:43:35 */
			lastLoginDate?: string;
			registrationAddress: string;
			city: string;
			country: string;
			zipCode?: string;
			ip: string;
		};
		shippingAddress: {
			contactName: string;
			address: string;
			city: string;
			country: string;
			zipCode?: string;
		};
		billingAddress: {
			contactName: string;
			address: string;
			city: string;
			country: string;
			zipCode?: string;
		};
		basketItems: {
			id: string;
			price: number;
			name: string;
			category1: string;
			category2?: string; //optional
			itemType: BasketItemType;
			subMerchantKey: string;
			subMerchantPrice: number;
		}[];
	}): Promise<string> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/payment/3dsecure/initialize");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		if (!params.installment) {
			params.installment = 1;
		}

		params.price = formatPrice(params.price) as any;
		params.paidPrice = formatPrice(params.paidPrice) as any;
		params.basketItems.forEach((item) => {
			item.price = formatPrice(params.paidPrice) as any;
			item.subMerchantPrice = formatPrice(params.paidPrice) as any;
		});

		const response = await sendHttpsRequest({
			body: JSON.stringify(params),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertJsonToUrlPathParameters(params),
						randomString,
						secretKey: this.secretKey,
					}),
					"content-type": "application/json",
				},
			} as https.RequestOptions,
		});
		const responseJson = JSON.parse(response);
		if (responseJson.errorMessage) {
			throw new Error(responseJson.errorMessage);
		}
		return Buffer.from(JSON.parse(response).threeDSHtmlContent, "base64").toString();
	}
}

/**
 *
 * @param params.data xml CC5Request
 * @returns xml result
 */
const sendHttpsRequest = async (params: { body: string; options: https.RequestOptions }): Promise<string> => {
	console.log(JSON.stringify(params.options, null, 4));
	console.log(JSON.stringify(params.body, null, 4));
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
