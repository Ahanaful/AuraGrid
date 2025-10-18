export const env = {
  WORKER_BASE_URL: process.env.NEXT_PUBLIC_WORKER_BASE_URL ?? "",
};

export function withWorkerBase(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with '/' but received: ${path}`);
  }

  if (!env.WORKER_BASE_URL) {
    return path;
  }

  const trimmed = env.WORKER_BASE_URL.replace(/\/$/, "");
  return `${trimmed}${path}`;
}
