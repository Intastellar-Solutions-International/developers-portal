import type { Locale } from "~/lib/i18n/locale";
import { translatePath } from "~/lib/i18n/messages";

/** Maps server-side English API key errors to message paths (see `apiKeys.errors`). */
const API_KEY_ERROR_PATH: Record<string, string> = {
  "Sign in again to manage API keys.": "apiKeys.errors.signInAgain",
  "Database is not configured on the server.": "apiKeys.errors.dbNotConfiguredOnServer",
  "Unknown action.": "apiKeys.errors.unknownAction",
  "Database is not configured.": "apiKeys.errors.dbNotConfigured",
  "Enter a label for this key.": "apiKeys.errors.enterLabel",
  "Sign-in domain looks invalid. Use a hostname such as app.example.com (you may paste a full https URL — we store the host only).":
    "apiKeys.errors.domainInvalidCreate",
  "Sign-in logo must be a valid https:// image URL (or leave it blank).":
    "apiKeys.errors.logoInvalidCreateImage",
  "Server misconfiguration: set API_KEY_PEPPER (long random secret) in production.":
    "apiKeys.errors.pepperMissing",
  "Invalid key id.": "apiKeys.errors.invalidKeyId",
  "Key not found or already revoked.": "apiKeys.errors.keyNotFound",
  "This key has no encrypted secret on file (usually created before reveal support). Create a new key to use reveal and copy later.":
    "apiKeys.errors.noEncryptedOnFile",
  "Could not decrypt this key (server secret may have changed). Create a new key.":
    "apiKeys.errors.decryptFailed",
  "Sign-in domain looks invalid. Use a hostname such as app.example.com.":
    "apiKeys.errors.domainInvalidUpdate",
  "Sign-in logo must be a valid https:// URL or left blank.":
    "apiKeys.errors.logoInvalidUpdateUrl",
};

export function translateApiKeyServerError(
  locale: Locale,
  message: string,
): string {
  const path = API_KEY_ERROR_PATH[message];
  return path ? translatePath(locale, path) : message;
}
