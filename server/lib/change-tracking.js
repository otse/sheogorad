// Shared helper for the "did this change?" pattern: the client sends the
// version it last saw (?knownVersion=), and gets back either a cheap
// { unchanged: true } or the full, current payload.

export function sendVersioned(res, req, currentVersion, buildPayload) {
	const knownVersion = Number(req.query.knownVersion);
	if (Number.isFinite(knownVersion) && knownVersion === currentVersion) {
		res.json({ unchanged: true, version: currentVersion });
		return;
	}
	res.json({ unchanged: false, version: currentVersion, data: buildPayload() });
}
