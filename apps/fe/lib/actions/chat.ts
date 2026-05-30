"use server"

import type {
  ApiResponse,
  ConversationResponse,
  ConversationShareResponse,
  ConversationsResponse,
} from "@workspace/types"
import type { ConversationRow } from "@workspace/types/db"
import { apiServer } from "../api"

export async function getConversations() {
  try {
    return await apiServer.get<ConversationsResponse>("/conversations", {})
  } catch (error) {
    console.error("Error fetching conversations:", error)
    throw error
  }
}

export async function getConversation(id: string) {
  try {
    return await apiServer.get<ConversationResponse>(`/conversations/${id}`)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    throw error
  }
}

export async function getSharedConversation(id: string) {
  try {
    return await apiServer.get<ConversationResponse>(
      `/shared/conversations/${id}`
    )
  } catch (error) {
    console.error("Error fetching shared conversation:", error)
    throw error
  }
}

export async function createConversation(title?: string) {
  try {
    return await apiServer.post("/conversations", {
      body: JSON.stringify(title ? { title } : {}),
    })
  } catch (error) {
    console.error("Error creating conversation:", error)
    throw error
  }
}

export async function updateConversation(id: string, data: any) {
  try {
    return await apiServer.patch(`/conversations/${id}`, {
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error("Error updating conversation:", error)
    throw error
  }
}

export async function deleteConversation(id: string) {
  try {
    return await apiServer.delete<ApiResponse<ConversationRow>>(
      `/conversations/${id}`
    )
  } catch (error) {
    console.error("Error deleting conversation:", error)
    throw error
  }
}

export async function shareConversation(id: string) {
  try {
    return await apiServer.patch<ConversationShareResponse>(
      `/conversations/${id}/public`,
      {
        body: JSON.stringify({ isPublic: true }),
      }
    )
  } catch (error) {
    console.error("Error sharing conversation:", error)
    throw error
  }
}

export async function searchConversations(query: string) {
  try {
    return await apiServer.get<ConversationsResponse>(
      `/conversations/search?q=${query}`
    )
  } catch (error) {
    console.error("Error searching conversations:", error)
    throw error
  }
}
