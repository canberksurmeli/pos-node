import express, { Request, Response } from "express";
import http from "http";
import ngrok from "ngrok";
import { Builder } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { BasketItemType, PaymentChannel, PaymentFactory, PaymentGroup, Provider, StoreType } from "../src/index";
import { ProcessEnv } from "../src/models/common";

jest.setTimeout(60 * 1000);
const env = process.env as ProcessEnv;
let httpServer: http.Server;

let requestRoot = async (req: Request, res: Response) => {
	res.send("default root!");
};

let requestSuccess = async (req: Request, res: Response) => {
	res.send("default success");
};

let requestFailure = async (req: Request, res: Response) => {
	res.send("default failure");
};

let requestCallback = async (req: Request, res: Response) => {
	res.send("default callback");
};

export class SyncPoint<T> {
	public readonly promise: Promise<T>;
	private resolveFn!: (value: T | PromiseLike<T>) => void;
	private rejectFn!: (reason?: any) => void;

	public constructor() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolveFn = resolve;
			this.rejectFn = reject;
		});
	}

	public reject(reason?: any): void {
		this.rejectFn(reason);
	}

	public resolve(param: T): void {
		this.resolveFn(param);
	}

	public sleep(duration: number): Promise<T> {
		setTimeout(() => {
			this.resolveFn(null as any);
		}, duration);
		return this.promise;
	}
}
beforeAll(() => {
	const app = express();
	httpServer = http.createServer(app);
	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.get("/", async (req: Request, res: Response) => {
		requestRoot(req, res);
	});
	app.post("/success", async (req: Request, res: Response) => {
		requestSuccess(req, res);
	});
	app.post("/fail", async (req: Request, res: Response) => {
		requestFailure(req, res);
	});
	app.post("/callback", async (req: Request, res: Response) => {
		requestCallback(req, res);
	});
	app.get("/test", (req, res) => {
		res.send("test");
	});
	httpServer.listen(parseInt(env.PORT), () => {
		console.log(`Server listening on port ${env.PORT}`);
	});
});

