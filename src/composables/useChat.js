import { ref } from 'vue'
 
const CHAT_HISTORY_KEY = 'computer_store_chat_history'
const API_URL = 'https://computer-store-backend.vercel.app/gemini'
 
export function useChat() {
  const messages = ref([])
  const loading = ref(false)
 
  // Initialize and load chat history from localStorage
  function initializeChat() {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY)
    if (saved) {
      try {
        messages.value = JSON.parse(saved)
      } catch {
        messages.value = []
      }
    }
 
    // Add default greeting if empty
    if (messages.value.length === 0) {
      messages.value.push({
        id: 'greet',
        role: 'assistant',
        content: 'Hello! I am your AI Computer Store Assistant. I can help you choose compatible PC parts, suggest builds based on your budget, or answer general shopping questions. What are you looking to build or buy today?',
        timestamp: new Date().toISOString()
      })
      saveChatHistory()
    }
  }
 
  function saveChatHistory() {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages.value))
  }
 
  function clearChat() {
    messages.value = []
    initializeChat()
  }
 
  // Real AI call to the deployed Gemini backend
  async function fetchAIResponse(userText) {
    loading.value = true
 
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText })
      })
 
      const json = await res.json()
 
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to get a response')
      }
 
      messages.value.push({
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: json.data,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('AI chat error:', err)
      messages.value.push({
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date().toISOString()
      })
    } finally {
      saveChatHistory()
      loading.value = false
    }
  }
 
  async function sendMessage(text) {
    if (!text.trim()) return
 
    const userMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }
 
    messages.value.push(userMessage)
    saveChatHistory()
 
    await fetchAIResponse(text)
  }
 
  return {
    messages,
    loading,
    initializeChat,
    sendMessage,
    clearChat
  }
}