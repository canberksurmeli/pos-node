import { ISO4217CurrencyCode, Provider, ProviderUrl, StoreType, TransactionType } from "./enum";

export type ProcessEnv = {
	CLIENTID: string;
	PASSWORD: string;
	STOREKEY: string;
	USERNAME: string;
	PORT: string;
	NGROK_AUTH_TOKEN: string;
	CARD_NUMBER_VISA: string;
	CARD_NUMBER_MASTERCARD: string;
	CARD_EXPIRES: string;
	CARD_EXPIRES_MONTH: string;
	CARD_EXPIRES_YEAR: string;
	CARD_CVV: string;
};

export type Config = {
	storeType: StoreType;
	provider: Provider;
	clientId: string;
	username: string;
	password: string;
	storeKey: string;
	/**  @default "tr" */
	lang?: "tr" | "en";
};

export type HTMLFormData = {
	form: {
		clientId: string;
		storetype: StoreType;
		islemtipi: TransactionType;
		hash: string;
		amount: number;
		currency: ISO4217CurrencyCode;
		oid: string;
		okUrl: string;
		callbackurl: string;
		failUrl: string;
		lang: "en" | "tr";
		rnd: number;
		pan: string;
		Ecom_Payment_Card_ExpDate_Year: string;
		Ecom_Payment_Card_ExpDate_Month: string;
		cv2: string;
		optionalParams?: Record<string, string>;
	};
	url: ProviderUrl;
};
