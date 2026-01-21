/**
 * LLM Service
 * Supports: OpenAI, Anthropic, or Mock
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMProvider {
  generateResponse(messages: Message[]): Promise<string>;
}

class OpenAILLMProvider implements LLMProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: Message[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI LLM failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

class AnthropicLLMProvider implements LLMProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: Message[]): Promise<string> {
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 300,
        system: systemMessage?.content || '',
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic LLM failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }
}

class MockLLMProvider implements LLMProvider {
  async generateResponse(messages: Message[]): Promise<string> {
    console.log('[Mock LLM] Generating response for', messages.length, 'messages');
    
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    return `I hear you saying: "${lastUserMessage.substring(0, 50)}...". This is a mock response. Configure LLM_PROVIDER and API keys to use real AI responses.`;
  }
}

function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'mock';

  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not set, falling back to mock LLM');
        return new MockLLMProvider();
      }
      return new OpenAILLMProvider(process.env.OPENAI_API_KEY);

    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('ANTHROPIC_API_KEY not set, falling back to mock LLM');
        return new MockLLMProvider();
      }
      return new AnthropicLLMProvider(process.env.ANTHROPIC_API_KEY);

    default:
      return new MockLLMProvider();
  }
}

export const llmService = getLLMProvider();