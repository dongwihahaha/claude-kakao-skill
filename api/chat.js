import axios from 'axios';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaudeAPI(userMessage, systemPrompt = '') {
    try {
        const response = await axios.post(CLAUDE_API_URL, {
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userMessage
                }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-12-01'
            },
            timeout: 9000 // Vercel 10초 제한 고려하여 9초로 설정
        });

        if (!response.data?.content?.[0]?.text) {
            throw new Error('AI 응답이 올바르지 않습니다.');
        }

        return response.data.content[0].text;
    } catch (error) {
        console.error('Claude API Error:', error.response?.data || error.message);
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('응답 시간이 초과되었습니다. 다시 시도해주세요.');
        }
        
        if (error.response?.status === 401) {
            throw new Error('API 인증에 실패했습니다.');
        }
        
        if (error.response?.status === 429) {
            throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        }
        
        throw new Error('AI 응답을 생성할 수 없습니다.');
    }
}

export default async function handler(req, res) {
    // CORS 헤더 설정
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
        const userUtterance = req.body.userRequest?.utterance || '안녕하세요';
        
        if (!userUtterance.trim()) {
            throw new Error('메시지가 비어있습니다.');
        }
        
        const systemPrompt = `당신은 친근하고 도움이 되는 한국어 챗봇입니다. 
        사용자의 질문에 간결하고 명확하게 답변해주세요. 
        답변은 100자 이내로 작성해주세요.
        부적절한 질문이나 위험한 내용에 대해서는 정중하게 거절해주세요.`;
        
        const aiResponse = await callClaudeAPI(userUtterance, systemPrompt);
        
        const responseBody = {
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: aiResponse
                        }
                    }
                ]
            }
        };

        return res.status(200).json(responseBody);

    } catch (error) {
        console.error('Chat API Error:', error);
        
        const errorMessage = error.message || "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        
        const errorResponse = {
            version: "2.0",
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: errorMessage
                        }
                    }
                ]
            }
        };

        return res.status(200).json(errorResponse);
    }
}