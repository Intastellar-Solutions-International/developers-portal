export type BookmarkActionData = { ok: true } | { ok: false; error: string };

export type DocProfileSaveVariant =
  | "bookmark"
  | "mongo_off"
  | "sign_in"
  | "link_account";
