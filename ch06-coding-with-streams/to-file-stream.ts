import { Writable, WritableOptions } from "stream";
import { promises as fs } from "fs";
import { dirname, join } from "path";
import { mkdirp } from "mkdirp";

{
  type Chunk = {
    path: string;
    content: string | Buffer;
  };

  {
    class ToFileStream extends Writable {
      constructor(options?: WritableOptions) {
        super({ ...options, objectMode: true });
      }

      _write(
        chunk: Chunk,
        encoding: BufferEncoding,
        callback: (error?: Error | null | undefined) => void
      ): void {
        mkdirp(dirname(chunk.path))
          .then(() => fs.writeFile(chunk.path, chunk.content))
          .then(() => callback())
          .catch(callback);
      }
    }

    const tfs = new ToFileStream();
    tfs.write({
      path: join(__dirname, "files", "file1.txt"),
      content: "Hello",
    } satisfies Chunk);
    tfs.write({
      path: join(__dirname, "files", "file2.txt"),
      content: "Node.js",
    } satisfies Chunk);
    tfs.write({
      path: join(__dirname, "files", "file3.txt"),
      content: "streams",
    } satisfies Chunk);
  }

  {
    const tfs = new Writable({
      objectMode: true,
      write(chunk: Chunk, encoding, callback) {
        mkdirp(dirname(chunk.path))
          .then(() => fs.writeFile(chunk.path, chunk.content))
          .then(() => callback())
          .catch(callback);
      },
    });
  }
}
