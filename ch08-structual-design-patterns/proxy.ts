{
  class StackCalculator {
    stack: number[];

    constructor() {
      this.stack = [];
    }

    putValue(value: number) {
      this.stack.push(value);
    }

    getValue() {
      return this.stack.pop();
    }

    peekValue() {
      return this.stack.at(-1);
    }

    clear() {
      this.stack = [];
    }

    div() {
      const divisor = this.getValue()!;
      const dividend = this.getValue()!;
      const res = divisor / dividend;
      this.putValue(res);
      return res;
    }

    mul() {
      const multiplicand = this.getValue()!;
      const multiplier = this.getValue()!;
      const res = multiplier * multiplicand;
      this.putValue(res);
      return res;
    }
  }

  const c = new StackCalculator();
  const sc = new Proxy(c, {
    get(target, p: keyof StackCalculator, receiver) {
      if (p === "div") {
        return function () {
          const divisor = target.peekValue();
          if (divisor === 0) {
            throw new Error("Division by 0");
          }
          return target.div();
        };
      }
      return target[p];
    },
  });

  sc.putValue(1);
  sc.putValue(0);
  try {
    sc.div();
  } catch (err) {
    console.error(err);
  }
  console.log(sc.mul());
  console.log(sc.getValue());
  console.log(sc instanceof StackCalculator); // true
}
