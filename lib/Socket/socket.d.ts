/// <reference types="node" />
import { Boom } from '@hapi/boom';
import { SocketConfig, BaileysEventEmitter, BaileysEventMap, AuthenticationCreds, SignalKeyStoreWithTransaction, SignalRepository, Contact, ConnectionState } from '../Types';
import { BinaryNode } from '../WABinary';

/**
 * Connects to WA servers and performs:
 * - simple queries (no retry mechanism, wait for connection establishment)
 * - listen to messages and emit events
 * - query phone connection
 * - patched: ignores 401 failure (auto reconnect instead of logout)
 */
export declare const makeSocket: (config: SocketConfig) => {
    type: "md";
    ws: any;
    ev: BaileysEventEmitter & {
        process(handler: (events: Partial<BaileysEventMap>) => void | Promise<void>): () => void;
        buffer(): void;
        createBufferedFunction<A extends any[], T>(work: (...args: A) => Promise<T>): (...args: A) => Promise<T>;
        flush(force?: boolean | undefined): boolean;
        isBuffering(): boolean;
    };
    authState: {
        creds: AuthenticationCreds;
        keys: SignalKeyStoreWithTransaction;
    };
    signalRepository: SignalRepository;
    readonly user: Contact | undefined;
    generateMessageTag: () => string;
    query: (node: BinaryNode, timeoutMs?: number) => Promise<BinaryNode>;
    waitForMessage: <T = any>(msgId: string, timeoutMs?: number | undefined) => Promise<T>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: Uint8Array | Buffer) => Promise<void>;
    sendNode: (frame: BinaryNode) => Promise<void>;
    logout: (msg?: string) => Promise<void>;
    end: (error: Error | undefined) => void;
    onUnexpectedError: (err: Error | Boom, msg: string) => void;
    uploadPreKeys: (count?: number) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    requestPairingCode: (phoneNumber: string) => Promise<string>;
    /** Waits for the connection to WA to reach a state */
    waitForConnectionUpdate: (check: (u: Partial<ConnectionState>) => boolean | undefined, timeoutMs?: number | undefined) => Promise<void>;
    sendWAMBuffer: (wamBuffer: Buffer) => Promise<BinaryNode>;
};

export type Socket = ReturnType<typeof makeSocket>;