export const createDomain = (request: Request) => {
	const headers = request.headers;
	const maybeProto = headers.get("x-forwarded-proto");
	const maybeHost = headers.get("host");
	const url = new URL(request.url);

	if (maybeProto) {
		return `${maybeProto}://${maybeHost ?? url.host}`;
	}

	if (url.hostname === "localhost") {
		return `http://${url.host}`;
	}

	return `https://${url.host}`;
};
