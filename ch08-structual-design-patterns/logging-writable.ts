import { createWriteStream } from "fs";
import path from "path";
import { Writable } from "stream";

{
  function createLoggingWritable(writable: Writable) {
    return new Proxy(writable, {
      get(target, p: keyof Writable, receiver) {
        if (p === "write") {
          return function (...args: Parameters<Writable["write"]>) {
            const [chunk] = args;
            console.log("Writing", chunk);
            return writable.write(...args);
          };
        }
        return target[p];
      },
    });
  }

  const w = createWriteStream(path.join(__dirname, "text.txt"));
  const wp = createLoggingWritable(w);
  wp.write("First chunk");
  wp.write("Second chunk");
  w.write("This is not logged");
  wp.end();
}
