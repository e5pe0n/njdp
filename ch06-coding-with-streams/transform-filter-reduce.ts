import { Transform, TransformCallback, TransformOptions } from "stream";
import { parse } from "csv-parse";
import { createReadStream } from "fs";
import { createGunzip, createGzip } from "zlib";
import path from "path";

{
  type Rec = {
    type: string;
    country: string;
    profit: string;
  };

  class FilterByCountry extends Transform {
    country: string;

    constructor(country: string, options?: TransformOptions) {
      super({ ...options, objectMode: true });
      this.country = country;
    }

    _transform(
      record: Rec,
      encoding: BufferEncoding,
      callback: TransformCallback
    ): void {
      if (record.country === this.country) {
        this.push(record);
      }
      callback();
    }
  }

  class SumProfit extends Transform {
    total: number;

    constructor(options?: TransformOptions) {
      super({ ...options, objectMode: true });
      this.total = 0;
    }

    _transform(
      record: Rec,
      encoding: BufferEncoding,
      callback: TransformCallback
    ): void {
      this.total += Number.parseFloat(record.profit);
      callback();
    }

    _flush(callback: TransformCallback): void {
      this.push(this.total.toString());
      callback();
    }
  }

  const csvParser = parse({ columns: true });
  createReadStream(path.join(__dirname, "data.csv.gz"))
    .pipe(createGunzip())
    .pipe(csvParser)
    .pipe(new FilterByCountry("Italy"))
    .pipe(new SumProfit())
    .pipe(process.stdout); // 111261601.98999995
}
