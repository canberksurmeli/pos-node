import { Provider } from "../models/enum.js";
import { Asseco } from "../payment.js";
import { Iyzico } from "./iyzico.js";

export class PaymentFactory {
	static createPaymentMethod<P extends Provider>(
		provider: P
	): {
		[Provider.Iyzico]: Iyzico;
		[Provider.IyzicoTest]: Iyzico;
		[Provider.AssecoTest]: Asseco;
		[Provider.Ziraat]: Asseco;
	}[P] {
		switch (provider) {
			case Provider.Iyzico:
			case Provider.IyzicoTest:
				return new Iyzico() as any;
			case Provider.AssecoTest:
			case Provider.Ziraat:
				return new Asseco() as any;
			default:
				throw new Error("Unsupported payment type");
		}
	}
}
