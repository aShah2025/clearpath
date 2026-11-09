import "server-only";
import { randomUUID } from "node:crypto";
import { detectFileType, type AllowedFile } from "@/lib/storage/file-types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "documents";
let bucketReady = false;

async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.createBucket(BUCKET, { public: false });
  if (error && !/already exists/i.test(error.message)) throw error;
  bucketReady = true;
}

/** Stores a file under the owner's folder. The path never uses the user's filename. */
export async function storeDocumentFile(userId: string, bytes: Uint8Array, file: AllowedFile): Promise<string> {
  await ensureBucket();
  const path = `${userId}/${randomUUID()}.${file.extension}`;
  const { error } = await getSupabaseAdmin().storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.mediaType, upsert: false });
  if (error) throw error;
  return path;
}

export async function readDocumentFile(path: string): Promise<{ bytes: Uint8Array; file: AllowedFile }> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(path);
  if (error) throw error;
  const bytes = new Uint8Array(await data.arrayBuffer());
  const file = detectFileType(bytes);
  if (!file) throw new Error("Stored file has an unsupported type");
  return { bytes, file };
}

export async function deleteDocumentFile(path: string): Promise<void> {
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
