import https from "https";

//create generic request sender
export const sendRequest = (url: string, method: string, data: any) => {
	return new Promise((resolve, reject) => {
		const req = https.request(url, { method }, (res) => {
			let data = "";
			res.on("data", (chunk) => {
				data += chunk;
			});
			res.on("end", () => {
				resolve(data);
			});
		});
		req.on("error", (err) => {
			reject(err);
		});
		req.write(JSON.stringify(data));
		req.end();
	});
};
