import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const CART_KEY = 'computer_store_cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  // Load from localStorage on init
  function initialize() {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try {
        items.value = JSON.parse(saved)
      } catch {
        items.value = []
      }
    }
  }

  function saveToStorage() {
    localStorage.setItem(CART_KEY, JSON.stringify(items.value))
  }

  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => {
      const price = item.product.sale_price || item.product.price
      return sum + (price * item.quantity)
    }, 0)
  )

  const shippingCost = computed(() => (subtotal.value >= 100 ? 0 : 9.99))

  const total = computed(() => subtotal.value + shippingCost.value)

  function addItem(product, quantity = 1) {
    const existing = items.value.find(i => i.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          sale_price: product.sale_price ? Number(product.sale_price) : null,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
        },
        quantity,
      })
    }
    saveToStorage()
  }

  function removeItem(productId) {
    items.value = items.value.filter(i => i.product.id !== productId)
    saveToStorage()
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
        saveToStorage()
      }
    }
  }

  function clearCart() {
    items.value = []
    saveToStorage()
  }

  function isInCart(productId) {
    return items.value.some(i => i.product.id === productId)
  }

  return {
    items, loading,
    itemCount, subtotal, shippingCost, total,
    initialize, addItem, removeItem, updateQuantity, clearCart, isInCart
  }
})
