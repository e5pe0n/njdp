import { PathLike, promises as fs } from "fs";
import objectPath, { Path } from "object-path";
import ini from "ini";
import { fileURLToPath } from "url";
import path from "path";

{
  type FmtStrategy = {
    deserialize: (data: string) => object;
    serialize: (data: object) => string;
  };

  class Config {
    private data: object;

    constructor(private fmtStrategy: FmtStrategy) {
      this.data = {};
    }

    get(configPath: Path) {
      return objectPath.get(this.data, configPath);
    }

    set(configPath: Path, value: any) {
      return objectPath.set(this.data, configPath, value);
    }

    async load(filePath: PathLike) {
      console.log(`Deserializing from ${filePath}`);
      this.data = this.fmtStrategy.deserialize(
        await fs.readFile(filePath, "utf-8")
      );
    }

    async save(filePath: PathLike) {
      console.log(`Serializing to ${filePath}`);
      await fs.writeFile(filePath, this.fmtStrategy.serialize(this.data));
    }
  }

  const iniStrategy: FmtStrategy = {
    deserialize: (data) => ini.parse(data),
    serialize: (data) => ini.stringify(data),
  };

  const jsonStrategy: FmtStrategy = {
    deserialize: (data) => JSON.parse(data),
    serialize: (data) => JSON.stringify(data),
  };

  async function main() {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const ip = path.join(__dirname, "conf.ini");
    const iniConfig = new Config(iniStrategy);
    await iniConfig.load(ip);
    iniConfig.set("book.nodejs", "design patterns");
    await iniConfig.save(ip);

    const jp = path.join(__dirname, "conf.json");
    const jsonConfig = new Config(jsonStrategy);
    await jsonConfig.load(jp);
    jsonConfig.set("book.nodejs", "design patterns");
    await jsonConfig.save(jp);
  }

  main();
}
