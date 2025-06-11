export default function handler(req, res) { res.json({status: "OK", timestamp: new Date().toISOString()}); }
