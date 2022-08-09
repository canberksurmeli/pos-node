export enum StoreType {
	_3DPayHosting = "3d_pay_hosting",
	PayHosting = "pay_hosting",
	Pay = "pay",
}

export enum Mode {
	Test = "T",
	Production = "P",
}

export enum Provider {
	Asseco = "Asseco",
	Ziraat3D = "Ziraat3D",
	Asseco3D = "Asseco3D",
}
export enum ProviderUrl {
	Asseco3D = "https://entegrasyon.asseco-see.com.tr/fim/est3Dgate",
	Asseco = "https://entegrasyon.asseco-see.com.tr/fim/api",
	Ziraat3D = "https://sanalpos2.ziraatbank.com.tr/fim/est3Dgate",
}

export enum TransactionType {
	Auth = "Auth",
	PreAuth = "PreAuth",
	PostAuth = "PostAuth",
	Void = "Void",
	Credit = "Credit",
}

export enum ISO4217CurrencyCode {
	TRY = 949,
}

/**
 * Not includes all possible values.
 */
export enum ProcReturnCode {
	Success = 0,
	CallYourBank = 1,
	CallYourBankO = 2,
	InvalidBusiness = 3,
	HandOverTheCard = 4,
	DoNotHONOR = 5,
	ErrorWarningFolderD = 6,
	HandOverTheCardSpecial = 7,
	ApproveWithCredentialRequired = 8,
	PinTryAgain = 9,
	Successfull = 11,
	InvalidOperation = 12,
	InvalidAmount = 13,
	InvalidCardNumber = 14,
	NoInterlocutorBank = 15,
	InvalidOperation2 = 18,
	TryAgain = 19,
	DenyHandOverTheCard = 33,
	CounterfeitCard = 34,
	LimitedCardHandOver = 36,
	HandOverTheCard2 = 38,
	MissingCardHandOver = 41,
	StolenCardHandOver = 43,
	UnsufficentFunds = 51,
	ExpiredCard = 54,
	UnknownError = 99,
}

export enum Response {
	Approved = "Approved",
	Decline = "Decline",
	Error = "Error",
}
