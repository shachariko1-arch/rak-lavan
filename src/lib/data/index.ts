import { createDemoRepository } from "./demo-repo";
import { isSupabaseConfigured } from "./repository";
import type { Repository } from "./repository";
import { createSupabaseRepository } from "./supabase-repo";

let instance: Repository | null = null;

/**
 * The single data access point for the app. With Supabase environment variables set it
 * talks to Supabase; without them it runs entirely in the browser on the demo wedding.
 * Call it from the browser only (effects and event handlers).
 */
export function getRepository(): Repository {
  if (!instance) instance = isSupabaseConfigured() ? createSupabaseRepository() : createDemoRepository();
  return instance;
}

export const dataMode = (): "demo" | "supabase" => (isSupabaseConfigured() ? "supabase" : "demo");

export * from "./repository";
export { RsvpError } from "./rsvp";
export { StorageFullError } from "./demo-repo";
