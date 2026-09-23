/** Next.js search params can arrive as a repeated key (`?ids=1&ids=2`), which
 * resolves to `string[]` rather than `string`. Server pages that only care
 * about a single value should go through this instead of `as string`, which
 * would silently coerce the array to `"1,2"` (an Array.prototype.toString)
 * rather than picking a value. */
export function getParamString(param: string | string[] | undefined): string {
  if (!param) return "";
  return Array.isArray(param) ? param[0] || "" : param;
}
