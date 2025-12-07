export type UserRole = 'therapist' | 'client';
export type RiskLevel = 'none' | 'low' | 'medium' | 'high';
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}
export interface Session {
    id: string;
    therapistId: string;
    clientId: string;
    date: Date;
    transcript: string;
    riskLevel: RiskLevel;
}
export interface Plan {
    id: string;
    sessionId: string;
    clientId: string;
    therapistId: string;
    versionNumber: number;
    therapistPlanText: string;
    clientPlanText: string;
    isActive: boolean;
}
//# sourceMappingURL=types.d.ts.map