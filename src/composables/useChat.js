import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const CHAT_HISTORY_KEY = 'computer_store_chat_history'

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

  // Smart stub responder for MVP
  async function simulateAIResponse(userText) {
    loading.value = true
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let reply = ''
    const text = userText.toLowerCase()

    if (text.includes('budget') || text.includes('under') || text.includes('$') || text.includes('cost') || text.includes('price')) {
      reply = `Based on your budget query, I recommend checking our components listing. We carry parts for various price segments:
- **Budget Builds (~$600):** AMD Ryzen 5 5600, Radeon RX 6600, 16GB DDR4.
- **Mid-Range builds (~$1200):** Intel i5-13400F, GeForce RTX 4060 Ti, 32GB DDR5.
- **High-End builds (~$2000+):** AMD Ryzen 7 7800X3D, GeForce RTX 4070 Ti Super or RTX 4080, 32GB DDR5.

You can filter products by price in our [Products](/products) catalog!`
    } else if (text.includes('gaming') || text.includes('gpu') || text.includes('graphics') || text.includes('fps')) {
      reply = `For gaming performance:
1. **GPU (Graphics Card):** This is the most crucial part. The NVIDIA RTX 4070 Super offers fantastic 1440p performance. For entry level, look at the AMD RX 6600.
2. **CPU:** The AMD Ryzen 7 7800X3D is currently the best gaming CPU on the market.
3. **RAM:** 32GB of DDR5-6000 is the sweet spot for modern games.

Browse all available gaming hardware in our [Graphics Cards](/products?category=gpus) category.`
    } else if (text.includes('compatib') || text.includes('work') || text.includes('fit') || text.includes('socket')) {
      reply = `When checking compatibility, keep these main points in mind:
- **CPU & Motherboard:** Ensure they share the same socket (e.g. Socket AM5 for Ryzen 7000/9000, LGA1700 for Intel 12th-14th Gen).
- **RAM:** DDR4 RAM will not fit in DDR5 motherboard slots, and vice-versa.
- **Case Clearance:** Check the maximum GPU length and CPU cooler height supported by the PC case.
- **Power Supply:** Make sure your PSU wattage exceeds the total TDP of your CPU and GPU combined by at least 100-150W.

We show compatibility details on each product's details page!`
    } else if (text.includes('office') || text.includes('work') || text.includes('study') || text.includes('programming')) {
      reply = `For programming, office work, and daily multitasking, I suggest:
- **CPU:** A balanced 6-core processor like the AMD Ryzen 5 7600 or Intel i5-12400.
- **RAM:** At least 16GB RAM (32GB is great if you run Docker or VMs).
- **Storage:** A fast 1TB NVMe M.2 SSD for snappy boot and load times.
- **Graphics:** Integrated graphics are usually fine, saving you money on a discrete GPU unless you do game development or ML.

Explore options in the [CPUs](/products?category=cpus) and [Storage](/products?category=storage-devices) sections.`
    } else {
      reply = `I can help you build your dream PC! Try asking me:
- *"I need a gaming PC under $1000"*
- *"What parts do I need for programming?"*
- *"Are AMD CPUs compatible with Intel motherboards?"*
- *"Recommend me a high-end graphics card"*
      
Feel free to browse all products in our catalog by visiting the [Products Catalog](/products).`
    }

    messages.value.push({
      id: Math.random().toString(36).substring(7),
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString()
    })
    
    saveChatHistory()
    loading.value = false
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

    await simulateAIResponse(text)
  }

  return {
    messages,
    loading,
    initializeChat,
    sendMessage,
    clearChat
  }
}
