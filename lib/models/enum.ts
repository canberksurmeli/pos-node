export enum StoreType {
	_3DPayHosting = "3d_pay_hosting",
	PayHosting = "pay_hosting",
}

export enum Mode {
	Test = "T",
	Production = "P",
}

export enum Provider {
	Asseco = "Asseco",
	Ziraat = "Ziraat",
}

export enum ProviderUrl {
	Asseco = "https://testvpos.asseco-see.com.tr/fim/api",
	Ziraat = "https://sanalpos2.ziraatbank.com.tr/fim/api",
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

export enum ProcReturnCode {
	Success = "00",
	Error = "99",
}

export enum Response {
	Approved = "Approved",
    Decline = "Decline",
    Error = "Error",
}
