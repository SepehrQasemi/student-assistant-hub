export function isFingerprintStale(currentFingerprint: string, artifactFingerprint: string) {
  return Boolean(currentFingerprint) && Boolean(artifactFingerprint) && currentFingerprint !== artifactFingerprint;
}
