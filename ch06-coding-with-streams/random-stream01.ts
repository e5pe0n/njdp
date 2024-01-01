import { Readable, ReadableOptions } from "stream";
import Chance from "chance";

{
  const chance = new Chance();

  class RandomStream extends Readable {
    emittedBytes: number;

    constructor(options?: ReadableOptions) {
      super(options);
      this.emittedBytes = 0;
    }

    _read(size: number): void {
      const chunk = chance.string({ length: size });
      this.push(chunk, "utf-8");
      this.emittedBytes += chunk.length;
      if (chance.bool({ likelihood: 5 })) {
        this.push(null);
      }
    }
  }

  const rs = new RandomStream();
  rs.on("data", (chunk) => {
    console.log(`Chunk received (${chunk.length} bytes): ${chunk}`);
  }).on("end", () => {
    console.log(`Produced ${rs.emittedBytes} bytes of random data`);
  });
}
