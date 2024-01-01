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
  class LimitedParallelStream extends Transform {
    concurrency: number;
    userTransform: Function;
    runinng: number;
    continueCb: TransformCallback | null;
    terminateCb: TransformCallback | null;

    constructor(
      concurrency: number,
      userTransform: Function,
      opts?: TransformOptions
    ) {
      super({ ...opts, objectMode: true });
      this.concurrency = concurrency;
      this.userTransform = userTransform;
      this.runinng = 0;
      this.continueCb = null;
      this.terminateCb = null;
    }

    _transform(
      chunk: any,
      encoding: BufferEncoding,
      callback: TransformCallback
    ): void {
      this.runinng++;
      this.userTransform(
        chunk,
        encoding,
        this.push.bind(this),
        this._onComplete.bind(this)
      );
      if (this.runinng < this.concurrency) {
        callback();
      } else {
        this.continueCb = callback;
      }
    }

    _flush(callback: TransformCallback): void {
      if (this.runinng > 0) {
        this.terminateCb = callback;
      } else {
        callback();
      }
    }

    _onComplete(err: Error) {
      this.runinng--;
      if (err) {
        return this.emit("error", err);
      }
      const tmpCb = this.continueCb;
      this.continueCb = null;
      tmpCb && tmpCb();
      if (this.runinng === 0) {
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
      new LimitedParallelStream(4, userTransform),
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
