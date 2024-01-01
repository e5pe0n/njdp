import { createReadStream, createWriteStream } from "fs";
import split from "split";
import {
  Transform,
  TransformCallback,
  TransformOptions,
  pipeline,
} from "stream";
import superagent from "superagent";

{
  class ParallelStream extends Transform {
    userTransform: Function;
    running: number;
    terminateCb: TransformCallback | null;

    constructor(userTransform: Function, opts?: TransformOptions) {
      super({ objectMode: true, ...opts });
      this.userTransform = userTransform;
      this.running = 0;
      this.terminateCb = null;
    }

    _transform(
      chunk: any,
      encoding: BufferEncoding,
      callback: TransformCallback
    ): void {
      this.running++;
      this.userTransform(
        chunk,
        encoding,
        this.push.bind(this),
        this._onComplete.bind(this)
      );
      callback();
    }

    _flush(callback: TransformCallback): void {
      if (this.running > 0) {
        this.terminateCb = callback;
      } else {
        callback();
      }
    }

    _onComplete(err: Error) {
      this.running--;
      if (err) {
        return this.emit("error", err);
      }
      if (this.running === 0) {
        this.terminateCb && this.terminateCb();
      }
    }
  }

  const userTransform = async (
    url: string,
    encoding: BufferEncoding,
    push: Function,
    done: TransformCallback
  ) => {
    if (!url) {
      return done();
    }
    try {
      await superagent.head(url).timeout(5_000);
      push(`${url} is up\n`);
    } catch (err) {
      push(`${url} is down\n`);
    }
    done();
  };

  const main = () => {
    pipeline(
      createReadStream(process.argv[2]!),
      split(),
      new ParallelStream(userTransform),
      createWriteStream("results.txt"),
      (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log("All urls have been checked");
      }
    );
  };
}
