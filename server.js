const express = require("express");

const app = express();

app.use((req, res, next) => {
	// helpful headers:
	res.set("Strict-Transport-Security", `max-age=${60 * 60 * 24 * 365 * 100}`);
	res.set("X-Frame-Options", "SAMEORIGIN");
	res.set("Referrer-Policy", "origin");
	res.set("Cache-Control", "no-cache");

	// /clean-urls/ -> /clean-urls
	if (req.path.endsWith("/") && req.path.length > 1) {
		const query = req.url.slice(req.path.length);
		const safepath = req.path.slice(0, -1);

		res.redirect(301, safepath + query);
		return;
	}
	next();
});

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.info(`✅ app ready: http://localhost:${port}`);
});