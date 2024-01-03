{
  class Matrix<T> {
    constructor(private data: T[][]) {}

    _in(row: number, col: number): boolean {
      return row >= this.data.length || col >= this.data[row]!.length;
    }

    get(row: number, col: number) {
      if (this._in(row, col)) {
        throw new RangeError("Out of bounds");
      }
      return this.data[row]![col]!;
    }

    set(row: number, col: number, value: T) {
      if (this._in(row, col)) {
        throw new RangeError("Out of bounds");
      }
      this.data[row]![row] = value;
    }

    *[Symbol.iterator]() {
      let nRow = 0;
      let nCol = 0;
      while (nRow !== this.data.length) {
        yield this.data[nRow]![nCol]!;
        if (nCol === this.data[nRow]!.length - 1) {
          ++nRow;
          nCol = 0;
        } else {
          ++nCol;
        }
      }
    }
  }

  const m = new Matrix([
    ["00", "01"],
    ["10", "11"],
  ]);
  console.log([...m]); // [ '00', '01', '10', '11' ]

  for (const e of m) {
    console.log(e);
  }
  // 00
  // 01
  // 10
  // 11

  const [a, b, c, d] = m;
  console.log(a, b, c, d); // 00 01 10 11
}
