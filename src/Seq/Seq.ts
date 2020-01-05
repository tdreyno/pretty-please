// tslint:disable: max-classes-per-file

export class Seq<K, T> {
  public static fromArray<T>(data: T[]): Seq<number, T> {
    return new Seq(() => data.entries());
  }

  public static fromSet<T>(data: Set<T>): Seq<T, T> {
    return new Seq(() => data.entries());
  }

  public static fromMap<K, T>(data: Map<K, T>): Seq<K, T> {
    return new Seq(() => data.entries());
  }

  public static fromIterator<K, T>(
    data: () => IterableIterator<[K, T]>
  ): Seq<K, T> {
    return new Seq(data);
  }

  public static fromGenerator<K, T>(data: () => Generator<[K, T]>): Seq<K, T> {
    return new Seq(data);
  }

  public static range(end: number, start: number = 0): Seq<number, number> {
    return Seq.fromGenerator(function*() {
      const isForwards = end > start;

      if (isForwards) {
        for (let i = 0; start + i < end; i++) {
          yield [i, start + i];
        }
      } else {
        for (let i = 0; start - i > end; i++) {
          yield [i, start - i];
        }
      }
    });
  }

  public static empty(): Seq<unknown, never> {
    return Seq.fromArray([]);
  }

  public static infinite(): Seq<number, number> {
    return Seq.range(Infinity);
  }

  public static zipWith<K1, T1, K2, T2, K3, T3>(
    fn: (
      [result1, result2]: [T1, T2] | [T1, undefined] | [undefined, T2],
      index: number
    ) => [K3, T3],
    seq1: Seq<K1, T1>,
    seq2: Seq<K2, T2>
  ): Seq<K3, T3> {
    return new Seq(function*() {
      const iterator1 = seq1[Symbol.iterator]();
      const iterator2 = seq2[Symbol.iterator]();

      let counter = 0;

      while (true) {
        const result1 = iterator1.next();
        const result2 = iterator2.next();

        if (result1.done && result2.done) {
          return;
        }

        if (result1.done && !result2.done) {
          yield fn([undefined, result2.value[1]], counter);
        } else if (!result1.done && result2.done) {
          yield fn([result1.value[1], undefined], counter);
        } else if (!result1.done && !result2.done) {
          yield fn([result1.value[1], result2.value[1]], counter);
        }

        counter++;
      }
    });
  }

  public static zip<K1, T1, K2, T2>(
    seq1: Seq<K1, T1>,
    seq2: Seq<K2, T2>
  ): Seq<number, [T1 | undefined, T2 | undefined]> {
    return this.zipWith(
      ([result1, result2], index) => [index, [result1, result2]],
      seq1,
      seq2
    );
  }

  constructor(
    private source: () => Generator<[K, T]> | IterableIterator<[K, T]>
  ) {}

  public map<U>(fn: (value: T, key: K) => U): Seq<K, U> {
    const self = this;

    return new Seq(function*() {
      const iterator = self.source();

      for (const item of iterator) {
        yield [item[0], fn(item[1], item[0])];
      }
    });
  }

  public tap(fn: (value: T, key: K) => void): Seq<K, T> {
    return this.map((v, k) => {
      fn(v, k);

      return v;
    });
  }

  public log(): Seq<K, T> {
    // tslint:disable-next-line: no-console
    return this.tap((v, k) => console.log([k, v]));
  }

  public flatMap<U>(fn: (value: T, key: K) => U[]): Seq<number, U> {
    const self = this;

    return new Seq(function*() {
      const iterator = self.source();

      let counter = 0;

      for (const item of iterator) {
        const result = fn(item[1], item[0]);

        // Something about the yield/generator requires
        // this not be a for-of loop
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < result.length; i++) {
          yield [counter++, result[i]];
        }
      }
    });
  }

  public filter(fn: (value: T, key: K) => boolean): Seq<K, T> {
    const self = this;

    return new Seq(function*() {
      const iterator = self.source();

      for (const item of iterator) {
        if (fn(item[1], item[0])) {
          yield item;
        }
      }
    });
  }

  public find(fn: (value: T, key: K) => boolean): T | undefined {
    return this.filter(fn).first();
  }

  public fold<A>(fn: (sum: A, value: T, key: K) => A, initial: A): A {
    return this.toEntries().reduce(
      (sum, [key, value]) => fn(sum, value, key),
      initial
    );
  }

  public some(fn: (value: T, key: K) => boolean): boolean {
    for (const [k, v] of this) {
      if (fn(v, k)) {
        return true;
      }
    }

    return false;
  }

  public every(fn: (value: T, key: K) => boolean): boolean {
    return this.toEntries().every(([key, value]) => fn(value, key));
  }

  public takeWhile(fn: (value: T, key: K) => boolean): Seq<K, T> {
    const self = this;

    return new Seq(function*() {
      const iterator = self.source();

      while (true) {
        const result = iterator.next();

        if (result.done) {
          return;
        }

        if (!fn(result.value[1], result.value[0])) {
          return;
        }

        yield result.value;
      }
    });
  }

  public take(num: number): Seq<K, T> {
    const self = this;

    return new Seq(function*() {
      const iterator = self.source();

      for (let i = 0; i < num; i++) {
        const result = iterator.next();

        if (result.done) {
          return;
        }

        yield result.value;
      }
    });
  }

  public first(): T | undefined {
    return this.take(1).toArray()[0];
  }

  public [Symbol.iterator]() {
    return this.source();
  }

  public toEntries(): Array<[K, T]> {
    return [...this];
  }

  public toArray(): T[] {
    return this.toEntries().map(([_, value]) => value);
  }

  public toSet(): Set<T> {
    return new Set(this.toArray());
  }

  public toMap(): Map<K, T> {
    return new Map(this.toEntries());
  }

  public forEach(fn: (value: T, key: K) => void): void {
    for (const result of this) {
      fn(result[1], result[0]);
    }
  }
}