describe("test purchase", () => {
	test.skip("Asseco 3D Pay Hosting", async () => {
		try {
			const url = await ngrok.connect({ addr: parseInt(env.PORT), authtoken: env.NGROK_AUTH_TOKEN });
			const driver = new Builder()
				.forBrowser("chrome")
				.setChromeOptions(new Options().detachDriver(true).excludeSwitches("enable-logging"))
				.build();
			const asseco = PaymentFactory.createPaymentMethod(Provider.AssecoTest);
			asseco.setOptions({
				clientId: env.CLIENTID,
				password: env.PASSWORD,
				storeKey: env.STOREKEY,
				storeType: StoreType._3DPayHosting,
				username: env.USERNAME,
				provider: Provider.AssecoTest,
			});
			const successResponse = new SyncPoint<void>();
			requestRoot = async (req: Request, res: Response) => {
				const htmlText = await asseco.purchase3D({
					amount: 10,
					creditCard: {
						number: env.CARD_NUMBER_VISA,
						expireMonth: env.CARD_EXPIRES_MONTH,
						expireYear: env.CARD_EXPIRES_YEAR,
						cvv: env.CARD_CVV,
					},
					refreshTime: 5,
					callbackUrl: `${url}/callback`,
					failUrl: `${url}/failure`,
					okUrl: `${url}/success`,
				});
				expect(htmlText).toBeTruthy();
				res.send(htmlText);
			};
			requestSuccess = async (req: Request, res: Response): Promise<void> => {
				res.status(200).send("Test payment successfully completed");
				successResponse.resolve();
			};
			requestFailure = async (req: Request, res: Response): Promise<void> => {
				res.status(200).send("Test payment failed. (Probably dut to invalid parameter)");
			};
			requestCallback = async (req: Request, res: Response): Promise<void> => {
				res.status(200).send("Test Callback received");
			};

			await driver.get(`${url}`);
			await successResponse.promise;
		} catch (error) {
			throw error;
		}
	});

	test.skip("Asseco Pay Hosting", async () => {
		const asseco = PaymentFactory.createPaymentMethod(Provider.AssecoTest);
		asseco.setOptions({
			clientId: env.CLIENTID,
			password: env.PASSWORD,
			storeKey: env.STOREKEY,
			storeType: StoreType.Pay,
			username: env.USERNAME,
			provider: Provider.AssecoTest,
		});
		const successResponse = new SyncPoint<void>();
		const result = await asseco.purchase({
			amount: 10,
			creditCard: {
				number: env.CARD_NUMBER_MASTERCARD,
				expireMonth: env.CARD_EXPIRES_MONTH,
				expireYear: env.CARD_EXPIRES_YEAR,
				cvv: env.CARD_CVV,
			},
			refreshTime: 3,
		});
		expect((result as any).CC5Response.Response).toBe("Approved");
		await successResponse.promise;
		console.log("Test completed");
	});
	test("Iyzico payment", async () => {
		const iyzico = PaymentFactory.createPaymentMethod(Provider.IyzicoTest);

		iyzico.setOptions({
			apiKey: env.API_KEY,
			provider: Provider.IyzicoTest,
			secretKey: env.SECRET_KEY,
		});

		const response = await iyzico.purchase({
			locale: "tr",
			conversationId: "4e16ec3d-846a-4bb2-ab8c-0ef2975107e7",
			price: 0.5,
			paidPrice: 0.5,
			installment: 1,
			paymentChannel: PaymentChannel.MOBILE,
			paymentGroup: PaymentGroup.PRODUCT,
			paymentCard: {
				cardHolderName: "John Doe",
				cardNumber: "5528790000000008",
				expireYear: "2030",
				expireMonth: "12",
				cvc: "123",
			},
			buyer: {
				id: "66ccb7f5-db05-439d-b371-3bf168ad6b94",
				name: "Sadri",
				surname: "Alışık",
				identityNumber: "45454545445",
				email: "sadri.alisik@startrek.com",
				gsmNumber: "5301234567",
				registrationDate: "2022-10-04 07:19:38.403",
				lastLoginDate: "2022-10-04 07:19:38.403",
				registrationAddress: "Ankara",
				city: "Ankara",
				country: "Tc",
				ip: "192.168.11.1",
			},
			shippingAddress: {
				address: "Ankara",
				contactName: "Sadri Alışık",
				city: "Ankara",
				country: "Tc",
			},
			billingAddress: {
				address: "Ankara",
				contactName: "Sadri Alışık",
				city: "Ankara",
				country: "Tc",
			},
			basketItems: [
				{
					id: "0eab2823-801e-4bf5-abc1-94bfb03cc98a",
					price: 0.5,
					name: "Parking Payment",
					category1: "Parking",
					itemType: BasketItemType.VIRTUAL,
					subMerchantKey: "aC26ws15IRkTuTaPFXJ+pnZ3uCs=",
					subMerchantPrice: 0.5,
				},
			],
			currency: "TRY",
		} as any);
		expect(JSON.parse(response).status).toBe("success");
	});
	test.skip("Iyzico 3D Payment", async () => {
		const url = await ngrok.connect({ addr: parseInt(env.PORT), authtoken: env.NGROK_AUTH_TOKEN });
		let driver = new Builder()
			.forBrowser("chrome")
			.setChromeOptions(new Options().detachDriver(true).excludeSwitches("enable-logging"))
			.build();

		const iyzico = PaymentFactory.createPaymentMethod(Provider.Iyzico);
		iyzico.setOptions({
			apiKey: env.API_KEY,
			provider: Provider.IyzicoTest,
			secretKey: env.SECRET_KEY,
		});
		const successResponse = new SyncPoint<void>();
		requestRoot = async (req: Request, res: Response) => {
			const htmlText = await iyzico.purchase3D({
				locale: "tr",
				conversationId: "123456789",
				price: 5,
				paidPrice: 5,
				installment: 1,
				paymentChannel: PaymentChannel.WEB,
				paymentGroup: PaymentGroup.PRODUCT,
				paymentCard: {
					cardHolderName: "John Doe",
					cardNumber: "5528790000000008",
					expireYear: "2030",
					expireMonth: "12",
					cvc: "123",
				},
				buyer: {
					id: "BY789",
					name: "John",
					surname: "Doe",
					identityNumber: "74300864791",
					email: "test.test@armongate.com",
					gsmNumber: "+905349559519",
					registrationDate: "2013-04-21 15:12:09",
					lastLoginDate: "2015-10-05 12:43:35",
					registrationAddress: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
					city: "Istanbul",
					country: "Turkey",
					ip: "192.168.11.1",
				},
				shippingAddress: {
					address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
					contactName: "Jane Doe",
					city: "Istanbul",
					country: "Turkey",
				},
				billingAddress: {
					address: "Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1",
					contactName: "Jane Doe",
					city: "Istanbul",
					country: "Turkey",
				},
				basketItems: [
					{
						id: "BI101",
						price: 5,
						name: "Binocular",
						category1: "Collectibles",
						itemType: BasketItemType.PHYSICAL,
						subMerchantKey: "aC26ws15IRkTuTaPFXJ+pnZ3uCs=",
						subMerchantPrice: 5,
					},
				],
				currency: "TRY",
				callbackUrl: `${url}/callback`,
			});
			expect(htmlText).toBeTruthy();
			res.send(htmlText);
		};
		requestCallback = async (req: Request, res: Response): Promise<void> => {
			res.status(200).send(req.body);
			console.log(req.body);
			expect(req.body.status).toBe("success");
			successResponse.resolve();
		};

		await driver.get(`${url}`);
		await successResponse.promise;
	});
});

afterAll(() => {
	httpServer.close();
	// process.exit(0);
});
