import https from "https";
import { Currency, IyzicoOptions } from "../models/common.js";
import { Provider, ProviderUrl } from "../models/enum.js";
import {
	AddCardResponse,
	BasketItemType,
	DeleteCardResponse,
	GetSavedCardsResponse,
	Iyzico3DPaymentResponse,
	IyzicoCard,
	IyzicoPaymentResponse,
	IyzicoStoredCard,
	PaymentChannel,
	PaymentGroup,
} from "../models/iyzico.js";
import {
	convertMapToObject,
	convertMapToUrlPathParameters,
	createHashMapFromObjectForComplete3D,
	createHashMapFromObjectForDeleteSavedCard,
	createHashMapFromObjectForGetSavedCard,
	createHashMapFromObjectForPurchase,
	createHashMapFromObjectForSaveCard,
	formatPrice,
	generateIyzicoAuthorizationHeaderParamV1,
	sendHttpsRequest,
} from "../utils.js";

export class Iyzico {
	public provider: Provider.Iyzico | Provider.IyzicoTest;
	private apiKey: string;
	private secretKey: string;
	public currency: Currency;
	constructor() {
		this.provider = Provider.IyzicoTest;
		this.apiKey = "";
		this.secretKey = "";
		this.currency = "TRY";
	}

	setOptions(options: IyzicoOptions): void {
		this.provider = options.provider;
		this.apiKey = options.apiKey;
		this.secretKey = options.secretKey;
		this.currency = options.currency || "TRY";
	}

	async getSavedCards(params: {
		locale?: string;
		/** A value that you can send and receive during the request can be used to match the request/response. */
		conversationId?: string;
		cardUserKey: string;
	}): Promise<GetSavedCardsResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/cardstorage/cards");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		const map = createHashMapFromObjectForGetSavedCard(params);
		const result = await sendHttpsRequest({
			body: JSON.stringify(convertMapToObject(map)),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertMapToUrlPathParameters(map),
						randomString,
						secretKey: this.secretKey,
					}),
					"content-type": "application/json",
				},
			} as https.RequestOptions,
		});
		return JSON.parse(result) as GetSavedCardsResponse;
	}

	async saveCard(params: {
		card: {
			alias?: string;
			holderName: string;
			number: string;
			expireMonth: string;
			expireYear: string;
		};
		/** if user already have a key */
		userKey?: string;
		/** @required if cardUserKey is not provided */
		email?: string;
		/** The id given by the authority to the card to be stored. */
		externalId?: string;
		locale?: string;
		/** A value that you can send and receive during the request can be used to match the request/response. */
		conversationId?: string;
	}): Promise<AddCardResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/cardstorage/card");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		const map = createHashMapFromObjectForSaveCard(params);
		const result = await sendHttpsRequest({
			body: JSON.stringify(convertMapToObject(map)),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertMapToUrlPathParameters(map),
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
		cardToken: string;
		cardUserKey: string;
		conversationId?: string;
		locale?: string;
	}): Promise<DeleteCardResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/cardstorage/card");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		const map = createHashMapFromObjectForDeleteSavedCard(params);
		const stringBody = JSON.stringify(convertMapToObject(map));
		const result = await sendHttpsRequest({
			body: stringBody,
			options: {
				hostname,
				path: pathname,
				method: "DELETE",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertMapToUrlPathParameters(map),
						randomString,
						secretKey: this.secretKey,
					}),
					"Content-Length": stringBody.length,
					"Content-Type": "application/json",
				},
			} as https.RequestOptions,
		});
		return JSON.parse(result);
	}

	async purchase(params: {
		locale: "tr" | "en";
		/** orderId */
		conversationId?: string;
		/** total price without discounts @example 1.7*/
		price: number;
		/** price that customer will pay @example 1.2*/
		paidPrice: number;
		/** @default 1*/
		currency: "TRY";
		installment: number;
		paymentChannel: PaymentChannel;
		paymentGroup: PaymentGroup;
		paymentCard: IyzicoCard | IyzicoStoredCard;
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
			subMerchantKey?: string;
			subMerchantPrice?: number;
		}[];
	}): Promise<IyzicoPaymentResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/payment/auth");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		params.price = formatPrice(params.price) as any;
		params.paidPrice = formatPrice(params.paidPrice) as any;
		params.basketItems.forEach((item) => {
			item.price = formatPrice(item.price) as any;
			if (item.subMerchantPrice) item.subMerchantPrice = formatPrice(item.subMerchantPrice) as any;
		});
		const map = createHashMapFromObjectForPurchase(params);
		const result = await sendHttpsRequest({
			body: JSON.stringify(convertMapToObject(map)),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertMapToUrlPathParameters(map),
						randomString,
						secretKey: this.secretKey,
					}),
					"Content-Type": "application/json",
				},
			} as https.RequestOptions,
		});
		return JSON.parse(result);
	}

	public async purchase3D(params: {
		locale: "tr" | "en";
		/** orderId */
		conversationId?: string;
		/** total price without discounts @example 1.7*/
		price: number;
		/** price that customer will pay @example 1.2*/
		paidPrice: number;
		/** @default 1*/
		currency: "TRY";
		installment: number;
		paymentChannel: PaymentChannel;
		paymentGroup: PaymentGroup;
		paymentCard: IyzicoCard | IyzicoStoredCard;
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
			subMerchantKey?: string;
			subMerchantPrice?: number;
		}[];
		/** @example https://test.io/callback */
		callbackUrl: string;
	}): Promise<Iyzico3DPaymentResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/payment/3dsecure/initialize");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		params.price = formatPrice(params.price) as any;
		params.paidPrice = formatPrice(params.paidPrice) as any;
		params.basketItems.forEach((item) => {
			item.price = formatPrice(item.price) as any;
			if (item.subMerchantPrice) item.subMerchantPrice = formatPrice(item.subMerchantPrice) as any;
		});

		const map = createHashMapFromObjectForPurchase(params);
		const response = await sendHttpsRequest({
			body: JSON.stringify(convertMapToObject(map)),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertMapToUrlPathParameters(map),
						randomString,
						secretKey: this.secretKey,
					}),
					"content-type": "application/json",
				},
			} as https.RequestOptions,
		});

		return JSON.parse(response);
	}

	public async complete3D(params: {
		locale?: string;
		conversationId?: string;
		paymentId: string;
		conversationData?: string;
	}): Promise<IyzicoPaymentResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/payment/3dsecure/auth");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);

		const map = createHashMapFromObjectForComplete3D(params);
		const response = await sendHttpsRequest({
			body: JSON.stringify(convertMapToObject(map)),
			options: {
				hostname,
				path: pathname,
				method: "POST",
				headers: {
					/** random header name */
					["x-iyzi-rnd"]: randomString,
					/** client version */
					["x-iyzi-client-version"]: "iyzipay-node-2.0.48",
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertMapToUrlPathParameters(map),
						randomString,
						secretKey: this.secretKey,
					}),
					"content-type": "application/json",
				},
			} as https.RequestOptions,
		});
		return JSON.parse(response);
	}
}
