export interface TherapistSummary {
    sessionFocus: string;
    keyDiscussionPoints: string[];
    clinicalObservations: string[];
    progressNotes: string;
    followUpItems: string[];
}
export interface ClientSummary {
    whatWeWorkedOn: string;
    keyTakeaways: string[];
    encouragement: string;
    nextSteps: string[];
}
export declare function generateTherapistSummary(transcript: string, sessionDate: string, maxRetries?: number): Promise<TherapistSummary>;
export declare function generateClientSummary(transcript: string, sessionDate: string, maxRetries?: number): Promise<ClientSummary>;
export declare function generateSessionSummary(transcript: string, sessionDate: string): Promise<{
    therapistSummary: TherapistSummary;
    clientSummary: ClientSummary;
}>;
//# sourceMappingURL=summaryGenerator.d.ts.map