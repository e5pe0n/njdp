import { Readable } from "stream";
import Chance from "chance";

{
  const chance = new Chance();
  let emittedBytes = 0;
  const rs = new Readable({
    read(size) {
      const chunk = chance.string({ length: size });
      this.push(chunk, "utf-8");
      emittedBytes += chunk.length;
      if (chance.bool({ likelihood: 5 })) {
        this.push(null);
      }
    },
  });
  rs.on("data", (chunk) => {
    console.log(`Chunk received (${chunk.length} bytes)`);
  }).on("end", () => {
    console.log(`Produced ${emittedBytes} bytes of random data`);
  });
}
