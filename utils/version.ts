/**
 * Returns true if the current version is older than the minimum required version.
 * Compares semver strings (e.g. "1.0.0" vs "1.1.0").
 */
export function isUpdateRequired(current: string, minimum: string): boolean {
  const parse = (v: string) => v.split('.').map(Number);
  const [cMaj, cMin, cPatch] = parse(current);
  const [mMaj, mMin, mPatch] = parse(minimum);
  if (cMaj !== mMaj) return cMaj < mMaj;
  if (cMin !== mMin) return cMin < mMin;
  return cPatch < mPatch;
}
