import { createGzip, createGunzip } from "zlib";
import {
  BinaryLike,
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";
import Pumpify from "pumpify";
import { pipeline } from "stream";
import { createReadStream, createWriteStream } from "fs";

{
  const createKey = (password: string) => scryptSync(password, "salt", 24);

  const createCompressAndEncrypt = (password: string, iv: BinaryLike) => {
    const key = createKey(password);
    return new Pumpify(createGzip(), createCipheriv("aes-192-ccm", key, iv));
  };

  const createDecryptAndDecompress = (password: string, iv: BinaryLike) => {
    const key = createKey(password);
    return new Pumpify(
      createDecipheriv("aes-192-ccm", key, iv),
      createGunzip()
    );
  };

  const main = () => {
    const [, , password, src] = process.argv;
    const iv = randomBytes(16);
    const dest = `${src}.gz.enc`;

    pipeline(
      createReadStream(src!),
      createCompressAndEncrypt(password!, iv),
      createWriteStream(dest),
      (err) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log(`${dest} created with iv: ${iv.toString("hex")}`);
      }
    );
  };
}
