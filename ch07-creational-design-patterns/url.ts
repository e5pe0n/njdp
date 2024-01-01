{
  class Url {
    constructor(
      public protocol: string,
      public username: string | undefined,
      public password: string | undefined,
      public hostname: string,
      public port: number | undefined,
      public pathname: string | undefined,
      public search: string | undefined,
      public hash: string | undefined
    ) {
      this.validate();
    }

    validate() {
      if (!(this.protocol && this.hostname)) {
        throw new Error("Must specify at least a `protocol` and `hostname`");
      }
    }

    toString() {
      let url = "";
      url += `${this.protocol}://`;
      if (this.username && this.password) {
        url += `${this.username}:${this.password}@`;
      }
      url += this.hostname;
      if (this.port) {
        url += this.port;
      }
      if (this.pathname) {
        url += this.pathname;
      }
      if (this.search) {
        url += `?${this.search}`;
      }
      if (this.hash) {
        url += `#${this.hash}`;
      }
      return url;
    }
  }

  class UrlBuilder {
    #protocol?: string;
    #username?: string;
    #password?: string;
    #hostname?: string;
    #port?: number;
    #pathname?: string;
    #search?: string;
    #hash?: string;

    setProtocol(protocol: string) {
      this.#protocol = protocol;
      return this;
    }

    setAuthentication(username: string, password: string) {
      this.#username = username;
      this.#password = password;
      return this;
    }

    setHostname(hostname: string) {
      this.#hostname = hostname;
      return this;
    }

    setPort(port: number) {
      this.#port = port;
      return this;
    }

    setPathname(pathname: string) {
      this.#pathname = pathname;
      return this;
    }

    setSearch(search: string) {
      this.#search = search;
      return this;
    }

    setHash(hash: string) {
      this.#hash = hash;
      return this;
    }

    build() {
      return new Url(
        this.#protocol!,
        this.#username,
        this.#password,
        this.#hostname!,
        this.#port,
        this.#pathname,
        this.#search,
        this.#hash
      );
    }
  }

  const url = new UrlBuilder()
    .setProtocol("https")
    .setAuthentication("user", "pass")
    .setHostname("example.com")
    .build();
  console.log(url.toString());
}
