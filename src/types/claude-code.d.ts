declare module "@anthropic-ai/claude-code" {
    export interface SDKUserMessage {
        type: 'user';
        message: {
            role: 'user';
            content: string;
        };
        parent_tool_use_id: string | null;
        session_id: string;
    }

    export type SDKMessage = SDKUserMessage; // Add other types if needed
}
