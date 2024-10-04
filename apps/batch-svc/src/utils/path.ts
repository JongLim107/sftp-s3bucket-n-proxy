export const removeFilenameFromPath = (path: string): string => {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/");
};

export const getFilenameFromPath = (path: string): string => {
  const parts = path.split("/");
  return parts.pop() || "";
};

// convert the path to S3 operation prefix format
export const convertToS3Prefix = (path: string): string => {
  return path.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
};
