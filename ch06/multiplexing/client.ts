import { fork } from "child_process";
import { connect } from "net";
import { Readable, Writable } from "stream";

{
  function multiplexChannels(srcs: Readable[], dest: Writable) {
    let openChannels = srcs.length;
    for (const [i, src] of srcs.entries()) {
      src
        .on("readable", function (this: Readable) {
          let chunk;
          while ((chunk = this.read()) !== null) {
            const outBuf = Buffer.alloc(1 + 4 + chunk.length);
            outBuf.writeUInt8(i, 0);
            outBuf.writeUInt32BE(chunk.length, 1);
            chunk.copy(outBuf, 5);
            console.log(`Sending packet to channel: ${i}`);
            dest.write(outBuf);
          }
        })
        .on("end", () => {
          if (--openChannels === 0) {
            dest.end();
          }
        });
    }
  }

  const socket = connect({ port: 3000 }, () => {
    const child = fork(process.argv[2]!, process.argv.slice(3), {
      silent: true,
    });
    multiplexChannels([child.stdout!, child.stderr!], socket);
  });
}
