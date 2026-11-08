import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getServerEnv } from "@/lib/env";

export const ANALYSIS_MODEL = "claude-opus-5-5";

let client: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: getServerEnv().ANTHROPIC_API_KEY,
      // Two attempts of up to 110s each stay inside the analyze route's
      // 300s maxDuration.
      maxRetries: 1,
      timeout: 110_000,
    });
  }
  return client;
}
