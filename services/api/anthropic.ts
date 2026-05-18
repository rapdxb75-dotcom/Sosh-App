const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = process.env.EXPO_PUBLIC_ANTHROPIC_API_URL;
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";
// Enable prompt caching — requires this beta header
const ANTHROPIC_BETA = "prompt-caching-2024-07-31";

class AnthropicService {

  /**
   * Stream a message from Anthropic API
   * @param content The user's message
   * @param onChunk Callback for each text chunk received
   * @param systemPrompt Optional dynamic system prompt from Firebase
   * @returns Promise<string> The full response text
   */
  async streamMessage(
    content: string,
    onChunk: (delta: string) => void,
    systemPrompt?: string,
    history: { role: string; content: string }[] = [],
  ): Promise<string> {
    const url = `${ANTHROPIC_API_URL}/messages`;

    try {
      console.log("🦋 Starting Anthropic stream request...");
      console.log("📝 System Prompt:", systemPrompt ? "Present" : "None");
      console.log(`📜 History items passed: ${history.length}`);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("x-api-key", ANTHROPIC_API_KEY || "");
        xhr.setRequestHeader("anthropic-version", ANTHROPIC_VERSION);
        // Required header to activate prompt caching
        xhr.setRequestHeader("anthropic-beta", ANTHROPIC_BETA);

        let fullText = "";
        let processedLength = 0;

        xhr.onprogress = () => {
          const currentResponse = xhr.responseText;
          const newData = currentResponse.substring(processedLength);
          processedLength = currentResponse.length;

          // Anthropic SSE format: event: message_start, data: {...}
          // We look for text_delta events
          const lines = newData.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const jsonStr = line.substring(6);
                const data = JSON.parse(jsonStr);

                if (data.type === "content_block_delta" && data.delta?.text) {
                  const delta = data.delta.text;
                  fullText += delta;
                  onChunk(delta);
                }
              } catch (e) {
                // Ignore parse errors for incomplete lines
              }
            }
          }
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log("✅ Anthropic stream complete");
              resolve(fullText);
            } else {
              console.error("❌ Anthropic API Error:", xhr.status, xhr.responseText);
              reject(new Error(`Anthropic API Error: ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network request failed"));
        };

        const payload = {
          model: DEFAULT_MODEL,
          max_tokens: 1024,
          // cache_control belongs inside content blocks, not at top level.
          // Cache the system prompt (if present) — this is the most token-heavy part.
          ...(systemPrompt
            ? {
                system: [
                  {
                    type: "text",
                    text: systemPrompt,
                    cache_control: { type: "ephemeral" }, // ✅ cached here
                  },
                ],
              }
            : {}),
          messages: [
            // History messages — pass through as-is (no caching needed per message)
            ...history
              .filter(msg => msg.role && msg.content)
              .map(msg => ({
                role: msg.role.toLowerCase() === "user" ? "user" : "assistant",
                content: msg.content,
              })),
            // Latest user message — mark as cache breakpoint
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: content,
                  cache_control: { type: "ephemeral" }, // ✅ cached here
                },
              ],
            },
          ],
          stream: true,
        };

        console.log("📤 Anthropic Payload:", JSON.stringify(payload, null, 2));
        xhr.send(JSON.stringify(payload));
      });
    } catch (error) {
      console.error("❌ Anthropic stream error:", error);
      throw error;
    }
  }

  /**
   * Non-streaming message generation (matching the provided curl)
   */
  async generateMessage(content: string, systemPrompt?: string, history: { role: string; content: string }[] = []): Promise<string> {
    const url = `${ANTHROPIC_API_URL}/messages`;

    try {
      console.log("🦋 Starting Anthropic non-streaming request...");
      console.log("📝 System Prompt:", systemPrompt);

      const payload = {
        model: DEFAULT_MODEL,
        max_tokens: 1024,
        // Cache the system prompt (if present)
        ...(systemPrompt
          ? {
              system: [
                {
                  type: "text",
                  text: systemPrompt,
                  cache_control: { type: "ephemeral" }, // ✅ cached here
                },
              ],
            }
          : {}),
        messages: [
          ...history.map(msg => ({
            role: msg.role.toLowerCase() === "user" ? "user" : "assistant",
            content: msg.content,
          })),
          // Latest user message — mark as cache breakpoint
          {
            role: "user",
            content: [
              {
                type: "text",
                text: content,
                cache_control: { type: "ephemeral" }, // ✅ cached here
              },
            ],
          },
        ],
      };

      console.log("📤 Anthropic Payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY || "",
          "anthropic-version": ANTHROPIC_VERSION,
          // Required header to activate prompt caching
          "anthropic-beta": ANTHROPIC_BETA,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error("❌ Anthropic generation error:", error);
      throw error;
    }
  }
}

export default new AnthropicService();
