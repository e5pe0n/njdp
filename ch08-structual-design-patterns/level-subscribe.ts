import path from "path";
import url from "url";
import { Level } from "level";

{
  type SubLevel<K, V extends object> = Level<K, V> & {
    subscribe: (
      pattern: V,
      listener: (key: keyof V, value: any) => void
    ) => void;
  };
  function levelSubscribe<K, V extends object>(
    db: Level<K, V>
  ): SubLevel<K, V> {
    /** @ts-ignore */
    db.subscribe = (
      pattern: V,
      listener: (key: keyof V, value: any) => void
    ) => {
      db.on("put", (key: keyof V, value: any) => {
        const match = Object.keys(pattern).every(
          (k) => pattern[k as keyof V] === value[k]
        );
        if (match) {
          listener(key, value);
        }
      });
    };
    return db as SubLevel<K, V>;
  }

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const dbPath = path.join(__dirname, "db");
  const db = new Level<string, Record<string, string>>(dbPath, {
    valueEncoding: "json",
  });
  const subDb = levelSubscribe(db);
  subDb.subscribe(
    {
      doctype: "tweet",
      language: "en",
    },
    (k, v) => console.log(v)
  );
  subDb.put("1", {
    doctype: "tweet",
    text: "Hi",
    language: "en",
  });
  subDb.put("2", {
    doctype: "company",
    name: "ACME Co.",
  });
}
