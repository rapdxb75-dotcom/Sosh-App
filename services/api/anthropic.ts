const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = process.env.EXPO_PUBLIC_ANTHROPIC_API_URL;
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

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

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("x-api-key", ANTHROPIC_API_KEY || "");
        xhr.setRequestHeader("anthropic-version", ANTHROPIC_VERSION);

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
          ...(systemPrompt ? { system: systemPrompt } : {}),
          messages: [
            ...history
              .filter(msg => msg.role && msg.content)
              .map(msg => ({
                role: msg.role.toLowerCase() === "user" ? "user" : "assistant",
                content: msg.content
              })),
            { role: "user", content }
          ],
          stream: true,
        };

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
      const payload = {
        model: DEFAULT_MODEL,
        max_tokens: 1024,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: [
          ...history.map(msg => ({
            role: msg.role.toLowerCase() === "user" ? "user" : "assistant",
            content: msg.content
          })),
          { role: "user", content }
        ],
      };


      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY || "",
          "anthropic-version": ANTHROPIC_VERSION,
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
