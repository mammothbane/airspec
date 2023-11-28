export const BACKEND = window.location.href.startsWith('https://')
  ? 'https://api.airspecs.resenv.org'
  : 'http://localhost:8080';


/**
 * Find holes in a sorted array of numbers, returning tuples of [start, size] where there are holes
 * with numbers missing. Assume the "original" array was of size n (i.e. there is a "final hole" if
 * the array doesn't terminate with an element `n - 1`).
 *
 * The array must not contain elements >= n.
 */
export const holes = (ary: number[], n: number): [number, number][] => {
  const result = ary.reduce((acc: [number, [number, number][]], x) => {
    if (x >= n) throw new Error('desired n in array is wrong');

    const last = acc[0];

    if (x !== last + 1) {
      const hole_start = last + 1;
      const hole_size = x - hole_start;

      acc[1].push([hole_start, hole_size]);
    }

    acc[0] = x;
    return acc;
  }, [-1, []])[1];

  let end_ary = -1;
  if (ary.length > 0) end_ary = ary[ary.length - 1];

  if (end_ary !== n - 1) result.push([end_ary + 1, n - end_ary - 1]);

  return result;
}

if ('Deno' in window) {
  const testHoles = (ary: number[], n: number) => {
    const result = holes(ary, n);

    console.debug({
      ary,
      n,
      result,
    });
  }


  testHoles([], 7);
  testHoles([0, 1, 2, 3], 7);
  testHoles([2, 3],  7);
  testHoles([6], 7);
  testHoles([0, 3, 6], 7);
  testHoles([0, 2, 4, 6], 7);
}
