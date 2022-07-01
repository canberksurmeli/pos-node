import { Provider, StoreType } from "./enum";

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
