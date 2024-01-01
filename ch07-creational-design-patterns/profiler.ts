{
  class Profiler {
    label: string;
    _start: bigint | null;

    constructor(label: string) {
      this.label = label;
      this._start = null;
      this._start = null;
    }

    start() {
      this._start = process.hrtime.bigint();
    }

    end() {
      if (!this._start) {
        throw new Error("Not started");
      }
      const diff = process.hrtime.bigint() - this._start;
      console.log(`Timer "${this.label}" took ${diff} ns`);
    }
  }

  const noopProfiler = {
    start() {},
    end() {},
  };

  const createProfiler = (label: string) =>
    process.env.NODE_ENV === "production" ? noopProfiler : new Profiler(label);

  const getAllFactors = (intN: number) => {
    const p = createProfiler(`Finding all factors of ${intN}`);
    p.start();
    const factors: number[] = [];
    for (let factor = 2; factor <= intN; ++factor) {
      while (intN % factor === 0) {
        factors.push(factor);
        intN = intN / factor;
      }
    }
    p.end();
    return factors;
  };

  const main = () => {
    const n = Number(process.argv[2]!);
    const factors = getAllFactors(n);
    console.log(`Factors of ${n} are:`, factors);
  };

  main();
}
