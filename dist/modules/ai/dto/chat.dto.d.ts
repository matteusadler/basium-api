declare class ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export declare class ChatDto {
    message: string;
    history?: ChatMessage[];
}
export {};
