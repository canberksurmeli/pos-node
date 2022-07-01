import { ProcessEnv } from "../src/models/common";
import { Provider, StoreType } from "../src/models/enum";
import { PayNode } from "../src/payment-methods/3d-pay-hosting";

const env = process.env as ProcessEnv;
// let requestRoot = async (req: Request, res: Response): Promise<void> => {};
// let requestSuccess = async (req: Request, res: Response): Promise<void> => {};
// let requestFailure = async (req: Request, res: Response): Promise<void> => {};
// let requestCallback = async (req: Request, res: Response): Promise<void> => {};
// jest.setTimeout(90000000);
// const app = express();
// const httpServer = http.createServer(app);
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());
// app.get("/", requestRoot);
// app.post("/success", requestSuccess);
// app.post("/fail", requestFailure);
// app.post("/callback", requestCallback);
// httpServer.listen(parseInt(env.PORT), () => {
// 	console.log(`Server listening on port ${env.PORT}`);
// });
beforeAll(() => {});

describe("test purchase", () => {
	test("Test 1", async () => {
		const payNode = new PayNode({
			clientId: env.CLIENTID,
			password: env.PASSWORD,
			storeKey: env.STOREKEY,
			storeType: StoreType._3DPayHosting,
			username: env.USERNAME,
			provider: Provider.Asseco,
		});
		const htmlText = await payNode.purchase({
			amount: 10,
			creditCard: {
				number: env.CARD_NUMBER_VISA,
				expireMonth: env.CARD_EXPIRES_MONTH,
				expireYear: env.CARD_EXPIRES_YEAR,
				cvv: env.CARD_CVV,
			},
			callbackUrl: `https://local/callback`,
			failUrl: `https://local/failure`,
			okUrl: `https://local/success`,
		});
		expect(htmlText).toBeTruthy();
	});
});

// describe.skip("3D Pay Hosting", () => {
// 	test.skip("test 1", async () => {
// 		const httpsUrl = await ngrok.connect({
// 			authtoken: env.NGROK_AUTH_TOKEN,
// 			addr: env.PORT,
// 		});
// 		console.info(
// 			"Click on the link to open the 3D Pay Hosting page:",
// 			httpsUrl
// 		);
// 		// await sendRequest(httpsUrl, "GET", {});
// 		//wrap the requestRoot in a promise
// 		requestRoot = async (req: Request, res: Response) => {
// 			const payNode = new PayNode({
// 				clientId: env.CLIENTID,
// 				password: env.PASSWORD,
// 				storeKey: env.STOREKEY,
// 				storeType: StoreType._3DPayHosting,
// 				username: env.USERNAME,
// 				provider: Provider.Asseco,
// 				callbackUrl: `https://${httpsUrl}/callback`,
// 				failUrl: `https://${httpsUrl}/failure`,
// 				okUrl: `https://${httpsUrl}/success`,
// 			});
// 			const htmlText = await payNode.purchase({
// 				amount: 10,
// 				creditCard: {
// 					number: env.CARD_NUMBER_VISA,
// 					expireMonth: env.CARD_EXPIRES_MONTH,
// 					expireYear: env.CARD_EXPIRES_YEAR,
// 					cvv: env.CARD_CVV,
// 				},
// 				storeType: StoreType.PayHosting,
// 			});
// 			res.send(htmlText);
// 		};
// 		requestSuccess = async (req: Request, res: Response) => {
// 			console.log("Success");
// 		};

// 		requestFailure = async (req: Request, res: Response) => {
// 			console.log("3D Secure fail", JSON.stringify(req.body, null, 4));
// 			const body = req.body as _3DPayHostingFailureResponse;
// 			const hashParams = body.HASHPARAMS.split(":").filter(Boolean);
// 			let plainText = "";
// 			for (const key of hashParams) {
// 				plainText += body[key];
// 			}
// 			plainText += process.env.STOREKEY;
// 			const hash = createHash("sha1").update(plainText).digest("base64");
// 			if (hash === body.HASH) {
// 				console.log("[FAIL] HASH OK");
// 			} else {
// 				console.log("[FAIL] HASH FAIL");
// 			}

// 			res.send(req.body);
// 		};

// 		requestCallback = async (req: Request, res: Response) => {
// 			console.log(
// 				"[CALLBACK]3D Secure Callback",
// 				JSON.stringify(req.body, null, 4)
// 			);
// 			const body = req.body as _3DPayHostingCallbackResponse;
// 			const hashParams = body.HASHPARAMS.split(":").filter(Boolean);
// 			let plainText = "";
// 			for (const key of hashParams) {
// 				plainText += body[key];
// 			}
// 			plainText += process.env.STOREKEY;
// 			const hash = createHash("sha1").update(plainText).digest("base64");
// 			if (hash === body.HASH) {
// 				console.log("[CALLBACK]HASH OK");
// 			} else {
// 				console.log("[CALLBACK]HASH FAIL");
// 			}
// 			res.send(req.body);
// 		};
// 		await new Promise((resolve) => {});
// 	});
// });
