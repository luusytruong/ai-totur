import OpenAI from 'openai';
import { ChatModel } from 'openai/resources.js';

type Message = { role: 'user' | 'assistant'; content: string };

type ChatResponse = {
  content: string;
  tokensUsed: number;
};

const MAX_COMPLETION_TOKENS = 2048;

export class AiService {
  private readonly client: OpenAI | null;
  // private readonly model: ChatModel = 'gpt-5-mini';
  private readonly chatModel: ChatModel = 'gpt-5-mini';
  private readonly titleModel: ChatModel = 'gpt-4o-mini';

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.client = apiKey ? new OpenAI({ apiKey }) : null;
  }

  async chat(systemPrompt: string, history: Message[], userMessage: string): Promise<ChatResponse> {
    if (!this.client) return this.mockResponse(userMessage);

    const msgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const response = await this.client.chat.completions.create({
      model: this.chatModel,
      messages: msgs,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      stream: false,
    });

    return {
      content: response.choices[0]?.message.content ?? '',
      tokensUsed: response.usage?.total_tokens ?? 0,
    };
  }

  async chatStream(
    systemPrompt: string,
    history: Message[],
    userMessage: string,
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    if (!this.client) {
      const { content } = this.mockResponse(userMessage);
      for (const word of content.split(' ')) {
        onChunk(word + ' ');
        await new Promise((r) => setTimeout(r, 30));
      }
      return;
    }

    const msgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const stream = await this.client.chat.completions.create({
      model: this.chatModel,
      messages: msgs,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) onChunk(delta);
    }
  }

  async generateConversationTitle(
    firstMessage: string,
  ): Promise<{ title: string; inTokens: number; outTokens: number }> {
    const fallbackTitle = this.fallbackTitle(
      firstMessage.substring(0, 50).charAt(0).toUpperCase() + firstMessage.substring(1),
    );

    if (!this.client) {
      return { title: fallbackTitle, inTokens: 0, outTokens: 0 };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.titleModel,
        stream: false,
        max_tokens: 24,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'Bạn là AI Tutor chuyên tóm tắt nội dung cuộc trò chuyện thành tiêu đề ngắn gọn TỐI ĐA 6 TỪ dưới dạng một CỤM DANH TỪ. Tuyệt đối KHÔNG trả lời như một chatbot, KHÔNG trích dẫn lại câu hỏi gốc, KHÔNG dùng dấu ngoặc kép.',
          },
          {
            role: 'user',
            content: 'Tin nhắn: vòng lặp là gì',
          },
          { role: 'assistant', content: 'Tìm hiểu về vòng lặp' },
          { role: 'user', content: 'Tin nhắn: chào cu, mày là ai' },
          { role: 'assistant', content: 'Chào hỏi vui vẻ' },
          {
            role: 'user',
            content: `Tin nhắn: ${firstMessage}`,
          },
        ],
      });

      const title = response.choices[0]?.message.content?.trim();
      return {
        title: title ? this.normalizeTitle(title) : fallbackTitle,
        inTokens: response.usage?.prompt_tokens ?? 0,
        outTokens: response.usage?.completion_tokens ?? 0,
      };
    } catch {
      return { title: fallbackTitle, inTokens: 0, outTokens: 0 };
    }
  }

  private normalizeTitle(title: string): string {
    let normalized = title
      .replace(/^["'\s]+|["'\s]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (normalized.length > 0) {
      normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
    return normalized.slice(0, 120) || 'Untitled';
  }

  private fallbackTitle(firstMessage: string): string {
    const normalized = firstMessage.replace(/\s+/g, ' ').trim();
    if (!normalized) return 'Untitled';
    return normalized.length > 60 ? `${normalized.slice(0, 57).trimEnd()}...` : normalized;
  }

  private mockResponse(userMessage: string): ChatResponse {
    const responses = [
      `Câu hỏi của bạn về "${userMessage.substring(0, 50)}" rất hay! Hãy bắt đầu bằng cách hiểu khái niệm cơ bản...`,
      `Để giải quyết vấn đề này, bạn cần chú ý đến logic xử lý và cấu trúc dữ liệu phù hợp.`,
      `Đây là một bài toán thú vị! Gợi ý: hãy chia nhỏ vấn đề thành các bước nhỏ hơn.`,
    ];
    const content = responses[Math.floor(Math.random() * responses.length)] ?? responses[0] ?? '';
    return { content, tokensUsed: 0 };
  }
}
