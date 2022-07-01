const fs = require("fs"); // promise version of require('fs');

async function cleanDirectory(directory) {
	try {
		await fs
			.readdir(directory)
			.then((files) =>
				Promise.all(
					files.map((file) => fs.unlink(`${directory}/${file}`))
				)
			);
	} catch (err) {
		console.log(err);
	}
}

cleanDirectory("./dist");
