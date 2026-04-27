const POPPY_API_KEY = process.env.EXPO_PUBLIC_POPPY_API_KEY;
const POPPY_WEBHOOK_URL = process.env.EXPO_PUBLIC_POPPY_WEBHOOK_URL;
const POPPY_API_URL = process.env.EXPO_PUBLIC_POPPY_API_URL;

import { updatePoppyTokenCredits } from "../firebase";

class PoppyService {
  /**
   * Generate AI caption for post/reel/story
   * @param captionPrompt The user's caption prompt
   * @param isReel Whether this is for a reel (true) or post/story (false)
   * @param token Bearer token for authentication
   * @param boardId The board ID from user's aiAdditions
   * @param chatId The chat node ID from user's aiAdditions
   * @returns Promise<string> The generated caption text
   */
  async generateCaption(
    captionPrompt: string,
    isReel: boolean,
    token: string,
    boardId?: string,
    chatId?: string,
  ): Promise<string> {
    const url = POPPY_WEBHOOK_URL;

    try {
      console.log("🎨 Generating caption...", {
        captionPrompt,
        isReel,
        boardId,
        chatId,
      });

      const payload = {
        isReel,
        captionpromt: captionPrompt,
        boardId,
        chatId,
      };

      console.log("📤 Poppy Payload (Caption):", JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "❌ Caption generation error:",
          response.status,
          errorText,
        );
        throw new Error(`Failed to generate caption: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Caption generated successfully");

      // Extract text from response
      if (data.success && data.data?.content?.[0]?.text) {
        let captionText = data.data.content[0].text;

        // Remove only markdown syntax while preserving content and structure
        captionText = captionText
          .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold but keep text
          .replace(/\*(.+?)\*/g, "$1") // Remove italic but keep text
          .replace(/^#{1,6}\s+/gm, "") // Remove header markers but keep heading text
          .replace(/`([^`]+)`/g, "$1") // Remove inline code markers
          .replace(/```[^```]*```/g, (match: string) =>
            match.replace(/```/g, ""),
          ) // Remove code block markers
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Convert links to text
          .trim();

        return captionText;
      }

      throw new Error("Invalid response format");
    } catch (error) {
      console.error("❌ Caption generation error:", error);
      throw error;
    }
  }

  /**
   * Stream a message to Poppy AI and get real-time response
   * @param conversationId The conversation ID to stream to
   * @param prompt The user's message
   * @param boardId The board ID from user's aiAdditions
   * @param chatId The chat node ID from user's aiAdditions
   * @param userEmail User email to update poppyToken credits
   * @param onChunk Callback function for each text chunk received
   * @returns Promise<string> The complete response text
   */
  async streamMessage(
    conversationId: string,
    prompt: string,
    boardId: string,
    chatId: string,
    userEmail: string,
    onChunk: (delta: string) => void,
  ): Promise<string> {
    const url = `${POPPY_API_URL}/conversation/${conversationId}?board_id=${boardId}&chat_id=${chatId}&api_key=${POPPY_API_KEY}`;

    try {
      console.log("🌊 Starting Poppy XHR request:", url);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/json");

        let fullText = "";
        let processedLength = 0; // Track how much we've already processed
        let creditsUsed = 0; // Track credits from usage event

        // Handle progressive streaming as data arrives
        xhr.onprogress = () => {
          const currentResponse = xhr.responseText;

          // Only process new data that we haven't seen yet
          const newData = currentResponse.substring(processedLength);
          processedLength = currentResponse.length;

          // Split by newlines to get individual data events
          const lines = newData.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && !line.includes("[DONE]")) {
              try {
                const jsonStr = line.substring(6); // Remove 'data: ' prefix
                const eventData = JSON.parse(jsonStr);

                // Process ONLY text-delta events to show clean streaming
                if (eventData.type === "text-delta" && eventData.delta) {
                  fullText += eventData.delta;
                  onChunk(eventData.delta); // Send delta immediately as it arrives
                }

                // Capture credits usage
                if (eventData.type === "usage" && eventData.credits_used) {
                  creditsUsed = eventData.credits_used;
                  console.log(`💳 Poppy credits used: ${creditsUsed}`);
                }
              } catch (parseError) {
                // Skip invalid JSON lines silently
              }
            }
          }
        };

        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            console.log("📝 Poppy API Response Status:", xhr.status);

            if (xhr.status >= 200 && xhr.status < 300) {
              // Process any remaining data
              const currentResponse = xhr.responseText;
              const newData = currentResponse.substring(processedLength);

              if (newData) {
                const lines = newData.split("\n");

                for (const line of lines) {
                  if (line.startsWith("data: ") && !line.includes("[DONE]")) {
                    try {
                      const jsonStr = line.substring(6);
                      const eventData = JSON.parse(jsonStr);

                      if (eventData.type === "text-delta" && eventData.delta) {
                        fullText += eventData.delta;
                        onChunk(eventData.delta);
                      }

                      // Capture credits usage from final response
                      if (
                        eventData.type === "usage" &&
                        eventData.credits_used
                      ) {
                        creditsUsed = eventData.credits_used;
                        console.log(`💳 Poppy credits used: ${creditsUsed}`);
                      }
                    } catch (parseError) {
                      // Skip invalid lines
                    }
                  }
                }
              }

              console.log(
                "✅ Streaming complete. Total text length:",
                fullText.length,
              );

              // Update Firebase with credits used
              if (creditsUsed > 0 && userEmail) {
                updatePoppyTokenCredits(userEmail, creditsUsed).catch(
                  (error) => {
                    console.error(
                      "Failed to update poppyToken credits:",
                      error,
                    );
                  },
                );
              }

              resolve(fullText);
            } else {
              console.error(
                `❌ Poppy API Error: ${xhr.status} ${xhr.responseText}`,
              );
              reject(
                new Error(
                  `Poppy API Error: ${xhr.status} - ${xhr.responseText}`,
                ),
              );
            }
          }
        };

        xhr.onerror = () => {
          console.error("❌ Network request failed");
          reject(new Error("Network request failed"));
        };

        const payload = {
          prompt,
          streaming: true,
          save_history: true,
          include_usage: true, // Exclude usage details to reduce response size
        };

        console.log("📤 Poppy Payload (Stream):", JSON.stringify(payload, null, 2));
        xhr.send(JSON.stringify(payload));
      });
    } catch (error) {
      console.error("❌ Poppy stream error:", error);
      throw error;
    }
  }
}

export default new PoppyService();
