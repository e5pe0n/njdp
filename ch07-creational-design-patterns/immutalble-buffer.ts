{
  const MODIFIER_NAMES = [
    "swap16",
    "swap32",
    "swap64",
    "write",
    "fill",
  ] satisfies (keyof Buffer)[];

  type Modifiers = Pick<Buffer, (typeof MODIFIER_NAMES)[number]>;

  class ImmutableBuffer {
    constructor(size: number, executor: (modifiers: Modifiers) => void) {
      const buf = Buffer.alloc(size);
      const modifiers: any = {};
      for (const prop of Object.keys(buf) as (keyof Buffer)[]) {
        const value = buf[prop];
        if (!(typeof value === "function" && typeof prop === "string")) {
          continue;
        }
        if (MODIFIER_NAMES.some((m) => prop.startsWith(m))) {
          modifiers[prop] = value.bind(buf);
        } else {
          /** @ts-ignore */
          this[prop] = value.bind(buf);
        }
      }
      executor(modifiers);
    }
  }

  const hello = "Hello!";
  const ib = new ImmutableBuffer(hello.length, ({ write }) => write(hello));
}
