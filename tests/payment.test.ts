import express, { Request, Response } from "express";
import http from "http";
import ngrok from "ngrok";
import { Builder } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import { ProcessEnv } from "../src/models/common";
import { Provider, StoreType } from "../src/models/enum";
import { PayNode } from "../src/payment-methods";

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
	test.skip("3D Pay Hosting", async () => {
		try {
			const url = await ngrok.connect({ addr: parseInt(env.PORT), authtoken: env.NGROK_AUTH_TOKEN });
			const driver = new Builder()
				.forBrowser("chrome")
				.setChromeOptions(new Options().detachDriver(true).excludeSwitches("enable-logging"))
				.build();
			const payNode = new PayNode({
				clientId: env.CLIENTID,
				password: env.PASSWORD,
				storeKey: env.STOREKEY,
				storeType: StoreType._3DPayHosting,
				username: env.USERNAME,
				provider: Provider.Asseco,
			});
			const successResponse = new SyncPoint<void>();
			requestRoot = async (req: Request, res: Response) => {
				const htmlText = await payNode.purchase({
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
			error;
		}
	});

	test("Pay Hosting", async () => {
		const url = await ngrok.connect({ addr: parseInt(env.PORT), authtoken: env.NGROK_AUTH_TOKEN });
		const payNode = new PayNode({
			clientId: env.CLIENTID,
			password: env.PASSWORD,
			storeKey: env.STOREKEY,
			storeType: StoreType.Pay,
			username: env.USERNAME,
			provider: Provider.Asseco,
		});

		const successResponse = new SyncPoint<void>();
		const result = await payNode.purchase({
			amount: 10,
			creditCard: {
				number: env.CARD_NUMBER_MASTERCARD,
				expireMonth: env.CARD_EXPIRES_MONTH,
				expireYear: env.CARD_EXPIRES_YEAR,
				cvv: env.CARD_CVV,
			},
			refreshTime: 3,
			callbackUrl: `${url}/callback`,
			failUrl: `${url}/failure`,
			okUrl: `${url}/success`,
		});
		expect(result).toBeTruthy();
		await successResponse.promise;
		console.log("Test completed");
	});
});

afterAll(() => {
	httpServer.close();
	process.exit(0);
});
