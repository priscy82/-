"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMultiFileAuthState = void 0;

const { writeFile, readFile, unlink, stat, mkdir } = require("fs/promises");
const { join } = require("path");
const { proto } = require("../../WAProto");
const { initMultiAuthCreds } = require("./auth-utils");
const { BufferJSON } = require("./generics");

/**
 * stores the full authentication state in a single folder.
 * Far more efficient than singlefileauthstate
 *
 * Again, I wouldn't endorse this for any production level use other than perhaps a bot.
 * Would recommend writing an auth state for use with a proper SQL or No-SQL DB
 * */
const useMultiFileAuthState = async (folder, sessionId = "default-session") => {
    const fixFileName = (file) =>
        file?.replace(/\//g, "__")?.replace(/:/g, "-");

    const writeData = (data, file) => {
        return writeFile(
            join(folder, fixFileName(file)),
            JSON.stringify(data, BufferJSON.replacer)
        );
    };

    const readData = async (file) => {
        try {
            const data = await readFile(
                join(folder, fixFileName(file)),
                { encoding: "utf-8" }
            );
            return JSON.parse(data, BufferJSON.reviver);
        } catch {
            return null;
        }
    };

    const removeData = async (file) => {
        try {
            await unlink(join(folder, fixFileName(file)));
        } catch { }
    };

    const folderInfo = await stat(folder).catch(() => { });
    if (folderInfo) {
        if (!folderInfo.isDirectory()) {
            throw new Error(
                `found something that is not a directory at ${folder}, either delete it or specify a different location`
            );
        }
    } else {
        await mkdir(folder, { recursive: true });
    }

    // creds: load from file if there is one, if not create a new one with multi support
    const creds =
        (await readData("creds.json")) ||
        initMultiAuthCreds(sessionId);

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}.json`);
                            if (type === "app-state-sync-key" && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const file = `${category}-${id}.json`;
                            tasks.push(value ? writeData(value, file) : removeData(file));
                        }
                    }
                    await Promise.all(tasks);
                },
            },
        },
        saveCreds: () => {
            return writeData(creds, "creds.json");
        },
    };
};

exports.useMultiFileAuthState = useMultiFileAuthState;