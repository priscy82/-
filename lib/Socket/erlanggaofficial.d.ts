import { proto } from '../../WAProto';
import { Readable } from 'stream';

declare namespace langgxyz {
    interface MediaUploadOptions {
        fileEncSha256?: Buffer;
        mediaType?: string;
        newsletter?: boolean;
    }

    type WAMediaUploadFunction = (
        stream: Buffer | Readable,
        options?: MediaUploadOptions
    ) => Promise<{ url: string; directPath: string }>;

    interface WAMessageContentGenerationOptions {
        upload?: WAMediaUploadFunction;
        mediaCache?: any;
        options?: any;
        logger?: any;
    }

    interface StickerMessage {
        url: string;
        fileSha256: Buffer | string;
        fileEncSha256: Buffer | string;
        mediaKey: Buffer | string;
        mimetype: string;
        directPath: string;
        fileLength: number | string;
        mediaKeyTimestamp: number | string;
        isAnimated?: boolean;
        stickerSentTs?: number | string;
        isAvatar?: boolean;
        isAiSticker?: boolean;
        isLottie?: boolean;
    }

    interface PaymentMessage {
        amount: number;
        currency?: string;
        from?: string;
        expiry?: number;
        sticker?: { stickerMessage: StickerMessage };
        note?: string;
        background?: {
            id?: string;
            fileLength?: string;
            width?: number;
            height?: number;
            mimetype?: string;
            placeholderArgb?: number;
            textArgb?: number;
            subtextArgb?: number;
        };
    }

    interface ProductMessage {
        title: string;
        description: string;
        thumbnail: string;
        productId: string;
        retailerId: string;
        url: string;
        body?: string;
        footer?: string;
        buttons?: proto.Message.InteractiveMessage.INativeFlowButton[];
    }

    interface InteractiveMessage {
        title: string;
        footer?: string;
        thumbnail?: string;
        buttons?: proto.Message.InteractiveMessage.INativeFlowButton[];
        nativeFlowMessage?: proto.Message.InteractiveMessage.INativeFlowMessage;
    }

    interface AlbumItem {
        image?: { url: string; caption?: string };
        video?: { url: string; caption?: string };
    }

    interface EventMessageLocation {
        degreesLatitude: number;
        degreesLongitude: number;
        name: string;
    }

    interface EventMessage {
        isCanceled?: boolean;
        name: string;
        description: string;
        location?: EventMessageLocation;
        joinLink?: string;
        startTime?: string | number;
        endTime?: string | number;
        extraGuestsAllowed?: boolean;
    }

    interface MessageContent {
        requestPaymentMessage?: PaymentMessage;
        productMessage?: ProductMessage;
        interactiveMessage?: InteractiveMessage;
        albumMessage?: AlbumItem[];
        eventMessage?: EventMessage;
    }

    interface CustomMessageContextInfo {
        // Field custom opsional
        initiator?: number;
        trigger?: number;
        initiatorDeviceJid?: string;
        initiatedByExternalService?: boolean;
        initiatedByUserDevice?: boolean;
        initiatedBySystem?: boolean;
        initiatedByServer?: boolean;
        initiatedByAdmin?: boolean;
        initiatedByUser?: boolean;
        initiatedByApp?: boolean;
        initiatedByBot?: boolean;
        initiatedByMe?: boolean;
        labels?: string[];
        isHighlighted?: boolean;
        starred?: boolean;
        forwardingScore?: number;
        isForwarded?: boolean;
        businessMessageForwardInfo?: {
            businessOwnerJid?: string;
        };
        dataSharingContext?: {
            showMmDisclosure?: boolean;
        };
        forwardedNewsletterMessageInfo?: {
            newsletterJid?: string;
            serverMessageId?: number;
            newsletterName?: string;
            contentType?: number;
            timestamp?: string;
            senderName?: string;
            content?: string;
            priority?: string;
            status?: string;
        };
        disappearingMode?: {
            [key: string]: any;
        };
    }
}

declare class langgxyz {
    constructor(
        utils: {
            prepareWAMessageMedia: (
                media: any,
                options: langgxyz.WAMessageContentGenerationOptions
            ) => Promise<any>;
            generateWAMessageContent: (
                content: any,
                options: langgxyz.WAMessageContentGenerationOptions
            ) => Promise<any>;
            generateWAMessageFromContent: (
                jid: string,
                content: any,
                options?: any
            ) => Promise<any>;
            generateMessageID: () => string;
        },
        waUploadToServer: langgxyz.WAMediaUploadFunction,
        relayMessageFn?: (
            jid: string,
            content: any,
            options?: any
        ) => Promise<any>
    );

    detectType(content: langgxyz.MessageContent): 'PAYMENT' | 'PRODUCT' | 'INTERACTIVE' | 'ALBUM' | 'EVENT' | null;

    handlePayment(
        content: { requestPaymentMessage: langgxyz.PaymentMessage },
        quoted?: proto.IWebMessageInfo
    ): Promise<{ requestPaymentMessage: proto.Message.RequestPaymentMessage }>;

    handleProduct(
        content: { productMessage: langgxyz.ProductMessage },
        jid: string,
        quoted?: proto.IWebMessageInfo
    ): Promise<{ viewOnceMessage: proto.Message.ViewOnceMessage }>;

    handleInteractive(
        content: { interactiveMessage: langgxyz.InteractiveMessage },
        jid: string,
        quoted?: proto.IWebMessageInfo
    ): Promise<{ viewOnceMessage: proto.Message.ViewOnceMessage }>;

    handleAlbum(
        content: { albumMessage: langgxyz.AlbumItem[] },
        jid: string,
        quoted?: proto.IWebMessageInfo
    ): Promise<any>;

    handleEvent(
        content: { eventMessage: langgxyz.EventMessage },
        jid: string,
        quoted?: proto.IWebMessageInfo
    ): Promise<any>;
}

export = langgxyz;