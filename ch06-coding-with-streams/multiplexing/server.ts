import { createWriteStream } from "fs";
import { createServer } from "net";
import path from "path";
import { Readable, Writable } from "stream";

{
  function demultiplexChannels(src: Readable, dests: Writable[]) {
    let currentChannel: number | null = null;
    let currentLen: number | null = null;

    src
      .on("readable", () => {
        let chunk: Buffer;
        if (currentChannel === null) {
          chunk = src.read(1);
          currentChannel = chunk && chunk.readUInt8(0);
        }

        if (currentLen === null) {
          chunk = src.read(4);
          currentLen = chunk && chunk.readUInt32BE(0);
          if (currentLen === null) {
            return null;
          }
        }

        chunk = src.read(currentLen);
        if (chunk === null) {
          return null;
        }

        console.log(`Received packet from: ${currentChannel}`);
        dests[currentChannel]!.write(chunk);
        currentChannel = null;
        currentLen = null;
      })
      .on("end", () => {
        dests.forEach((dest) => dest.end());
        console.log("Source channel closed");
      });
  }

  const server = createServer((socket) => {
    const stdoutStream = createWriteStream(path.join(__dirname, "stdout.log"));
    const stderrStream = createWriteStream(path.join(__dirname, "stderr.log"));
    demultiplexChannels(socket, [stdoutStream, stderrStream]);
  });
  server.listen(3000, () => console.log("Server started"));
}
