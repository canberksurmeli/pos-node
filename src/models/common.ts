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
	API_KEY: string;
	SECRET_KEY: string;
};

export type IyzicoOptions = {
	provider: Provider.Iyzico | Provider.IyzicoTest;
	apiKey: string;
	secretKey: string;
};

export type NestpayOptions = {
	provider: Provider.NestpayTest | Provider.Ziraat;
	storeType: StoreType;
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
		islemTipi: TransactionType;
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
		cardExpDateYear: string;
		cardExpDateMonth: string;
		cv2: string;
		refreshTime?: number;
		optionalParams?: Record<string, string>;
	};
	url: ProviderUrl;
};
