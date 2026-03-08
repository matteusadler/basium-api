"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const users_service_1 = require("../users/users.service");
const openai_1 = require("openai");
let AiService = AiService_1 = class AiService {
    constructor(prisma, usersService) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    async getOpenAIClient(userId) {
        const apiKey = await this.usersService.getDecryptedOpenAIKey(userId);
        if (!apiKey) {
            throw new common_1.BadRequestException('Configure sua chave OpenAI em Configurações');
        }
        return new openai_1.default({ apiKey });
    }
    async generateResponse(userId, lead, conversationHistory, incomingMessage, systemPrompt) {
        try {
            const openai = await this.getOpenAIClient(userId);
            const leadContext = this.buildLeadContext(lead);
            const messages = [
                {
                    role: 'system',
                    content: this.buildSystemPrompt(systemPrompt, leadContext),
                },
            ];
            for (const msg of conversationHistory.slice(-20)) {
                messages.push({
                    role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
                    content: msg.content,
                });
            }
            messages.push({ role: 'user', content: incomingMessage });
            const relevantChunks = await this.searchRelevantDocuments(userId, incomingMessage);
            if (relevantChunks.length > 0) {
                const contextFromDocs = relevantChunks.map(c => c.content).join('\n\n');
                messages[0].content += `\n\nInforma\u00e7\u00f5es relevantes da base de conhecimento:\n${contextFromDocs}`;
            }
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages,
                max_tokens: 500,
                temperature: 0.7,
            });
            return completion.choices[0]?.message?.content || null;
        }
        catch (error) {
            this.logger.error(`AI response generation failed: ${error.message}`);
            return null;
        }
    }
    buildSystemPrompt(customPrompt, leadContext) {
        const basePrompt = customPrompt || `Você é um assistente virtual de uma imobiliária. Seja cordial, profissional e objetivo.
Seu objetivo é qualificar leads e ajudá-los a encontrar o imóvel ideal.
Sempre pergunte sobre orçamento, tipo de imóvel desejado, bairros de preferência e prazo para compra/locação.
Não ofereça descontos ou condições especiais sem autorização.
Se o cliente solicitar falar com um humano, informe que vai transferir a conversa.`;
        return `${basePrompt}\n\nContexto do cliente:\n${leadContext}`;
    }
    buildLeadContext(lead) {
        const parts = [`Nome: ${lead.name}`];
        if (lead.temperature)
            parts.push(`Temperatura: ${lead.temperature}`);
        if (lead.propertyTypes?.length)
            parts.push(`Tipos de interesse: ${lead.propertyTypes.join(', ')}`);
        if (lead.minValue || lead.maxValue) {
            parts.push(`Or\u00e7amento: R$ ${lead.minValue || 0} - R$ ${lead.maxValue || 'sem limite'}`);
        }
        if (lead.neighborhoods?.length)
            parts.push(`Bairros: ${lead.neighborhoods.join(', ')}`);
        if (lead.bedrooms)
            parts.push(`Quartos: ${lead.bedrooms}`);
        if (lead.paymentType)
            parts.push(`Forma de pagamento: ${lead.paymentType}`);
        if (lead.purchaseDeadline)
            parts.push(`Prazo: ${lead.purchaseDeadline}`);
        if (lead.stage?.name)
            parts.push(`Etapa no funil: ${lead.stage.name}`);
        return parts.join('\n');
    }
    async suggestReply(userId, companyId, conversationId, leadId, lastMessages) {
        const openai = await this.getOpenAIClient(userId);
        let leadContext = 'Lead: dados não disponíveis.';
        if (leadId && companyId) {
            const lead = await this.prisma.lead.findFirst({
                where: { id: leadId, companyId },
                include: { stage: { select: { name: true } } },
            });
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
                });
            }
        }
        const conversationText = lastMessages
            .slice(-20)
            .map((m) => `${m.role === 'user' ? 'Cliente' : 'Corretor'}: ${m.content}`)
            .join('\n');
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
        });
        const content = completion.choices[0]?.message?.content;
        if (!content)
            return [];
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed))
                return parsed.filter((s) => typeof s === 'string').slice(0, 3);
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                return parsed.suggestions.filter((s) => typeof s === 'string').slice(0, 3);
            }
            if (parsed.replies && Array.isArray(parsed.replies)) {
                return parsed.replies.filter((s) => typeof s === 'string').slice(0, 3);
            }
            return [];
        }
        catch {
            return [];
        }
    }
    async generateCoPilotSuggestions(userId, lead, lastMessage) {
        try {
            const openai = await this.getOpenAIClient(userId);
            const leadContext = this.buildLeadContext(lead);
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
            });
            const content = completion.choices[0]?.message?.content;
            if (!content)
                return [];
            const parsed = JSON.parse(content);
            return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
        }
        catch (error) {
            this.logger.error(`Co-Pilot suggestions failed: ${error.message}`);
            return [];
        }
    }
    async searchRelevantDocuments(userId, query, limit = 3) {
        return [];
    }
    async generateEmbedding(userId, text) {
        try {
            const openai = await this.getOpenAIClient(userId);
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            });
            return response.data[0]?.embedding || null;
        }
        catch (error) {
            this.logger.error(`Embedding generation failed: ${error.message}`);
            return null;
        }
    }
    async processDocument(documentId, userId) {
        const document = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Documento não encontrado');
        }
        await this.prisma.document.update({
            where: { id: documentId },
            data: { status: 'PROCESSING_DISABLED' },
        });
    }
    splitIntoChunks(text, maxTokens) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/);
        let currentChunk = '';
        for (const sentence of sentences) {
            const trimmed = sentence.trim();
            if (!trimmed)
                continue;
            const estimatedTokens = (currentChunk.length + trimmed.length) / 4;
            if (estimatedTokens > maxTokens && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = trimmed + '. ';
            }
            else {
                currentChunk += trimmed + '. ';
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    }
    async chat(userId, companyId, message, conversationHistory) {
        const openai = await this.getOpenAIClient(userId);
        const messages = [
            {
                role: 'system',
                content: 'Você é um assistente especializado em mercado imobiliário brasileiro. Ajude o usuário com suas dúvidas sobre imóveis, financiamento, documentação e processos de compra/venda/locação.',
            },
            ...conversationHistory,
            { role: 'user', content: message },
        ];
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            max_tokens: 1000,
            temperature: 0.7,
        });
        return completion.choices[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
    }
    async analyzeLeadQualification(userId, lead, conversationHistory) {
        try {
            const openai = await this.getOpenAIClient(userId);
            const leadContext = this.buildLeadContext(lead);
            const conversationSummary = conversationHistory
                .slice(-20)
                .map(m => `${m.direction === 'INBOUND' ? 'Cliente' : 'Corretor'}: ${m.content}`)
                .join('\n');
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
            });
            const content = completion.choices[0]?.message?.content;
            return content ? JSON.parse(content) : null;
        }
        catch (error) {
            this.logger.error(`Lead analysis failed: ${error.message}`);
            return null;
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_service_1.UsersService])
], AiService);
//# sourceMappingURL=ai.service.js.map