export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [{
        simpleText: {
          text: "안녕하세요! 저는 Claude AI가 탑재된 챗봇입니다! 🤖✨"
        }
      }]
    }
  };

  res.status(200).json(responseBody);
}
