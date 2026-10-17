import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	removeNSPrefix: true,
	parseTagValue: false,
});

function parseRates(resXml) {
	const envelope = parser.parse(resXml);
	const innerXml =
		envelope.Envelope.Body.GetCurrentExchangeRatesResponse.GetCurrentExchangeRatesResult;

	const inner = parser.parse(innerXml);
	const day = inner.MNBCurrentExchangeRates.Day;

	return {
		date: day["@_date"],
		rates: [day.Rate].flat().map((r) => ({
			curr: r["@_curr"],
			unit: Number(r["@_unit"]),
			value: Number(r["#text"].replace(",", ".")),
		})),
	};
}

/**
 * GET /api/rates
 * Endpoint for getting currency rates against HUF from MNB by SOAP
 * @param {Request} req
 * @param {Response} res
 */
export default async function handler(req, res) {
	console.log("GET /api/rates req.method", req?.method);

	const { method = "GET" } = req;
	if (method == "GET") {
		const endpoint = `http://www.mnb.hu/arfolyamok.asmx`;
		const reqBodyXml = `<?xml version="1.0" encoding="UTF-8"?>
							<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
								<soap:Body>
									<GetCurrentExchangeRates xmlns="http://www.mnb.hu/webservices/"></GetCurrentExchangeRates>
								</soap:Body>
							</soap:Envelope>`;
		const soapRes = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "text/xml",
				SOAPAction:
					'"http://www.mnb.hu/webservices/MNBArfolyamServiceSoap/GetCurrentExchangeRates"',
			},
			body: reqBodyXml,
		});
		console.log("soapRes", soapRes);

		if (!soapRes.ok) return res.status(soapRes.status).json({ error: soapRes.statusText });

		const resXml = await soapRes.text();
		console.log("resXml: ", resXml);

		const parsed = parseRates(resXml);
		console.log("parsed: ", parsed);

		const { date = new Date(Date.now()), rates = [] } = parsed;
		return res.status(200).json({ date, rates });
	} else {
		return res.status(405).json({ error: "Method Not Allowed" });
	}
}
