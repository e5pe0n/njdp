import axios from "axios";
import { createReadStream } from "fs";
import { basename } from "path";
import { PassThrough } from "stream";
import { createBrotliCompress } from "zlib";

{
  const upload = (filename: string, contentStream: PassThrough) =>
    axios.post("http://localhost:3000", contentStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "X-Filename": filename,
      },
    });

  const filepath = process.argv[2]!;
  const filename = basename(filepath);
  const contentStream = new PassThrough();

  upload(`${filename}.br`, contentStream)
    .then((res) => {
      console.log(`Server response: ${res.data}`);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });

  createReadStream(filepath).pipe(createBrotliCompress()).pipe(contentStream);
}
