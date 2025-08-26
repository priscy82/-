const WAProto = require('../../WAProto').proto
const crypto = require('crypto')

class langgxyz {
    constructor(utils, waUploadToServer, relayMessageFn) {
        this.utils = utils
        this.waUploadToServer = waUploadToServer
        this.relayMessage = relayMessageFn || (async () => {})
    }

    detectType(content) {
        if (content.requestPaymentMessage) return 'PAYMENT'
        if (content.productMessage) return 'PRODUCT'
        if (content.interactiveMessage) return 'INTERACTIVE'
        if (content.albumMessage) return 'ALBUM'
        if (content.eventMessage) return 'EVENT'
        return null
    }

    /** Handle Payment Message */
    async handlePayment(content, quoted) {
        const data = content.requestPaymentMessage
        let notes = {}

        if (data.sticker?.stickerMessage) {
            notes = {
                stickerMessage: {
                    ...data.sticker.stickerMessage,
                    contextInfo: {
                        stanzaId: quoted?.key?.id,
                        participant: quoted?.key?.participant || content.sender,
                        quotedMessage: quoted?.message,
                        initiatedByBot: true,
                        labels: ['Important'],
                        isHighlighted: true
                    }
                }
            }
        } else if (data.note) {
            notes = {
                extendedTextMessage: {
                    text: data.note,
                    contextInfo: {
                        stanzaId: quoted?.key?.id,
                        participant: quoted?.key?.participant || content.sender,
                        quotedMessage: quoted?.message,
                        initiatedByBot: true,
                        labels: ['Important'],
                        isHighlighted: true
                    }
                }
            }
        }

        return {
            requestPaymentMessage: WAProto.Message.RequestPaymentMessage.create({
                expiryTimestamp: data.expiry || 0,
                amount1000: data.amount || 0,
                currencyCodeIso4217: data.currency || "IDR",
                requestFrom: data.from || "0@s.whatsapp.net",
                noteMessage: notes,
                background: data.background ?? {
                    id: "DEFAULT",
                    placeholderArgb: 0xFFF0F0F0
                }
            })
        }
    }

    /** Handle Product Message */
    async handleProduct(content, jid, quoted) {
        const {
            title,
            description,
            thumbnail,
            productId,
            retailerId,
            url,
            body = "",
            footer = "",
            buttons = []
        } = content.productMessage

        const { imageMessage } = await this.utils.generateWAMessageContent(
            { image: { url: thumbnail } },
            { upload: this.waUploadToServer }
        )

        return {
            viewOnceMessage: {
                message: {
                    interactiveMessage: WAProto.Message.InteractiveMessage.create({
                        body: { text: body },
                        footer: { text: footer },
                        header: { title, hasMediaAttachment: true, ...imageMessage },
                        nativeFlowMessage: { buttons },
                        productMessage: {
                            product: {
                                productImage: imageMessage,
                                productId,
                                title,
                                description,
                                currencyCode: "IDR",
                                priceAmount1000: null,
                                retailerId,
                                url,
                                productImageCount: 1
                            },
                            businessOwnerJid: "0@s.whatsapp.net"
                        }
                    })
                }
            }
        }
    }

    /** Handle Interactive Message */
    async handleInteractive(content, jid, quoted) {
        const {
            title,
            footer,
            thumbnail,
            buttons = [],
            nativeFlowMessage
        } = content.interactiveMessage

        let header = { title: "", hasMediaAttachment: false }
        if (thumbnail) {
            const media = await this.utils.prepareWAMessageMedia(
                { image: { url: thumbnail } },
                { upload: this.waUploadToServer }
            )
            header = { title: "", hasMediaAttachment: true, ...media }
        }

        return {
            viewOnceMessage: {
                message: {
                    interactiveMessage: WAProto.Message.InteractiveMessage.create({
                        body: { text: title },
                        footer: { text: footer },
                        header,
                        nativeFlowMessage: nativeFlowMessage || { buttons }
                    })
                }
            }
        }
    }

    /** Handle Album */
    async handleAlbum(content, jid, quoted) {
        const array = content.albumMessage

        const album = await this.utils.generateWAMessageFromContent(jid, {
            albumMessage: {
                expectedImageCount: array.filter(a => a.image).length,
                expectedVideoCount: array.filter(a => a.video).length,
            }
        }, {
            quoted,
            upload: this.waUploadToServer
        })

        await this.relayMessage(jid, album.message, {
            messageId: album.key.id,
        })

        for (let item of array) {
            const mediaMsg = await this.utils.generateWAMessage(jid, item, {
                upload: this.waUploadToServer,
            })

            mediaMsg.message.messageContextInfo = {
                messageSecret: crypto.randomBytes(32),
                initiatedByBot: true,
                labels: ["Important"],
                isHighlighted: true,
                businessMessageForwardInfo: { businessOwnerJid: jid },
                dataSharingContext: { showMmDisclosure: true },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "0@newsletter",
                    newsletterName: "WhatsApp",
                    serverMessageId: 1,
                    contentType: 1,
                    timestamp: new Date().toISOString(),
                    senderName: "Erlangga Official",
                    content: "Text Message",
                    priority: "high",
                    status: "sent"
                }
            }

            await this.relayMessage(jid, mediaMsg.message, {
                messageId: mediaMsg.key.id,
                quoted: {
                    key: {
                        remoteJid: album.key.remoteJid,
                        id: album.key.id,
                        fromMe: true
                    },
                    message: album.message,
                },
            })
        }
        return album
    }

    /** Handle Event Message */
    async handleEvent(content, jid, quoted) {
        const eventData = content.eventMessage

        const msg = await this.utils.generateWAMessageFromContent(jid, {
            viewOnceMessage: {
                message: {
                    eventMessage: {
                        isCanceled: eventData.isCanceled || false,
                        name: eventData.name,
                        description: eventData.description,
                        location: eventData.location || {
                            degreesLatitude: 0,
                            degreesLongitude: 0,
                            name: "Location"
                        },
                        joinLink: eventData.joinLink || '',
                        startTime: typeof eventData.startTime === 'string'
                            ? parseInt(eventData.startTime)
                            : eventData.startTime || Date.now(),
                        endTime: typeof eventData.endTime === 'string'
                            ? parseInt(eventData.endTime)
                            : eventData.endTime || Date.now() + 3600000,
                        extraGuestsAllowed: eventData.extraGuestsAllowed !== false
                    },
                    messageContextInfo: {
                        messageSecret: crypto.randomBytes(32),
                        initiatedByBot: true,
                        labels: ["Important"],
                        isHighlighted: true
                    }
                }
            }
        }, { quoted })

        await this.relayMessage(jid, msg.message, {
            messageId: msg.key.id
        })

        return msg
    }
}

module.exports = langgxyz