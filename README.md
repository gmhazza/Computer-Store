# Computer Store PRD

---

## 1. Product Overview

Computer Store is an ecommerce website for selling computer components, full PC builds, and accessories. The platform will help customers browse products such as CPUs, RAM, GPUs, storage devices, cases, power supplies, cooling, mice, keyboards, and monitors. It will also include an integrated AI assistant that guides customers toward compatible parts based on their budget, use case, and preferences.

The frontend will be built with Vue and Tailwind CSS. Supabase will be used as the backend platform for database, authentication, storage, and server-side functions.

## 2. Goals

- Allow customers to browse and purchase computer parts and accessories.
- Help users choose compatible parts for gaming, office, editing, streaming, programming, and general use.
- Provide an AI assistant that recommends products from the store catalog.
- Give admins a simple way to manage products, stock, prices, categories, and orders.
- Build a scalable foundation that can later support payments, reviews, discounts, and advanced PC build compatibility checks.

## 3. Target Users

- Customers who want to buy individual PC components.
- Customers who want a full computer build but do not know which parts to choose.
- Gamers looking for performance-based builds.
- Office, student, and professional users looking for budget-friendly computers.
- Store admins who manage inventory, orders, and product listings.

## 4. Tech Stack

### Frontend

- Vue 3
- Vite
- Tailwind CSS
- Vue Router
- Pinia for state management

### Backend

- Supabase Database for products, users, orders, carts, and AI recommendation history.
- Supabase Auth for customer and admin login.
- Supabase Storage for product images.
- Supabase Edge Functions for secure backend logic.
- AI API integration through Supabase Edge Functions, not directly from the browser.

## 5. Core Features

### 5.1 Customer Storefront

- Home page with featured products, categories, deals, and recommended builds.
- Product listing pages by category.
- Product detail page with images, specifications, price, stock, and compatibility notes.
- Search and filters by category, brand, price, performance tier, socket, RAM type, storage type, and availability.
- Cart page with quantity controls and price summary.
- Checkout flow for customer details, shipping information, and payment status.
- Guest checkout — purchase without creating an account. 
- Order confirmation page.
- Recently viewed products, shown on home page or as a sidebar module. 
- Related / "frequently bought together" products on the product detail page (e.g. compatible RAM shown on a motherboard page). 
- Stock status badges on listings and product pages (In Stock / Low Stock / Out of Stock / Back-ordered), using the existing `stock_quantity` field. 
- Price-drop and back-in-stock notifications (email opt-in per product). 

### 5.2 Product Categories

Initial categories should include:

- CPUs
- GPUs
- RAM
- Motherboards
- Storage devices
- Power supplies
- PC cases
- Cooling
- Monitors
- Keyboards
- Mice
- Headsets

### 5.3 AI Buying Assistant

The AI assistant should help customers choose parts based on natural language requirements.

Example user requests:

- "I need a gaming PC under $1000."
- "Suggest parts for video editing."
- "I want a PC for programming and office work."
- "Which GPU should I buy for 1440p gaming?"
- "Build me a full setup with monitor, keyboard, and mouse."

AI assistant requirements:

- Ask follow-up questions when requirements are unclear.
- Recommend only products available in the store catalog.
- Consider budget, use case, performance needs, and stock availability.
- Explain why each part was selected.
- Warn users about possible compatibility issues.
- Provide an estimated total price.
- Provide a per-component budget breakdown alongside the total (e.g. GPU $400 / CPU $200 / RAM $80...), so users understand where their money is going. 
- Briefly explain why a part was NOT chosen when it's a close call (e.g. "skipped the RTX xx70 — over budget by $60").
- Allow users to add recommended products to cart.
- Allow users to save or share a generated build (a shareable link or saved entry tied to `ai_recommendations`). 

The AI API key must stay on the backend. The Vue frontend should call a Supabase Edge Function, and the Edge Function should call the AI provider securely.

