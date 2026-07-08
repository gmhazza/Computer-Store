<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  subtext: {
    type: String,
    default: ''
  },
  trend: {
    type: String,
    default: ''
  },
  trendType: {
    type: String,
    default: 'up' // up | down | neutral
  }
})
</script>

<template>
  <div class="stats-card glass">
    <div class="card-inner">
      <div class="stats-content">
        <span class="card-title">{{ title }}</span>
        <h3 class="card-value">{{ value }}</h3>
        
        <div v-if="subtext || trend" class="card-footer">
          <span
            v-if="trend"
            :class="['trend-tag', `trend-${trendType}`]"
          >
            {{ trendType === 'up' ? '▲' : trendType === 'down' ? '▼' : '•' }} {{ trend }}
          </span>
          <span class="subtext">{{ subtext }}</span>
        </div>
      </div>

      <div class="stats-icon-box" v-if="icon" v-html="icon"></div>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  padding: 24px;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.card-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.card-value {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.trend-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.trend-up {
  background: rgba(52, 211, 153, 0.12);
  color: #34d399;
}
.trend-down {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
}
.trend-neutral {
  background: var(--color-bg-tertiary);
  color: var(--color-text-muted);
}

.subtext {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stats-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stats-icon-box :deep(svg) {
  width: 22px;
  height: 22px;
}
</style>
