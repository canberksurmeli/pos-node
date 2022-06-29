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
	/** e.g. https://example.com/success */
	okUrl: string;
	/** e.g. https://example.com/failure */
	failUrl: string;
	/** e.g. https://example.com/callback */
	callbackUrl: string;
	/**  @default "tr" */
	lang?: "tr" | "en";
};

// export abstract class AbstractPayNode {
// 	abstract storeType: StoreType;
// 	abstract provider: Provider;
// 	abstract clientId: string;
// 	abstract username: string;
// 	abstract password: string;
// 	abstract storeKey: string;
// 	/** e.g. https://example.com/success */
// 	private okUrl: string;
// 	/** e.g. https://example.com/failure */
// 	abstract failUrl: string;
// 	/** e.g. https://example.com/callback */
// 	abstract callbackUrl: string;
// 	/**  @default "tr" */
// 	abstract lang?: "tr" | "en";
// 	abstract purchase(params: {
// 		creditCardNumber?: string;
// 		creditCardExpireMonth?: string;
// 		creditCardExpireYear?: string;
// 		creditCardCVV?: string;
// 		amount: number;
// 		/** e.g. 3DPayHosting, PayHosting, Pay */
// 		storeType: StoreType;
// 		customParams: Record<string, unknown>;
// 	}): Promise<string>;
// }
