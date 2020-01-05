import { Seq } from "../Seq";

describe("Seq", () => {
  describe("range", () => {
    test("should lazily pull from the range", () => {
      const cb = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .take(4)
        .toArray();

      expect(result).toEqual([0, 1, 2, 3]);
      expect(cb).toHaveBeenCalledTimes(4);
    });
  });

  describe("map", () => {
    test("should work like normal map", () => {
      const TIMES = 3;
      const cb = jest.fn();

      const result = Seq.range(TIMES)
        .tap(cb)
        .map((v, i) => v * 4 - i)
        .toArray();

      expect(result).toEqual([0, 3, 6]);
      expect(cb).toHaveBeenCalledTimes(TIMES);
    });

    test("should only map once if only 1 result is asked for", () => {
      const cb = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .map((v, i) => v * 4 - i)
        .first();

      expect(result).toEqual(0);
      expect(cb).toHaveBeenCalledTimes(1);
    });

    test("should only map for each item taken", () => {
      const cb = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .map((v, i) => v * 4 - i)
        .take(2)
        .toArray();

      expect(result).toEqual([0, 3]);
      expect(cb).toHaveBeenCalledTimes(2);
    });
  });

  describe("flatMap", () => {
    test("should work like normal flatMap", () => {
      const cb = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .flatMap((v, i) => [v * 4 - i, -1000])
        .take(6)
        .toArray();

      expect(result).toEqual([0, -1000, 3, -1000, 6, -1000]);
      expect(cb).toHaveBeenCalledTimes(3);
    });
  });

  describe("takeWhile", () => {
    test("should request values until the predicate is false", () => {
      const cb = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .takeWhile(val => val < 4)
        .toArray();

      expect(result).toEqual([0, 1, 2, 3]);
      expect(cb).toHaveBeenCalledTimes(5); // Take-while always calls +1
    });
  });

  describe("filter", () => {
    test("should request values until the predicate is false, but only keep the odd ones", () => {
      const cb = jest.fn();
      const cb2 = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .filter(val => val % 2 !== 0)
        .tap(cb2)
        .take(5)
        .toArray();

      expect(result).toEqual([1, 3, 5, 7, 9]);
      expect(cb).toHaveBeenCalledTimes(10); // Searches through both even AND odd
      expect(cb2).toHaveBeenCalledTimes(5);
    });
  });

  describe("find", () => {
    test("should find the first matching item", () => {
      const cb = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .find(val => val === 3);

      expect(result).toEqual(3);
      expect(cb).toHaveBeenCalledTimes(4);
    });
  });

  describe("some", () => {
    test("should some as soon as we find some", () => {
      const cb = jest.fn();

      const result = Seq.infinite()
        .tap(cb)
        .some(val => val === 3);

      expect(result).toEqual(true);
      expect(cb).toHaveBeenCalledTimes(4);
    });
  });

  describe("every", () => {
    test("should work like normal every", () => {
      const result = Seq.fromArray([1, 3, 5]).every(val => val % 2 !== 0);

      expect(result).toEqual(true);
    });
  });

  describe("zip", () => {
    test("should combine two sequences", () => {
      const result = Seq.zip(Seq.infinite(), Seq.infinite())
        .take(4)
        .toArray();

      expect(result).toEqual([
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3]
      ]);
    });
  });

  describe("zipWith", () => {
    test("should combine two sequences with a combinator function", () => {
      const result = Seq.zipWith(
        ([result1, result2], index) => [
          index,
          result1 && result2 ? result1 + result2 : -1000
        ],
        Seq.fromArray([1, 2, 3]),
        Seq.fromArray([10, 20])
      )
        .take(4)
        .toArray();

      expect(result).toEqual([11, 22, -1000]);
    });
  });
});
