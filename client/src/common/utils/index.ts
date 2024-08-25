export function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours > 0 ? `${hours}:` : "";
  const formattedMinutes = hours > 0 ? `${minutes.toString().padStart(2, "0")}:` : `${minutes}:`;
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
}

export function convertBytesToReadablyFormat(bytes?: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  while (bytes > 1024 && unitIndex < units.length) {
    bytes /= 1024;
    unitIndex++;
  }
  return `${bytes.toFixed(2)} ${units[unitIndex]}`;
}
