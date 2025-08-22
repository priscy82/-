"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jidNormalizedUser = exports.botRegexp = exports.isJidMetaIa = exports.isJidNewsLetter = exports.isJidStatusBroadcast = exports.isJidGroup = exports.isJidBroadcast = exports.isLidUser = exports.isJidUser = exports.areJidsSameUser = exports.jidDecode = exports.jidEncode = exports.STORIES_JID = exports.PSA_WID = exports.SERVER_JID = exports.META_AI_JID = exports.OFFICIAL_BIZ_JID = exports.S_WHATSAPP_NET = void 0;

// Constants
exports.S_WHATSAPP_NET = '@s.whatsapp.net';
exports.OFFICIAL_BIZ_JID = '16505361212@c.us';
exports.META_AI_JID = '13135550002@c.us';
exports.SERVER_JID = 'server@c.us';
exports.PSA_WID = '0@c.us';
exports.STORIES_JID = 'status@broadcast';


// JID Decode
const jidDecode = (jid) => {
    const sepIdx = typeof jid === 'string' ? jid.indexOf('@') : -1;
    if (sepIdx < 0)
        return undefined;

    const server = jid.slice(sepIdx + 1);
    const userCombined = jid.slice(0, sepIdx);
    const [userAgent, device] = userCombined.split(':');
    const user = userAgent.split('_')[0];

    return {
        server,
        user,
        domainType: server === 'lid' ? 1 : 0,
        device: device ? +device : undefined
    };
};
exports.jidDecode = jidDecode;

// Compare two JIDs
const areJidsSameUser = (jid1, jid2) => jidDecode(jid1)?.user === jidDecode(jid2)?.user;
exports.areJidsSameUser = areJidsSameUser;

// Utility functions
const isJidUser = (jid) => jid?.endsWith('@s.whatsapp.net');
exports.isJidUser = isJidUser;

const isLidUser = (jid) => jid?.endsWith('@lid');
exports.isLidUser = isLidUser;

const isJidBroadcast = (jid) => jid?.endsWith('@broadcast');
exports.isJidBroadcast = isJidBroadcast;

const isJidGroup = (jid) => jid?.endsWith('@g.us');
exports.isJidGroup = isJidGroup;

const isJidStatusBroadcast = (jid) => jid === 'status@broadcast';
exports.isJidStatusBroadcast = isJidStatusBroadcast;

const isJidNewsLetter = (jid) => jid?.endsWith('newsletter');
exports.isJidNewsLetter = isJidNewsLetter;

// Bot / META AI
const isJidMetaIa = (jid) => jid?.endsWith('@bot');
exports.isJidMetaIa = isJidMetaIa;

// Bot JID regex
const botRegexp = /^1313555\d{4}$|^131655500\d{2}$/;
exports.botRegexp = botRegexp;

// Normalize JID
const jidNormalizedUser = (jid) => {
    const result = jidDecode(jid);
    if (!result)
        return '';

    const { user, server } = result;
    return jidEncode(user, server === 'c.us' ? 's.whatsapp.net' : server);
};
exports.jidNormalizedUser = jidNormalizedUser;