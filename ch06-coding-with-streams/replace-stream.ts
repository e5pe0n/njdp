import { Transform, TransformCallback, TransformOptions } from "stream";

{
  class ReplaceStream extends Transform {
    searchStr: string;
    replaceStr: string;
    tail: string;

    constructor(
      searchStr: string,
      replaceStr: string,
      options?: TransformOptions
    ) {
      super({ ...options });
      this.searchStr = searchStr;
      this.replaceStr = replaceStr;
      this.tail = "";
    }

    _transform(
      chunk: string,
      encoding: BufferEncoding,
      callback: TransformCallback
    ): void {
      const pieces = (this.tail + chunk).split(this.searchStr);
      const lastPiece = pieces.at(-1) ?? "";
      const tailLen = this.searchStr.length - 1;
      this.tail = lastPiece.slice(-tailLen);
      pieces[pieces.length - 1] = lastPiece.slice(0, -tailLen);

      this.push(pieces.join(this.replaceStr));

      callback();
    }

    _flush(callback: TransformCallback): void {
      this.push(this.tail);
      callback();
    }
  }

  const rs = new ReplaceStream("World", "Node.js", {
    encoding: "utf-8",
  });
  rs.on("data", (chunk: string) => {
    console.log(chunk);
  });
  rs.write("Hello W");
  rs.write("orld!");
  rs.end();
}

{
  const searchStr = "World";
  const replaceStr = "Node.js";
  let tail = "";
  const rs = new Transform({
    defaultEncoding: "utf-8",
    transform(chunk, encoding, callback) {
      const pieces = (tail + chunk).split(searchStr);
      const lastPiece = pieces.at(-1) ?? "";
      const tailLen = searchStr.length - 1;
      tail = lastPiece.slice(-tailLen);
      pieces[pieces.length - 1] = lastPiece.slice(0, -tailLen);

      this.push(pieces.join(replaceStr));

      callback();
    },
    flush(callback) {
      this.push(tail);
      callback();
    },
  });
}
