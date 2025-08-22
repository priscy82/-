export declare const S_WHATSAPP_NET = "@s.whatsapp.net";
export declare const OFFICIAL_BIZ_JID = "16505361212@c.us";
export declare const META_AI_JID = "13135550002@c.us";
export declare const SERVER_JID = "server@c.us";
export declare const PSA_WID = "0@c.us";
export declare const STORIES_JID = "status@broadcast";

export type JidServer = 'c.us' | 'g.us' | 'broadcast' | 's.whatsapp.net' | 'call' | 'lid' | 'newsletter' | 'bot';

export type JidWithDevice = {
    user: string;
    device?: number;
};

export type FullJid = JidWithDevice & {
    server: JidServer | string;
    domainType?: number;
};

// Encode / Decode
export declare const jidEncode: (user: string | number | null, server: JidServer, device?: number, agent?: number) => string;
export declare const jidDecode: (jid: string | undefined) => FullJid | undefined;

// Compare JID
export declare const areJidsSameUser: (jid1: string | undefined, jid2: string | undefined) => boolean;

// Utility checks
export declare const isJidUser: (jid: string | undefined) => boolean | undefined;
export declare const isLidUser: (jid: string | undefined) => boolean | undefined;
export declare const isJidBroadcast: (jid: string | undefined) => boolean | undefined;
export declare const isJidGroup: (jid: string | undefined) => boolean | undefined;
export declare const isJidStatusBroadcast: (jid: string) => boolean;
export declare const isJidNewsLetter: (jid: string | undefined) => boolean | undefined;

// Bot / META AI
export declare const isJidMetaIa: (jid: string | undefined) => boolean;
export declare const botRegexp: RegExp;

// Normalize JID
export declare const jidNormalizedUser: (jid: string | undefined) => string;