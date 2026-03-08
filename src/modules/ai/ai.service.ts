import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { UsersService } from '../users/users.service'
import OpenAI from 'openai'

export interface CoPilotSuggestion {
  text: string
  type: 'REPLY' | 'STRATEGY' | 'NEXT_ACTION' | 'ALERT'
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  // ================== OPENAI CLIENT ==================

  private async getOpenAIClient(userId: string): Promise<OpenAI> {
    const apiKey = await this.usersService.getDecryptedOpenAIKey(userId)

    if (!apiKey) {
      throw new BadRequestException('Configure sua chave OpenAI em Configurações')
    }

    return new OpenAI({ apiKey })
  }

  // ================== AI RESPONSE (Auto-responder) ==================

  async generateResponse(
    userId: string,
    lead: any,
    conversationHistory: any[],
    incomingMessage: string,
    systemPrompt?: string,
  ): Promise<string | null> {
    try {
      const openai = await this.getOpenAIClient(userId)

      // Build context from lead data
      const leadContext = this.buildLeadContext(lead)

      // Build conversation history for OpenAI
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(systemPrompt, leadContext),
        },
      ]

      // Add conversation history (last 20 messages)
      for (const msg of conversationHistory.slice(-20)) {
        messages.push({
          role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
          content: msg.content,
        })
      }

      // Add current message
      messages.push({ role: 'user', content: incomingMessage })

