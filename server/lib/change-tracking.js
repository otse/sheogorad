/**
 * @param {import('express').Response} res
 * @param {import('express').Request} req
 * @param {number} currentVersion
 * @param {() => unknown} buildPayload
 */
export function sendVersioned(res, req, currentVersion, buildPayload) {
	const knownVersion = Number(req.query.knownVersion);
	if (Number.isFinite(knownVersion) && knownVersion === currentVersion) {
		res.json({ unchanged: true, version: currentVersion });
		return;
	}
	res.json({ unchanged: false, version: currentVersion, data: buildPayload() });
}