export function formatAddress(addr: string, chars = 6): string {
  if (addr.length <= chars * 2) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}
