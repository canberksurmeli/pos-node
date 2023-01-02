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

export type AddCardResponse = {
	conversationId: string;
	email: string;
	errorCode: string;
	errorMessage: string;
	externalId: string;
	locale: string;
	status: string;
	systemTime: number;
};

export type DeleteCardResponse = {
	status: string;
	errorCode: string;
	errorMessage: string;
    errorGroup: string;
	locale: string;
	systemTime: number;
	conversationId: string;
};
