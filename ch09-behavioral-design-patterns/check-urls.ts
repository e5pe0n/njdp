import superagent from "superagent";

{
  class CheckUrls {
    constructor(private urls: Iterable<string>) {}

    async *[Symbol.asyncIterator]() {
      for (const url of this.urls) {
        try {
          const res = await superagent.head(url).redirects(2);
          yield `${url} is up, status: ${res.status}`;
        } catch (err) {
          yield `${url} is down, error: ${(err as Error).message}`;
        }
      }
    }
  }

  async function main() {
    const cu = new CheckUrls([
      "https://nodejsdesignpatterns.com",
      "https://example.com",
      "https://mustbedownforsurehopefully.com",
    ]);
    for await (const status of cu) {
      console.log(status);
    }
  }

  main();
}
