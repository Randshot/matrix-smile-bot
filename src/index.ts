import {
    AutojoinRoomsMixin,
    AutojoinUpgradedRoomsMixin,
    MatrixClient,
    SimpleFsStorageProvider,
    SimpleRetryJoinStrategy
} from "matrix-bot-sdk";
import config from "./config";
import * as mkdirp from "mkdirp";
import { LogService } from "matrix-js-snippets";

mkdirp.sync(config.dataPath);

LogService.configure(config.logging);
const storageProvider = new SimpleFsStorageProvider(config.dataPath);
const client = new MatrixClient(config.homeserverUrl, config.accessToken, storageProvider);

async function run() {
    const userId = await client.getUserId();

    client.on("room.message", (roomId, event) => {
        if (event['sender'] === userId) return;
        if (!event['content']) return;
        if (event['type'] !== "m.room.message") return;
        if (event['content']['msgtype'] !== "m.text") return;

        if (event['content']['body'].endsWith(":(")) {
            return client.sendNotice(roomId, ":)");
        } else if (event['content']['body'].endsWith("🙁")) {
            return client.sendNotice(roomId, "🙂");
        }
    });

    AutojoinRoomsMixin.setupOnClient(client);
    AutojoinUpgradedRoomsMixin.setupOnClient(client);
    client.setJoinStrategy(new SimpleRetryJoinStrategy());
    return client.start();
}

run().then(() => LogService.info("index", "Smile bot started!"));
