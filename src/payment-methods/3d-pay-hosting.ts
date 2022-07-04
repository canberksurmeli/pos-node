import { createHash, randomUUID } from "crypto";
import { Config, HTMLFormData } from "../models/common";
import { ISO4217CurrencyCode, Provider, ProviderUrl, StoreType, TransactionType } from "../models/enum";
import { createHtmlContent } from "../utils";

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
		customParams?: Record<string, string>;
	}): Promise<string> {
		switch (this.storeType) {
			case StoreType._3DPayHosting:
				return this.purchase3DPayHosting(params);
			case StoreType.PayHosting:
			default:
				break;
		}
		return "";
	}

	private async purchase3DPayHosting(params: {
		creditCard?: {
			number?: string;
			expireMonth?: string;
			expireYear?: string;
			cvv?: string;
		};
		amount: number;
		lang?: "en" | "tr";
		okUrl: string;
		failUrl: string;
		callbackUrl: string;
		customParams?: Record<string, string>;
	}) {
		const orderId = randomUUID();
		const rnd = new Date().getTime();
		const data = {
			form: {
				clientId: this.clientId,
				storetype: StoreType._3DPayHosting,
				islemtipi: TransactionType.Auth,
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
				Ecom_Payment_Card_ExpDate_Year: params.creditCard?.expireYear,
				Ecom_Payment_Card_ExpDate_Month: params.creditCard?.expireMonth,
				cv2: params.creditCard?.cvv,
				...params.customParams,
			},
			url: ProviderUrl[this.provider],
		} as HTMLFormData;
		return createHtmlContent(data);
	}
}
