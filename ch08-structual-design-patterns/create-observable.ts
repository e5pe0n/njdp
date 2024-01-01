{
  type Observer<T extends object> = ({
    prop,
    prev,
    curr,
  }: {
    prop: keyof T;
    prev: T[keyof T];
    curr: T[keyof T];
  }) => void;

  function createObservable<T extends object>(
    target: T,
    observer: Observer<T>
  ) {
    return new Proxy(target, {
      /** @ts-ignore */
      set(target, p: keyof T, newValue: T[keyof T], receiver) {
        if (newValue !== target[p]) {
          const prev = target[p];
          target[p] = newValue;
          observer({ prop: p, prev, curr: newValue });
        }
        return true;
      },
    });
  }

  type Invoice = {
    subtotal: number;
    discount: number;
    tax: number;
  };

  function calTotal(invoice: Invoice): number {
    return invoice.subtotal - invoice.discount + invoice.tax;
  }

  const invoice: Invoice = {
    subtotal: 100,
    discount: 10,
    tax: 20,
  };

  let total = calTotal(invoice);
  console.log(`Starting total: ${total}`);

  const obsInvoice = createObservable(invoice, ({ prop, prev, curr }) => {
    total = calTotal(invoice);
    console.log(`TOTAL: ${total} (${prop} changed: ${prev} -> ${curr})`);
  });
  obsInvoice.subtotal = 200;
  obsInvoice.discount = 20;
  obsInvoice.discount = 20;
  obsInvoice.tax = 30;

  console.log(`Final total: ${total}`);
}

// Starting total: 110
// TOTAL: 210 (subtotal changed: 100 -> 200)
// TOTAL: 200 (discount changed: 10 -> 20)
// TOTAL: 210 (tax changed: 20 -> 30)
// Final total: 210
