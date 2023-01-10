import https from "https";
import { IyzicoOptions } from "../models/common.js";
import { Provider, ProviderUrl } from "../models/enum.js";
import {
	AddCardResponse,
	BasketItemType,
	DeleteCardResponse,
	GetSavedCardsResponse,
	IyzicoPaymentResponse,
	PaymentChannel,
	PaymentGroup,
} from "../models/iyzico.js";
import {
	convertJsonToUrlPathParameters,
	formatPrice,
	generateIyzicoAuthorizationHeaderParamV1,
	removeEmptyProperties,
	sendHttpsRequest,
} from "../utils.js";

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

	async getSavedCards(params: {
		locale?: string;
		/** A value that you can send and receive during the request can be used to match the request/response. */
		conversationId?: string;
		cardUserKey: string;
	}): Promise<GetSavedCardsResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/cardstorage/cards");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		const body = {
			locale: params.locale,
			conversationId: params.conversationId,
			cardUserKey: params.cardUserKey,
		};
		const clearedBody = removeEmptyProperties(body);
		const result = await sendHttpsRequest({
			body: JSON.stringify(clearedBody),
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
						body: convertJsonToUrlPathParameters(clearedBody),
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
			alias: string;
			holderName: string;
			number: string;
			expireMonth: string;
			expireYear: string;
		};
		/** if user already have a key */
		userKey?: string;
		/** no need if cardUserKey provided */
		email?: string;
		/** The id given by the authority to the card to be stored. */
		externalId?: string;
		locale?: string;
		/** A value that you can send and receive during the request can be used to match the request/response. */
		conversationId?: string;
	}): Promise<AddCardResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/cardstorage/card");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		const body = {
			locale: params.locale,
			conversationId: params.conversationId,
			externalId: params.externalId,
			email: params.email,
			cardUserKey: params.userKey,
			card: {
				cardAlias: params.card.alias,
				cardNumber: params.card.number,
				expireYear: params.card.expireYear,
				expireMonth: params.card.expireMonth,
				cardHolderName: params.card.holderName,
			},
		};
		const clearedBody = removeEmptyProperties(body);
		const result = await sendHttpsRequest({
			body: JSON.stringify(clearedBody),
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
						body: convertJsonToUrlPathParameters(clearedBody),
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

		const body = {
			locale: params.locale,
			conversationId: params.conversationId,
			cardUserKey: params.cardUserKey,
			cardToken: params.cardToken,
		};
		const clearedBody = removeEmptyProperties(body);
		const stringBody = JSON.stringify(clearedBody);
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
						body: convertJsonToUrlPathParameters(clearedBody),
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
			/** 0-Do not Register 1-register @default 0 */
			registerCard?: number;
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
			subMerchantKey?: string;
			subMerchantPrice?: number;
		}[];
	}): Promise<IyzicoPaymentResponse> {
		return this.purchaseBase(params);
	}

	async purchaseWithSavedCard(params: {
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
		/** 0-Do not Register 1-register @default 0*/
		paymentCard: {
			cardUserKey: string;
			cardToken: string;
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
	}): Promise<IyzicoPaymentResponse> {
		return this.purchaseBase(params);
	}

	private async purchaseBase(params: {
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
		/**
		 * @description
		 *
		 * For registed card
		 * @param cardUserKey  required
		 * @param cardToken 	required
		 *
		 * For normal payment
		 * @param cardHolderName required
		 * @param cardNumber 	 required
		 * @param expireYear 	 required
		 * @param expireMonth 	 required
		 * @param cvc 		 	 required
		 *
		 */
		paymentCard: {
			cardUserKey?: string;
			cardToken?: string;
			cardHolderName?: string;
			cardNumber?: string;
			expireYear?: string;
			expireMonth?: string;
			cvc?: string;
			/** 0-Do not Register 1-register @default 0 */
			registerCard?: number;
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
			subMerchantKey?: string;
			subMerchantPrice?: number;
		}[];
	}): Promise<IyzicoPaymentResponse> {
		const { hostname, pathname } = new URL(ProviderUrl[this.provider] + "/payment/auth");
		const randomString = process.hrtime()[0] + Math.random().toString(8).slice(2);
		params.price = formatPrice(params.price) as any;
		params.paidPrice = formatPrice(params.paidPrice) as any;
		params.basketItems.forEach((item) => {
			item.price = formatPrice(params.paidPrice) as any;
			item.subMerchantPrice = formatPrice(params.paidPrice) as any;
		});

		const result = await sendHttpsRequest({
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
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
						apiKey: this.apiKey,
						body: convertJsonToUrlPathParameters(params),
						randomString,
						secretKey: this.secretKey,
					}),
					"Content-Type": "application/json",
				},
			} as https.RequestOptions,
		});
		return JSON.parse(result);
	}

	private async purchase3DBase(params: {
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
			cardHolderName?: string;
			cardNumber?: string;
			expireYear?: string;
			expireMonth?: string;
			cvc?: string;
			cardUserKey?: string;
			cardToken?: string;
			/** 0-Do not Register 1-register @default 0 */
			registerCard?: number;
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
			subMerchantKey?: string;
			subMerchantPrice?: number;
		}[];
	}) {
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
					Authorization: generateIyzicoAuthorizationHeaderParamV1({
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
			/** 0-Do not Register 1-register @default 0 */
			registerCard?: number;
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
			subMerchantKey?: string;
			subMerchantPrice?: number;
		}[];
	}): Promise<string> {
		return this.purchase3DBase(params);
	}
	async purchase3DWithSavedCard(params: {
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
			cardUserKey: string;
			cardToken: string;
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
			subMerchantKey?: string;
			subMerchantPrice?: number;
		}[];
	}): Promise<string> {
		return this.purchase3DBase(params);
	}
}