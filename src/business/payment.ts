import { Provider } from "../models/enum.js";
import { Iyzico } from "./iyzico.js";
import { Nestpay } from "./nestpay.js";

export class PaymentFactory {
	static createPaymentMethod<P extends Provider>(
		provider: P
	): {
		[Provider.Iyzico]: Iyzico;
		[Provider.IyzicoTest]: Iyzico;
		[Provider.NestpayTest]: Nestpay;
		[Provider.Ziraat]: Nestpay;
	}[P] {
		switch (provider) {
			case Provider.Iyzico:
			case Provider.IyzicoTest:
				return new Iyzico() as any;
			case Provider.NestpayTest:
			case Provider.Ziraat:
				return new Nestpay() as any;
			default:
				throw new Error("Unsupported payment type");
		}
	}
}
