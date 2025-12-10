export declare const auth: import("better-auth").Auth<{
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    emailAndPassword: {
        enabled: true;
        minPasswordLength: number;
        requireEmailVerification: false;
    };
    session: {
        expiresIn: number;
        updateAge: number;
        cookieCache: {
            enabled: true;
            maxAge: number;
        };
    };
    user: {
        additionalFields: {
            role: {
                type: "string";
                required: true;
                input: true;
            };
        };
    };
    trustedOrigins: string[];
    advanced: {
        database: {
            generateId: "uuid";
        };
    };
}>;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
//# sourceMappingURL=config.d.ts.map