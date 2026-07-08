<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatMessage from './ChatMessage.vue'

const { messages, loading, initializeChat, sendMessage, clearChat } = useChat()

const isOpen = ref(false)
const inputMessage = ref('')
const messageContainer = ref(null)

onMounted(() => {
  initializeChat()
})

// Scroll to bottom helper
function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

// Watch messages or loading to trigger scroll
watch(
  [messages, loading],
  () => {
    scrollToBottom()
  },
  { deep: true }
)

function toggleChat() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    scrollToBottom()
  }
}

async function handleSend() {
  if (!inputMessage.value.trim() || loading.value) return
  const text = inputMessage.value
  inputMessage.value = ''
  await sendMessage(text)
}

function handleClear() {
  if (confirm('Clear entire chat conversation history?')) {
    clearChat()
  }
}
</script>

<template>
  <div class="chat-widget-wrapper">
    <!-- Floating toggle button -->
    <button
      class="chat-toggle-btn"
      :class="{ 'chat-active': isOpen }"
      @click="toggleChat"
      aria-label="Toggle AI Assistant"
    >
      <transition name="fade" mode="out-in">
        <svg v-if="!isOpen" key="closed" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <svg v-else key="open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </transition>
      <span v-if="!isOpen" class="badge-pulse"></span>
    </button>

    <!-- Chat Dialog Panel -->
    <transition name="chat-panel">
      <div v-if="isOpen" class="chat-panel glass">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-title-group">
            <div class="chat-avatar-status">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
              <span class="status-dot"></span>
            </div>
            <div>
              <h4 class="chat-title">AI Assistant</h4>
              <p class="chat-status">{{ loading ? 'Typing...' : 'Online' }}</p>
            </div>
          </div>
          <button class="chat-clear-btn" @click="handleClear" title="Clear chat history">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
        </div>

        <!-- Thread -->
        <div ref="messageContainer" class="chat-thread">
          <ChatMessage
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
          />
          <!-- Typing Indicator -->
          <div v-if="loading" class="typing-indicator-row">
            <div class="bot-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            </div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- Input Footer -->
        <form class="chat-input-footer" @submit.prevent="handleSend">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Ask AI Assistant..."
            :disabled="loading"
            class="chat-input"
          />
          <button type="submit" class="chat-send-btn" :disabled="!inputMessage.trim() || loading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.chat-widget-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.chat-toggle-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--color-accent), var(--color-secondary));
  color: #09090b;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(34, 211, 238, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all var(--transition-base);
}
.chat-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 24px rgba(34, 211, 238, 0.45);
}
.chat-active {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.badge-pulse {
  position: absolute;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #34d399;
  border: 2px solid var(--color-bg-primary);
  border-radius: 50%;
  animation: pulse-glow 2s infinite;
}

/* Chat Dialog Panel */
.chat-panel {
  width: 380px;
  height: 500px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(24, 24, 27, 0.4);
}

.chat-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-avatar-status {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  position: relative;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  border: 1.5px solid var(--color-bg-secondary);
}

.chat-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chat-status {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
}

.chat-clear-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  display: flex;
}
.chat-clear-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}

/* Thread */
.chat-thread {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Typing Indicator */
.typing-indicator-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 4px;
}
.bot-avatar {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
}
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-top-left-radius: 2px;
}
.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--color-text-muted);
  border-radius: 50%;
  animation: typing-dot 1.4s infinite ease-in-out both;
}
.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

/* Footer */
.chat-input-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
  background: rgba(24, 24, 27, 0.4);
}

.chat-input {
  flex: 1;
  padding: 8px 14px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-fast);
}
.chat-input:focus {
  border-color: var(--color-accent);
}
.chat-input:disabled {
  opacity: 0.6;
}

.chat-send-btn {
  background: var(--color-accent);
  color: #09090b;
  border: none;
  border-radius: var(--radius-md);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.chat-send-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}
.chat-send-btn:disabled {
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

/* Animations */
@keyframes typing-dot {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Transitions */
.chat-panel-enter-active,
.chat-panel-leave-active {
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-panel-enter-from,
.chat-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

@media (max-width: 480px) {
  .chat-panel {
    width: calc(100vw - 48px);
    right: 24px;
    height: 450px;
  }
}
</style>
