const { generate_object } = require('../generate_object');

describe('generate_object', () => {
  test('should throw an error if option, data or data values are not provided', () => {
    expect(() => generate_object()).toThrow();
    expect(() => generate_object({})).toThrow();
    expect(() => generate_object({ data: {} })).toThrow();
  });

  test('should not throw an error if only option.data is provided with many properties', () => {
    const data = [
      { a: [1] },
      { a: [1], b: [1] },
      { a: [1], b: [1], c: [1] },
      { a: [1], b: [1], c: [1], d: [1] },
    ];

    data.forEach((_data) =>
      expect(() => generate_object({ data: _data })).not.toThrow()
    );
  });

  test('should throw an error if any of the data values is not an array', () => {
    const tests = [
      { a: 1 },
      { a: 'one' },
      { a: true },
      { a: null },
      { a: undefined },
      { a: {} },
      { a: () => {} },
    ];
    tests.forEach((_data) => {
      expect(() => generate_object({ data: _data })).toThrow();
    });
  });

  test('should throw an error on data values length mismatch', () => {
    const data = [
      { a: [1], b: [1, 2] },
      { a: [1, 2], b: [1] },
      { a: [1, 2], b: [1, 2, 3] },
      { a: [1, 2, 3], b: [1, 2] },
      { a: [1], b: [1], c: [1, 2, 3, 4] },
    ];

    data.forEach((_data) =>
      expect(() => generate_object({ data: _data })).toThrow()
    );
  });

  test('should not throw an error if all data values are arrays of the same length', () => {
    expect(() => generate_object({ data: { a: [1], b: [1] } })).not.toThrow();
  });

  test('should throw an error if option.each does not return an object', () => {
    expect(() =>
      generate_object({
        data: {
          a: [1],
        },
        each: () => {},
      })
    ).toThrow();
  });

  test('should throw an error if option.each does not return an object with a key property', () => {
    const tests = [
      () => {},
      () => 1,
      () => 'one',
      () => true,
      () => null,
      () => undefined,
      () => [],
    ];

    tests.forEach((each) => {
      expect(() =>
        generate_object({
          data: {
            a: [1],
          },
          each,
        })
      ).toThrow();
    });
  });

  test('should assign correct attributes with one data value', () => {
    const tests = [
      [{ a: [1], b: [2] }, { 0: { a: 1, b: 2 } }],
      [{ a: ['one'], b: ['two'] }, { 0: { a: 'one', b: 'two' } }],
      [
        { a: ['one'], b: ['two'], c: ['three'] },
        { 0: { a: 'one', b: 'two', c: 'three' } },
      ],
    ];

    tests.forEach(([data, expected]) => {
      expect(generate_object({ data })).toEqual(expected);
    });
  });

  test('should assign correct attributes with two data values', () => {
    const tests = [
      [
        { a: [1, 2], b: [3, 4] },
        { 0: { a: 1, b: 3 }, 1: { a: 2, b: 4 } },
      ],
      [
        { a: ['one', 'two'], b: ['three', 'four'] },
        { 0: { a: 'one', b: 'three' }, 1: { a: 'two', b: 'four' } },
      ],
      [
        { a: ['one', 'two'], b: ['three', 'four'], c: ['five', 'six'] },
        {
          0: { a: 'one', b: 'three', c: 'five' },
          1: { a: 'two', b: 'four', c: 'six' },
        },
      ],
    ];

    tests.forEach(([data, expected]) => {
      expect(generate_object({ data })).toEqual(expected);
    });
  });

  test('should modify each element correctly if option.each is provided', () => {
    // Scope each test to avoid variable name collisions.

    (() => {
      expect(
        generate_object({
          data: {
            a: [1, 2],
            b: [3, 4],
          },
          each: (key, _) => {
            return { key: key, value: undefined };
          },
        })
      ).toEqual({
        0: undefined,
        1: undefined,
      });
    })();

    (() => {
      const KEY = 'KEY';
      const accumulated = [];
      expect(
        generate_object({
          data: {
            a: ['one'],
            b: ['two'],
          },
          each: (key, value) => {
            accumulated.push(value);

            return {
              key: KEY,
              value: accumulated,
            };
          },
        })
      ).toEqual({ [KEY]: accumulated });
    })();

    (() => {
      expect(
        generate_object({
          data: {
            a: ['a'],
            b: ['b'],
          },
          each: (key, _) => {
            return { key };
          },
        })
      ).toEqual({ 0: undefined });
    })();

    (() => {
      let MAIN_KEY = '0';
      expect(
        generate_object({
          data: {
            a: ['one', 'two'],
            b: ['one', 'two'],
          },
          each: (key, value) => {
            return {
              key,
              value: {
                ...value,
                property: key === MAIN_KEY ? 'main' : 'other',
              },
            };
          },
        })
      ).toEqual({
        0: { a: 'one', b: 'one', property: 'main' },
        1: { a: 'two', b: 'two', property: 'other' },
      });
    })();
  });

  test('should modify two elements correctly if option.modify is provided correctly', () => {
    // Scope each test to avoid variable name collisions.

    (() => {
      const keyA = '0';
      const keyB = '1';
      expect(
        generate_object({
          data: {
            a: [1, 2],
            b: [3, 4],
          },
          modify: {
            keyA,
            keyB,
            cb: (valueA, valueB) => {
              return {
                [keyA]: valueA,
                [keyB]: valueB,
              };
            },
          },
        })
      ).toStrictEqual({
        0: { a: 1, b: 3 },
        1: { a: 2, b: 4 },
      });
    })();

    (() => {
      const keyA = '0';
      const keyB = '1';
      expect(
        generate_object({
          data: {
            a: [1, 2],
            b: [3, 4],
          },
          modify: {
            keyA,
            keyB,
            cb: (valueA, valueB) => {
              return {
                [keyA]: valueB,
                [keyB]: valueA,
              };
            },
          },
        })
      ).toStrictEqual({
        0: { a: 2, b: 4 },
        1: { a: 1, b: 3 },
      });
    })();
  });

  test('should silently ignore option if one of the option.modify keys is not present', () => {
    function cb(valueA, valueB) {
      return { 0: valueA, 1: valueB };
    }
    const modifies = [
      { keyOne: 0, cb },
      { keyTwo: 0, cb },
      { keyOne: 0, keyTwo: 1 },
    ];
    const data = {
      a: [1, 2],
      b: [3, 4],
    };
    const result = {
      0: { a: 1, b: 3 },
      1: { a: 2, b: 4 },
    };

    modifies.forEach((modify) => {
      expect(generate_object({ data, modify })).toStrictEqual(result);
    });
  });

  test('should silently ignore option if provided key does not exist', () => {
    const tests = [
      { keyA: 'a', keyB: 'b' },
      { keyA: 'b', keyB: 'a' },
      { keyA: undefined, keyB: null },
    ];
    const data = {
      a: [1, 2],
      b: [3, 4],
    };
    const result = {
      0: { a: 1, b: 3 },
      1: { a: 2, b: 4 },
    };

    tests.forEach((modify) => {
      expect(generate_object({ data, modify })).toStrictEqual(result);
    });
  });
});
