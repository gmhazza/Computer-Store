<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const isUser = computed(() => props.message.role === 'user')

// Simple markdown formatter to handle links [text](url), bold **text**, and line breaks
const formattedContent = computed(() => {
  let content = props.message.content
  
  // Escape HTML entities to prevent XSS
  content = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // Render **bold**
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Render [text](url) -> Vue router Links if internal, or standard links
  // But standard links with styling are easier. Since we convert in-place,
  // we can use standard <a> tags with styling.
  content = content.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="chat-link">$1</a>')
  
  // Render bullets
  content = content.replace(/^- (.*?)$/gm, '<li class="chat-bullet">$1</li>')
  
  // Wrap list items in <ul>
  if (content.includes('<li class="chat-bullet">')) {
    // A simple regex approach to wrap lists:
    // Split by newlines, wrap runs of <li> in <ul>
    const lines = content.split('\n')
    let inList = false
    const parsedLines = lines.map(line => {
      if (line.trim().startsWith('<li')) {
        if (!inList) {
          inList = true
          return '<ul class="chat-list">' + line
        }
        return line
      } else {
        if (inList) {
          inList = false
          return '</ul>' + line
        }
        return line
      }
    })
    if (inList) parsedLines.push('</ul>')
    content = parsedLines.join('\n')
  }

  // Render line breaks
  content = content.replace(/\n/g, '<br />')

  return content
})

const formattedTime = computed(() => {
  if (!props.message.timestamp) return ''
  const date = new Date(props.message.timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div class="message-row" :class="{ 'user-row': isUser }">
    <!-- Assistant Avatar -->
    <div v-if="!isUser" class="avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    </div>

    <!-- Bubble -->
    <div class="bubble-wrapper">
      <div class="bubble" :class="isUser ? 'bubble-user' : 'bubble-assistant'">
        <div class="content" v-html="formattedContent"></div>
      </div>
      <span class="timestamp">{{ formattedTime }}</span>
    </div>
  </div>
</template>

<style scoped>
.message-row {
  display: flex;
  gap: 10px;
  max-width: 85%;
  align-items: flex-start;
  margin-bottom: 4px;
}

.user-row {
  margin-left: auto;
  flex-direction: row-reverse;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-accent);
  flex-shrink: 0;
}

.bubble-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-row .bubble-wrapper {
  align-items: flex-end;
}

.bubble {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  line-height: 1.5;
}

.bubble-user {
  background: linear-gradient(135deg, var(--color-secondary), #6d28d9);
  color: var(--color-text-primary);
  border-top-right-radius: 2px;
}

.bubble-assistant {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  border-top-left-radius: 2px;
}

.content :deep(.chat-link) {
  color: var(--color-accent);
  text-decoration: underline;
  font-weight: 600;
}

.content :deep(.chat-list) {
  margin: 8px 0;
  padding-left: 18px;
}

.content :deep(.chat-bullet) {
  margin-bottom: 4px;
}

.timestamp {
  font-size: 10px;
  color: var(--color-text-muted);
}
</style>
