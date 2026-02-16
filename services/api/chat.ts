import storageService from '../storage';
import apiClient from './client';

export interface Conversation {
    _name: string;
    _id: string;
    _createTime: string;
    _updateTime: string;
    conversationName: string;
    conversationId: string;
}

export type GetConversationsResponse = Conversation[];

export interface CreateConversationPayload {
    boardId: string;
    chatId: string;
    name: string;
}

export interface CreateConversationResponse {
    success: boolean;
    conversationId?: string;
    message?: string;
}

export interface Message {
    _name: string;
    _id: string;
    _createTime: string;
    _updateTime: string;
    role: 'User' | 'Model';
    dateTime: string;
    content: string;
}

export type GetHistoryResponse = Message[];

export interface ManageHistoryPayload {
    role: 'User' | 'Model';
    content: string;
    user: string;
    conversationId: string;
}

export interface ManageHistoryResponse {
    success?: boolean;
    message?: Message;
}

const chatService = {
    /**
     * Get user conversations
     * @param email User email
     * @returns Promise<GetConversationsResponse>
     */
    getConversations: async (email: string) => {
        try {
            const token = await storageService.getToken();
            const response = await apiClient.post<GetConversationsResponse>(
                '/get-conversations',
                { email },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Get Conversations API Error:", error);
            throw error;
        }
    },

    /**
     * Create a new conversation
     * @param payload CreateConversationPayload
     * @returns Promise<CreateConversationResponse>
     */
    createConversation: async (payload: CreateConversationPayload) => {
        try {
            const token = await storageService.getToken();
            const response = await apiClient.post<CreateConversationResponse>(
                '/create-conversation',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Create Conversation API Error:", error);
            throw error;
        }
    },

    /**
     * Get conversation history
     * @param conversationId Conversation ID
     * @returns Promise<GetHistoryResponse>
     */
    getHistory: async (conversationId: string) => {
        try {
            const token = await storageService.getToken();
            const response = await apiClient.post<GetHistoryResponse>(
                '/getHistory',
                { conversationId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Get History API Error:", error);
            throw error;
        }
    },

    /**
     * Manage conversation history - send and store messages
     * @param conversationId Conversation ID
     * @param content Message content
     * @param userEmail User email
     * @param role Message role (User or Model)
     * @returns Promise<ManageHistoryResponse>
     */
    manageHistory: async (
        conversationId: string,
        content: string,
        userEmail: string,
        role: 'User' | 'Model' = 'User'
    ) => {
        try {
            const token = await storageService.getToken();
            const response = await apiClient.post<ManageHistoryResponse>(
                '/manageHistory',
                {
                    role,
                    content,
                    user: userEmail,
                    conversationId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Manage History API Error:", error);
            throw error;
        }
    },

    /**
     * Delete a conversation
     * @param email User email
     * @param conversationId Conversation ID to delete
     * @returns Promise<any>
     */
    deleteConversation: async (email: string, conversationId: string) => {
        try {
            const token = await storageService.getToken();
            const response = await apiClient.post(
                '/delete-conversation',
                {
                    email,
                    conversationId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Delete Conversation API Error:", error);
            throw error;
        }
    },

    /**
     * Edit conversation name
     * @param conversationId Conversation ID
     * @param name New name for the conversation
     * @returns Promise<any>
     */
    editConversation: async (conversationId: string, name: string) => {
        try {
            const token = await storageService.getToken();
            const response = await apiClient.post(
                '/Edit-conversation',
                {
                    conversationId,
                    name
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error("Edit Conversation API Error:", error);
            throw error;
        }
    },

};

export default chatService;
