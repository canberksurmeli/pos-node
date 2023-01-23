import { Currency } from "./common.js";

export enum PaymentChannel {
	MOBILE = "MOBILE",
	WEB = "WEB",
	MOBILE_WEB = "MOBILE_WEB",
	MOBILE_IOS = "MOBILE_IOS",
	MOBILE_ANDROID = "MOBILE_ANDROID",
	MOBILE_WINDOWS = "MOBILE_WINDOWS",
	MOBILE_TABLET = "MOBILE_TABLET",
	MOBILE_PHONE = "MOBILE_PHONE",
}

export enum PaymentGroup {
	PRODUCT = "PRODUCT",
	LISTING = "LISTING",
	SUBSCRIPTION = "SUBSCRIPTION",
}

export enum BasketItemType {
	PHYSICAL = "PHYSICAL",
	VIRTUAL = "VIRTUAL",
}

export enum SubMerchantType {
	PERSONAL = "PERSONAL",
	PRIVATE_COMPANY = "PRIVATE_COMPANY",
	LIMITED_OR_JOINT_STOCK_COMPANY = "LIMITED_OR_JOINT_STOCK_COMPANY",
}

export type Status = "success" | "failure";
export type CardType = "CREDIT_CARD" | "DEBIT_CARD" | "PREPAID_CARD";
export type CardAssociation = "VISA" | "MASTER_CARD" | "AMERICAN_EXPRESS";
export type CardFamily = "Bonus" | "Axess" | "World" | "Maximum" | "Paraf" | "CardFinans";
export type IyzicoPaymentRequest = {
	locale: string;
	conversationId: string;
	price: string;
	paidPrice: number;
	installment: number;
	paymentChannel: PaymentChannel;
	basketId: string;
	paymentGroup: PaymentGroup;
	paymentCard: {
		cardHolderName: string;
		cardNumber: string;
		expireYear: string;
		expireMonth: string;
		cvc: string;
		registerCard: number;
	};
	buyer: {
		id: string;
		name: string;
		surname: string;
		identityNumber: string;
		email: string;
		gsmNumber: string;
		registrationDate: string;
		lastLoginDate: string;
		registrationAddress: string;
		city: string;
		country: string;
		zipCode: string;
		ip: string;
	};
	shippingAddress: {
		address: string;
		zipCode: string;
		contactName: string;
		city: string;
		country: string;
	};
	billingAddress: {
		address: string;
		zipCode: string;
		contactName: string;
		city: string;
		country: string;
	};
	basketItems: {
		id: string;
		price: string;
		name: string;
		category1: string;
		category2: string;
		itemType: BasketItemType;
	}[];
	currency: string;
};

export type IyzicoPaymentResponse = {
	authCode: string;
	binNumber: string;
	cardAssociation?: CardAssociation;
	cardToken?: string;
	cardUserKey?: string;
	cardFamily?: CardFamily;
	cardType?: CardType;
	conversationId?: string;
	currency: string;
	fraudStatus: number;
	hostReference: string;
	installment: number;
	itemTransactions: {
		blockageRate: number;
		blockageRateAmountMerchant: number;
		blockageRateAmountSubMerchant: number;
		/** e.g. format "2023-01-31 00:00:00" */
		blockageResolvedDate: Date;
		convertedPayout: {
			blockageRateAmountMerchant: number;
			blockageRateAmountSubMerchant: number;
			currency: Currency;
			iyziCommissionFee: number;
			iyziCommissionRateAmount: number;
			iyziConversionRate: number;
			iyziConversionRateAmount: number;
			merchantPayoutAmount: number;
			paidPrice: number;
			subMerchantPayoutAmount: number;
		};
		itemId: string;
		iyziCommissionFee: number;
		iyziCommissionRateAmount: number;
		merchantCommissionRate: number;
		merchantCommissionRateAmount: number;
		merchantPayoutAmount: number;
		paidPrice: number;
		paymentTransactionId: string;
		price: number;
		subMerchantKey: string;
		subMerchantPayoutAmount: number;
		subMerchantPayoutRate: number;
		subMerchantPrice: number;
		transactionStatus: number;
	}[];
	iyziCommissionFee: number;
	iyziCommissionRateAmount: number;
	lastFourDigits: string;
	locale: string;
	merchantCommissionRate: number;
	merchantCommissionRateAmount: number;
	paidPrice: number;
	paymentId: string;
	phase: string;
	price: number;
	status: Status;
	systemTime: number;
	errorCode?: string;
	errorMessage?: string;
	errorGroup?: string;
};

export type Iyzico3DPaymentResponse = {
	conversationId?: string;
	errorCode?: string;
	errorMessage?: string;
	locale: string;
	threeDSHtmlContent?: string;
	status: Status;
	systemTime: number;
	/** base64 format html content */
};

export type Iyzico3DPaymentCallbackResponse = {
	conversationData: string;
	conversationId: string;
	mdStatus: string;
	paymentId: string;
	status: Status;
};

export type IyzicoCard = {
	cardHolderName: string;
	cardNumber: string;
	expireYear: string;
	expireMonth: string;
	cvc: string;
	/** 0-Do not Register 1-register @default 0 */
	registerCard?: number;
};

export type IyzicoStoredCard = {
	cardUserKey: string;
	cardToken: string;
	/** 0-Do not Register 1-register @default 0 */
	registerCard?: number;
};

export type GetSavedCardsResponse = {
	cardDetails: {
		/** first 8 digit of the card */
		binNumber: string;
		cardAlias: string;
		cardAssociation: CardAssociation;
		cardBankCode?: number;
		cardBankName?: string;
		cardFamily?: string;
		cardToken: string;
		cardType?: CardType;
		lastFourDigits: string;
	}[];
	carduserKey: string;
	conversationId?: string;
	email: string;
	errorCode?: string;
	errorMessage?: string;
	externalId: string;
	locale: string;
	status: Status;
	systemTime: number;
};

export type AddCardResponse = {
	/** first 6 digit of the card */
	binNumber: string;
	cardAlias: string;
	cardAssociation: CardAssociation;
	cardBankCode?: number;
	cardBankName?: string;
	cardFamily?: string;
	cardToken: string;
	cardType?: CardType;
	cardUserKey: string;
	conversationId?: string;
	email: string;
	errorCode?: string;
	errorMessage?: string;
	externalId: string;
	locale: string;
	status: Status;
	systemTime: number;
};

export type DeleteCardResponse = {
	conversationId?: string;
	errorCode: string;
	errorMessage: string;
	errorGroup: string;
	locale: string;
	status: Status;
	systemTime: number;
};
