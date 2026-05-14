const ABSOLUTE_ISO_TIMESTAMP_PATTERN = /(?:Z|[+-]\d{2}:\d{2})$/;

export function parseAbsoluteApiTimestamp(timestamp: string): number | null {
  if (!ABSOLUTE_ISO_TIMESTAMP_PATTERN.test(timestamp)) {
    return null;
  }

  const milliseconds = new Date(timestamp).getTime();
  return Number.isFinite(milliseconds) ? milliseconds : null;
}
