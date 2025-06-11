import axios from 'axios';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaudeAPI(userMessage, systemPrompt = '') {
    try {
        const response = await axios.post(CLAUDE_API_URL, {
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            timeout: 8000
        });

        return response.data.content[0].text;
    } catch (error) {
        console.error('Claude API Error:', error.response?.data || error.message);
        throw new Error('AI 응답을 생성할 수 없습니다.');
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const userUtterance = req.body.userRequest?.utterance || '';
        
        const systemPrompt = `당신은 전문 번역가입니다. 
        사용자가 입력한 텍스트를 다음 규칙에 따라 번역해주세요:
        - 한국어면 영어로 번역
        - 영어면 한국어로 번역
        - 다른 언어면 한국어로 번역
        번역 결과만 제공하고 추가 설명은 하지 마세요.`;
        
        const aiResponse = await callClaudeAPI(userUtterance, systemPrompt);
        
        const responseBody = {
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: `번역 결과: ${aiResponse}`
                        }
                    }
                ]
            }
        };

        return res.status(200).json(responseBody);

    } catch (error) {
        console.error('Translate API Error:', error);
        
        const errorResponse = {
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: "번역 중 오류가 발생했습니다. 다시 시도해주세요."
                        }
                    }
                ]
            }
        };

        return res.status(200).json(errorResponse);
    }
}