### 5.4 Chatbot Experience and Persistence

The website should include a chatbot interface that helps users while they shop. The chatbot should be available from the storefront and should preserve the conversation after a page refresh.

Chatbot requirements:

- Display a floating chat button or visible assistant panel.
- Let users ask questions about products, compatibility, budget, and recommended builds.
- Show messages in a conversational layout with user and assistant bubbles.
- Save chat messages in browser localStorage so the conversation does not disappear after refreshing the page.
- Restore saved chat history automatically when the user returns to the page.
- Include a clear chat/reset option so users can start a new conversation.
- Keep localStorage chat data on the device only and avoid storing sensitive personal or payment information there.
- For logged-in users, future versions may also sync important AI recommendations to Supabase. 

Suggested localStorage key:

- `computer_store_chat_history`

The first version can use frontend localStorage for persistence. Later versions can save selected AI recommendations to the `ai_recommendations` table for logged-in users.

### 5.5 Compatibility Guidance

The system should check or guide for:

- CPU and motherboard socket compatibility.
- RAM type compatibility, such as DDR4 or DDR5.
- Motherboard form factor and case support.
- GPU length and case clearance.
- Power supply wattage requirements.
- Storage interface support, such as SATA or NVMe.
- Monitor resolution and GPU performance fit.

The first version can use simple rule-based checks stored in the database. 

Later versions can add more advanced compatibility logic.

### 5.6 User Accounts

Customers should be able to:

- Create an account.
- Log in and log out.
- View order history.
- Save cart items.
- Save AI-recommended builds.
- Manage profile and shipping details.
- Maintain a wishlist / saved items list (separate from cart) — schema stub added now, UI can ship later. 

### 5.7 Admin Panel

Admins should be able to:

- Add, edit, and delete products.
- Upload product images.
- Manage categories and brands.
- Update stock and prices.
- View customer orders.
- Update order status.
- Mark products as featured or discounted.
- Bulk CSV import for products — component catalogs are large (dozens of CPUs/GPUs/RAM kits per brand); manual one-by-one entry is painful even during MVP testing. **[NEW]**
- Low-stock alerts (dashboard flag or email), using existing `stock_quantity` — cheap against the current schema and useful from day one. 
- Basic sales/orders dashboard: orders today, revenue, top products. Admins typically want this immediately rather than after payments ship. 

Admin routes must be protected using Supabase Auth and role-based access control. 

## 6. Suggested Database Tables

### products

- id, name, slug, description, category_id, brand_id
- price, sale_price, stock_quantity
- image_url, specifications, compatibility_data
- is_featured, is_active, created_at

### categories

- id, name, slug, description

### brands

- id, name, slug

### carts

- id, user_id, created_at, updated_at

### cart_items

- id, cart_id, product_id, quantity

### orders

- id, user_id, status, subtotal, shipping_cost, total, shipping_details, created_at

### order_items

- id, order_id, product_id, product_name, unit_price, quantity

### ai_recommendations

- id, user_id, user_prompt, recommendation, recommended_product_ids, total_price, created_at

### profiles

- id, user_id, full_name, phone, role, shipping_address

*Recommendation: replace the free-text `role` field with a simple `is_admin` boolean for MVP (see 5.7).*

### wishlist_items **[NEW]**

- id, user_id, product_id, created_at
- Added now so wishlist doesn't require a schema migration touching auth + product relations later.

### reviews **[NEW]**

- id, product_id, user_id, rating, comment, is_verified_purchase, created_at
- Table stub only — no UI required for MVP. Having it now avoids a migration headache when reviews (already listed in Future Enhancements) ship.

## 7. Main User Flows

### Browse and Buy Product

1. User opens the website.
2. User browses categories or searches for a product.
3. User opens a product detail page.
4. User adds product to cart.
5. User checks out (as guest or logged in).
6. User receives order confirmation.

### AI Recommended Build

