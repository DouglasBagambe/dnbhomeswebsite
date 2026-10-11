export function accountRetry(retryAfter: string | null) {
  const seconds = retryAfter && /^\d{1,5}$/.test(retryAfter) ? Number(retryAfter) : 0;
  if (seconds < 1 || seconds > 86400) return { message: "Please wait a little before trying again.", retryAfter: undefined };
  const minutes = Math.ceil(seconds / 60);
  return {
    message: `Please wait ${minutes === 1 ? "a minute" : `${minutes} minutes`} before trying again.`,
    retryAfter: String(seconds),
  };
}
