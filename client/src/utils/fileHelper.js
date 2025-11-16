// client/src/utils/fileHelper.js

/** read File object -> text */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/** Download a text file (browser) */
export function downloadTextFile(filename, content) {
  if (typeof window === "undefined") throw new Error("browser only");
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default {
  readFileAsText,
  downloadTextFile,
};