1. User opens the AI assistant.
2. User describes budget and purpose.
3. AI asks follow-up questions if needed.
4. AI recommends compatible parts from available products, with a per-component price breakdown.
5. User reviews explanation and total price.
6. User adds selected parts to cart, or saves/shares the build.

### Persistent Chatbot Conversation

1. User opens the chatbot from the storefront.
2. User asks for help choosing parts or understanding compatibility.
3. Chatbot responds with guidance and product suggestions.
4. Chat messages are saved to localStorage after each message.
5. User refreshes or revisits the page.
6. Previous chat messages are restored from localStorage.
7. User can clear the conversation when they want to start over.

### Admin Product Management

1. Admin logs in.
2. Admin opens dashboard (sees orders-today / revenue / low-stock summary).
3. Admin creates or edits product details, individually or via CSV import.
4. Admin uploads product image.
5. Product becomes visible on storefront.

## 8. Non-Functional Requirements

- Website must be responsive on mobile, tablet, and desktop.
- Product pages should load quickly.
- Product filters should feel fast and easy to use.
- Supabase Row Level Security should protect user and admin data.
- AI responses should be clear, helpful, and limited to available products.
- Chatbot history should persist across page refreshes using localStorage.
- API keys and payment secrets must never be exposed in frontend code.
- Admin-only actions must be protected on both frontend and backend.

## 9. MVP Scope

The first version should include:

- Vue and Tailwind storefront.
- Product catalog (components only — no prebuilts).
- Product detail pages, including stock status badges and related products.
- Search and category filters.
- Cart and guest checkout.
- Supabase database integration.
- Supabase Auth.
- Admin product management, including bulk CSV import and a basic orders/low-stock dashboard.
- Basic AI assistant using Supabase Edge Function, with per-component budget breakdown.
- Chatbot UI with localStorage chat history.
- Basic compatibility guidance as advisory text (not a blocking validation engine).

Payment integration can be added after the core shopping and recommendation flow is working.

## 10. Future Enhancements

- Online payments.
- Product reviews and ratings (schema already stubbed — see Section 6).
- Wishlist UI (schema already stubbed — see Section 6).
- Discount coupons.
- Email order notifications.
- Price-drop / back-in-stock notification delivery (email sending) — table/opt-in ships in MVP, the delivery pipeline comes later. 
- Advanced PC builder tool.
- Saved builds.
- Compare products.
- Live chat support (human agent handoff).
- Inventory alerts beyond low-stock (e.g. demand forecasting).
- Delivery tracking.
- Analytics dashboard for admins (deeper than the MVP orders/revenue summary).
- Prebuilt computers as a catalog category, once compatibility groundwork (5.5) is stable. 
- Structured, blocking compatibility validation engine (real socket/wattage/clearance checks). 
- Syncing chat history / AI recommendations to Supabase for logged-in users across devices.
- Multi-role RBAC (support staff, inventory manager, etc.) if the team grows beyond admin/customer. 

## 11. Success Metrics

- Users can find products quickly.
- Users can complete a purchase flow without confusion.
- AI recommendations produce useful and compatible builds.
- Admins can manage products without editing code.
- Store catalog and stock data remain accurate.
- Guest checkout completion rate is comparable to logged-in checkout (validates that account creation isn't a purchase blocker). 

## 12. Development Notes

Use Supabase Edge Functions for actions that require security, including:

- AI API calls.
- Payment creation.
- Admin-only product updates if extra validation is needed.
- Order creation and stock validation.
- Bulk CSV product import validation.

The frontend can read public product data directly from Supabase when Row Level Security policies allow it. Sensitive operations should always go through protected server-side logic.

Chatbot messages can be stored in localStorage for the MVP to preserve the conversation after refresh. Do not store passwords, payment data, private addresses, or sensitive customer details in localStorage. Use Supabase only when chat history or saved recommendations need to be synced across devices for authenticated users.
