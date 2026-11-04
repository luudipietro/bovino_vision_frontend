import { apiGet } from "./client";

export function getHealth(): Promise<{ status: string }> {
  return apiGet("/health");
}
