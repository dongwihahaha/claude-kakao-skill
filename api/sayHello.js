export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  res.status(200).json({
    version: "2.0",
    template: { outputs: [{ simpleText: { text: "안녕하세요! Claude AI 챗봇입니다! 🤖" } }] }
  });
}
