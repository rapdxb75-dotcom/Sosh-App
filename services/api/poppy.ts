
const POPPY_API_KEY = 'zKNHI3ZmmGQTWTRnlllJM6ozIEpuTCNgATdGo8o2ic';
const BOARD_ID = 'crimson-volcano-YMlZP';
const CHAT_NODE_ID = 'chatNode-small-field-XgvXp-copied';
const MODEL = 'claude-4-sonnet-20250514';

class PoppyService {
    /** 
     * Stream a message to Poppy AI and get real-time response
     * @param conversationId The conversation ID to stream to
     * @param prompt The user's message
     * @param onChunk Callback function for each text chunk received
     * @returns Promise<string> The complete response text
     */
    async streamMessage(
        conversationId: string,
        prompt: string,
        onChunk: (text: string) => void
    ): Promise<string> {
        const url = `https://api.getpoppy.ai/api/conversation/${conversationId}?board_id=${BOARD_ID}&chat_id=${CHAT_NODE_ID}&api_key=${POPPY_API_KEY}`;

        try {
            console.log('🌊 Starting Poppy XHR request:', url);

            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.setRequestHeader('Content-Type', 'application/json');
                // Removed Accept stream header as we expect JSON now

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        console.log('📝 Poppy API Response Status:', xhr.status);
                        console.log('📝 Poppy API Raw Response:', xhr.responseText);

                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                // Try to parse as JSON first
                                const response = JSON.parse(xhr.responseText);
                                console.log('✅ Parsed JSON:', response);

                                // Check if text is directly in text property or in message property
                                const text = response.text || response.message || (typeof response === 'string' ? response : JSON.stringify(response));

                                onChunk(text);
                                resolve(text);
                            } catch (e) {
                                console.warn('⚠️ Failed to parse JSON, treating as raw string:', e);
                                // Fallback: return raw text
                                onChunk(xhr.responseText);
                                resolve(xhr.responseText);
                            }
                        } else {
                            console.error(`❌ Poppy API Error: ${xhr.status} ${xhr.responseText}`);
                            reject(new Error(`Poppy API Error: ${xhr.status} - ${xhr.responseText}`));
                        }
                    }
                };

                xhr.onerror = () => {
                    console.error('❌ Network request failed');
                    reject(new Error('Network request failed'));
                };

                xhr.send(JSON.stringify({
                    prompt,
                    model: MODEL,
                    save_history: true
                }));
            });

        } catch (error) {
            console.error('❌ Poppy stream error:', error);
            throw error;
        }
    }
}


export default new PoppyService();