      // Search for relevant documents (RAG)
      const relevantChunks = await this.searchRelevantDocuments(userId, incomingMessage)
      if (relevantChunks.length > 0) {
        const contextFromDocs = relevantChunks.map(c => c.content).join('\n\n')
        messages[0].content += `\n\nInforma\u00e7\u00f5es relevantes da base de conhecimento:\n${contextFromDocs}`
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || null
    } catch (error) {
      this.logger.error(`AI response generation failed: ${error.message}`)
      return null
    }
  }

  private buildSystemPrompt(customPrompt: string | undefined, leadContext: string): string {
    const basePrompt = customPrompt || `Você é um assistente virtual de uma imobiliária. Seja cordial, profissional e objetivo.
Seu objetivo é qualificar leads e ajudá-los a encontrar o imóvel ideal.
Sempre pergunte sobre orçamento, tipo de imóvel desejado, bairros de preferência e prazo para compra/locação.
Não ofereça descontos ou condições especiais sem autorização.
Se o cliente solicitar falar com um humano, informe que vai transferir a conversa.`

    return `${basePrompt}\n\nContexto do cliente:\n${leadContext}`
  }

  private buildLeadContext(lead: any): string {
    const parts = [`Nome: ${lead.name}`]

    if (lead.temperature) parts.push(`Temperatura: ${lead.temperature}`)
    if (lead.propertyTypes?.length) parts.push(`Tipos de interesse: ${lead.propertyTypes.join(', ')}`)
    if (lead.minValue || lead.maxValue) {
      parts.push(`Or\u00e7amento: R$ ${lead.minValue || 0} - R$ ${lead.maxValue || 'sem limite'}`)
    }
    if (lead.neighborhoods?.length) parts.push(`Bairros: ${lead.neighborhoods.join(', ')}`)
    if (lead.bedrooms) parts.push(`Quartos: ${lead.bedrooms}`)
    if (lead.paymentType) parts.push(`Forma de pagamento: ${lead.paymentType}`)
    if (lead.purchaseDeadline) parts.push(`Prazo: ${lead.purchaseDeadline}`)
    if (lead.stage?.name) parts.push(`Etapa no funil: ${lead.stage.name}`)

    return parts.join('\n')
  }

  // ================== SUGGEST REPLY (POST /api/ai/suggest-reply) ==================

  /**
   * Gera 3 sugestões de resposta para o corretor com base no histórico da conversa e dados do lead.
   * Usa a chave OpenAI do usuário (descriptografada AES-256). Retorna 400 se não houver chave.
   */
  async suggestReply(
    userId: string,
    companyId: string,
    conversationId: string,
    leadId: string,
    lastMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string[]> {
    const openai = await this.getOpenAIClient(userId)

    let leadContext = 'Lead: dados não disponíveis.'
    if (leadId && companyId) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: leadId, companyId },
        include: { stage: { select: { name: true } } },
      })
      if (lead) {
        leadContext = this.buildLeadContext({
          name: lead.name,
          temperature: lead.temperature,
          propertyTypes: lead.propertyTypes,
          minValue: lead.minValue,
          maxValue: lead.maxValue,
          neighborhoods: lead.neighborhoods,
          bedrooms: lead.bedrooms,
          paymentType: lead.paymentType,
          purchaseDeadline: lead.purchaseDeadline,
          stage: lead.stage,
        })
      }
    }

    const conversationText = lastMessages
      .slice(-20)
      .map((m) => `${m.role === 'user' ? 'Cliente' : 'Corretor'}: ${m.content}`)
      .join('\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente para corretores de imóveis. Com base no histórico da conversa e no contexto do lead, gere exatamente 3 sugestões de resposta curtas e profissionais que o corretor pode enviar ao cliente pelo WhatsApp. Seja objetivo e cordial.

Contexto do lead:
${leadContext}

Retorne APENAS um JSON array com exatamente 3 strings, cada uma uma sugestão de resposta. Exemplo: ["Sugestão 1", "Sugestão 2", "Sugestão 3"]`,
        },
        {
          role: 'user',
          content: `Conversa recente:\n${conversationText || '(sem mensagens ainda)'}\n\nGere 3 sugestões de resposta para o corretor enviar ao cliente.`,
        },
      ],
      max_tokens: 600,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return []

    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === 'string').slice(0, 3)
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.filter((s: any) => typeof s === 'string').slice(0, 3)
      }
      if (parsed.replies && Array.isArray(parsed.replies)) {
        return parsed.replies.filter((s: any) => typeof s === 'string').slice(0, 3)
      }
      return []
    } catch {
      return []
    }
  }

  // ================== CO-PILOT SUGGESTIONS (legacy) ==================

  async generateCoPilotSuggestions(
    userId: string,
    lead: any,
    lastMessage: string,
  ): Promise<CoPilotSuggestion[]> {
    try {
      const openai = await this.getOpenAIClient(userId)

      const leadContext = this.buildLeadContext(lead)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente para corretores de imóveis. Baseado na última mensagem do cliente e no contexto do lead, gere sugestões de resposta e estratégias.

Retorne um JSON array com 2-4 sugestões no formato:
[
  { "type": "REPLY", "text": "sugestão de resposta" },
  { "type": "STRATEGY", "text": "sugestão de estratégia interna" },
  { "type": "NEXT_ACTION", "text": "próxima ação recomendada" },
  { "type": "ALERT", "text": "alerta se houver" }
]

Contexto do lead:
${leadContext}`,
          },
          {
            role: 'user',
            content: `\u00daltima mensagem do cliente: "${lastMessage}"`,
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      if (!content) return []

      const parsed = JSON.parse(content)
      return Array.isArray(parsed) ? parsed : parsed.suggestions || []
    } catch (error) {
      this.logger.error(`Co-Pilot suggestions failed: ${error.message}`)
      return []
    }
  }

  // ================== RAG - DOCUMENT SEARCH ==================

  async searchRelevantDocuments(userId: string, query: string, limit: number = 3): Promise<any[]> {
    // RAG/pgvector desabilitado temporariamente (requer PostgreSQL com pgvector)
    // Retornando array vazio até que o ambiente de produção esteja disponível
    return []
  }

  async generateEmbedding(userId: string, text: string): Promise<number[] | null> {
    try {
      const openai = await this.getOpenAIClient(userId)

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })

      return response.data[0]?.embedding || null
    } catch (error) {
      this.logger.error(`Embedding generation failed: ${error.message}`)
      return null
    }
  }

  // ================== DOCUMENT PROCESSING ==================

  async processDocument(documentId: string, userId: string): Promise<void> {
    // Processamento de documentos com embeddings desabilitado temporariamente
    // Requer PostgreSQL com pgvector
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      throw new NotFoundException('Documento não encontrado')
    }

    // Apenas atualiza o status para indicar que o processamento não está disponível
    await this.prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING_DISABLED' },
    })
  }

  private splitIntoChunks(text: string, maxTokens: number): string[] {
    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/)
    let currentChunk = ''

    for (const sentence of sentences) {
      const trimmed = sentence.trim()
      if (!trimmed) continue

      // Approximate token count (rough estimate: 1 token \u2248 4 chars)
      const estimatedTokens = (currentChunk.length + trimmed.length) / 4

      if (estimatedTokens > maxTokens && currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = trimmed + '. '
      } else {
        currentChunk += trimmed + '. '
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }

  // ================== AI CHAT (Direct) ==================

  async chat(
    userId: string,
    companyId: string,
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    const openai = await this.getOpenAIClient(userId)

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'Você é um assistente especializado em mercado imobiliário brasileiro. Ajude o usuário com suas dúvidas sobre imóveis, financiamento, documentação e processos de compra/venda/locação.',
      },
      ...conversationHistory,
      { role: 'user', content: message },
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.'
  }

  // ================== LEAD QUALIFICATION ANALYSIS ==================

  async analyzeLeadQualification(
    userId: string,
    lead: any,
    conversationHistory: any[],
  ): Promise<any> {
    try {
      const openai = await this.getOpenAIClient(userId)

      const leadContext = this.buildLeadContext(lead)
      const conversationSummary = conversationHistory
        .slice(-20)
        .map(m => `${m.direction === 'INBOUND' ? 'Cliente' : 'Corretor'}: ${m.content}`)
        .join('\n')

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Analise o lead e a conversa para determinar o nível de qualificação.

Retorne um JSON com:
{
  "qualificationScore": 0-100,
  "temperature": "HOT" | "WARM" | "COLD",
  "missingInfo": ["lista de informações que faltam"],
  "nextAction": "sugestão de próxima ação",
  "summary": "resumo da análise"
}`,
          },
          {
            role: 'user',
            content: `Dados do lead:\n${leadContext}\n\nConversa:\n${conversationSummary}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0]?.message?.content
      return content ? JSON.parse(content) : null
    } catch (error) {
      this.logger.error(`Lead analysis failed: ${error.message}`)
      return null
    }
  }
}
