import { createHash, randomUUID } from "crypto";
import ejs from "ejs";
import { readFileSync } from "fs";
import path from "path";
import { Config } from "../models/common";
import {
	ISO4217CurrencyCode,
	Provider,
	ProviderUrl,
	StoreType,
	TransactionType,
} from "../models/enum";

export class PayNode {
	private storeType: StoreType;
	private provider: Provider;
	private clientId: string;
	private username: string;
	private password: string;
	private storeKey: string;
	private lang?: "tr" | "en";
	constructor(config: Config) {
		this.storeType = config.storeType;
		this.provider = config.provider;
		this.clientId = config.clientId;
		this.username = config.username;
		this.password = config.password;
		this.storeKey = config.storeKey;
		this.lang = config.lang || "tr";
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
		amount: number;
		/** e.g. https://example.com/success */
		okUrl: string;
		/** e.g. https://example.com/failure */
		failUrl: string;
		/** e.g. https://example.com/callback */
		callbackUrl: string;
		// customParams?: Record<string, unknown>;
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
		okUrl: string;
		failUrl: string;
		callbackUrl: string;
		// customParams?: Record<string, unknown>;
	}) {
		const orderId = randomUUID();
		const rnd = new Date().getTime();
		const data = {
			form: {
				clientId: this.clientId,
				storetype: StoreType._3DPayHosting,
				islemtipi: TransactionType.Auth,
				hash: "",
				amount: params.amount,
				currency: ISO4217CurrencyCode.TRY,
				oid: orderId,
				okUrl: params.okUrl,
				callbackurl: params.callbackUrl,
				failUrl: params.failUrl,
				lang: this.lang,
				rnd,
				pan: params.creditCard?.number,
				Ecom_Payment_Card_ExpDate_Year: params.creditCard?.expireYear,
				Ecom_Payment_Card_ExpDate_Month: params.creditCard?.expireMonth,
				cv2: params.creditCard?.cvv,
				//...params.customParams,
			},
			url: ProviderUrl[this.provider],
		};
		data.form.hash = createHash("sha1")
			.update(
				data.form.clientId +
					data.form.oid +
					data.form.amount +
					data.form.okUrl +
					data.form.failUrl +
					data.form.islemtipi +
					data.form.rnd +
					data.form.callbackurl +
					this.storeKey
			)
			.digest("base64");
		return ejs.render(
			readFileSync(
				path.resolve(__dirname, "..", "assets", "3d_pay_hosting.html"),
				"utf8"
			),
			data
		);
	}
}