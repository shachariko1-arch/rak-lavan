import "server-only";

// Placeholder until the auth layer lands (replaced in the backend phase).
export async function getSessionUserSafe(): Promise<{ id: string } | null> {
  return null;
}
