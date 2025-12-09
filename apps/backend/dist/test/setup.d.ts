export declare const mockOpenAIResponse: (content: string) => {
    choices: {
        message: {
            content: string;
            role: string;
        };
        finish_reason: string;
        index: number;
    }[];
    created: number;
    id: string;
    model: string;
    object: string;
};
export declare const mockModerationResponse: (flagged: boolean, categories?: Record<string, boolean>) => {
    results: {
        flagged: boolean;
        categories: {
            'self-harm': boolean;
            'self-harm/intent': boolean;
            'self-harm/instructions': boolean;
            violence: boolean;
            'violence/graphic': boolean;
            sexual: boolean;
            'sexual/minors': boolean;
            harassment: boolean;
            'harassment/threatening': boolean;
            hate: boolean;
            'hate/threatening': boolean;
        };
        category_scores: {
            'self-harm': number;
            'self-harm/intent': number;
            'self-harm/instructions': number;
            violence: number;
            'violence/graphic': number;
            sexual: number;
            'sexual/minors': number;
            harassment: number;
            'harassment/threatening': number;
            hate: number;
            'hate/threatening': number;
        };
    }[];
};
//# sourceMappingURL=setup.d.ts.map