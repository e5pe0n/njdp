import axios from "axios";
import { createReadStream } from "fs";
import { basename } from "path";
import { PassThrough, pipeline } from "stream";

{
  const createUploadStream = (filename: string): PassThrough => {
    const connector = new PassThrough();

    axios
      .post("http://localhost:3000", connector, {
        headers: {
          "Content-Type": "application/octet-stream",
          "X-Filename": filename,
        },
      })
      .catch((err) => {
        connector.emit(err);
      });

    return connector;
  };

  const filepath = process.argv[2]!;
  const filename = basename(filepath);

  pipeline(createReadStream(filepath), createUploadStream(filename), (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log("File uploaded");
  });
}
