import { PathLike, createReadStream, createWriteStream } from "fs";
import { Readable, Transform } from "stream";

{
  const concatFiles = (dest: PathLike, filenames: PathLike[]) =>
    new Promise<void>((resolve, reject) => {
      const destStream = createWriteStream(dest);
      Readable.from(filenames)
        .pipe(
          new Transform({
            objectMode: true,
            transform(filename: PathLike, encoding, callback) {
              const src = createReadStream(filename);
              src.pipe(destStream, { end: false });
              src.on("error", callback);
              src.on("end", callback);
            },
          })
        )
        .on("error", reject)
        .on("finish", () => {
          destStream.end();
          resolve();
        });
    });

  const main = async () => {
    try {
      await concatFiles(process.argv[2]!, process.argv.slice(3));
    } catch (err) {
      console.error(err);
      process.exit(1);
    }

    console.log("All files concatenated successfully");
  };
}
