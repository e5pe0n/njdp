import { inflateRaw, deflateRaw } from "zlib";
import { promisify } from "util";

const inflateRawAsync = promisify(inflateRaw);
const deflateRawAsync = promisify(deflateRaw);

export const zlibMiddleware = function () {
  return {
    inbound(message: any) {
      return inflateRawAsync(Buffer.from(message));
    },
    outbound(message: any) {
      return deflateRawAsync(message);
    },
  };
};
