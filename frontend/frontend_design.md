# FinTrack: Frontend UI/UX Design Specification (`frontend_design.md`)

## 1. Core Philosophy
The FinTrack frontend must deliver a professional, modern, and high-trust user experience characteristic of enterprise fintech applications. The design must prioritize data legibility and user workflow over decorative elements. The aesthetic should be clean, minimalist, and highly responsive across all device sizes.

## 2. Color Palette & Theming (Light and Dark Mode)
The application must natively support both Light and Dark modes. Rely on a monochromatic base with a single primary brand color to maintain a professional look. Do not use a wide spectrum of colors.

*   **Primary Brand Color:** Indigo or Royal Blue (e.g., Tailwind `blue-600` for light, `blue-500` for dark). Use sparingly for primary actions (buttons, active states, key links).
*   **Semantic Colors (Strict Usage):**
    *   **Success/Income:** Emerald Green (for positive cashflow, success toasts).
    *   **Danger/Expense:** Rose or Red (for negative cashflow, destructive actions).
    *   **Warning:** Amber (for impending subscriptions or low balances).
*   **Light Mode Backgrounds:** Pure white (`#FFFFFF`) for cards/components, and a very light gray (`#F9FAFB`) for the main app background to create subtle depth.
*   **Dark Mode Backgrounds:** Deep slate or gray-900 (`#111827`) for the main background, and slightly lighter gray-800 (`#1F2937`) for elevated cards. **Never use pure black (`#000000`).**
*   **Text Colors:** High contrast for primary text (gray-900 in light, gray-50 in dark). Subdued gray for secondary labels and table headers.

## 3. Typography
Use a clean, modern sans-serif typeface (e.g., `Inter`, `Roboto`, or system-ui).
*   **Data Legibility:** Financial figures (numbers, currency symbols) must use tabular lining (monospaced numbers) to ensure decimal points align perfectly in columns.
*   **Hierarchy:** Use distinct font weights (SemiBold for headers, Regular for body, Medium for buttons) rather than relying on different colors to establish hierarchy.

## 4. Animation & Motion Guidelines
Animations must feel snappy, intentional, and visually appealing, but strictly limited to enhancing feedback and state changes.
*   **Page Transitions:** Use a subtle, rapid fade-in (e.g., 150ms-200ms opacity transition) when navigating between the Dashboard, Transactions, and Group Ledgers.
*   **Micro-interactions:** Buttons and interactive cards should have a slight scale effect (`scale-95` to `scale-100`) or color shift on hover/tap.
*   **Component Loading:** Use clean skeleton loaders for data fetching. Avoid spinning wheels for full-page loads.
*   **Charts & Visuals:** Donut charts and graphs should animate in smoothly on the first load (e.g., a single 500ms ease-out draw animation).

## 5. Component Architecture
*   **Cards:** Wrap core data modules (Total Balance, Recent Transactions, Upcoming Subscriptions) in rounded cards (e.g., `rounded-xl`) with a very subtle drop shadow in light mode, and a 1px subtle border in dark mode.
*   **Forms & Inputs:** Inputs should have clear borders that highlight with the primary brand color on focus. Use inline validation (red borders/text for errors).
*   **Tables:** Transaction ledgers must have clear row separation (subtle bottom borders or alternating row colors). Keep padding generous to avoid a cramped, Excel-like appearance.

---

## 6. Strict Developer Rules: The Do's and Don'ts

### DO:
*   **DO** use Tailwind CSS (or similar utility-first framework) to strictly enforce the design system and easily manage the `dark:` variant classes.
*   **DO** implement a global theme toggle (Sun/Moon icon in the header) that saves the user's preference to `localStorage`.
*   **DO** ensure sufficient whitespace (padding and margins) between dashboard widgets to prevent cognitive overload.
*   **DO** format all currency strings uniformly (e.g., `₹ 1,500.00` or `$ 1,500.00`) with consistent decimal places.
*   **DO** use recognizable, minimal icons (e.g., Lucide or Heroicons) for categories, sidebar navigation, and action buttons.

### DON'T:
*   **DON'T** use highly saturated or neon colors for backgrounds or large areas.
*   **DON'T** apply bouncy, springy, or long-duration animations (>300ms). UI elements should never distract the user from their financial data.
*   **DON'T** use gradients heavily. If used, restrict them to small, specific elements like a premium feature badge or the "Net Balance" hero card.
*   **DON'T** clutter the UI with permanent helper text. Use tooltips on hover for secondary explanations.
*   **DON'T** make the user interface look like a toy or a social media feed. Maintain a clinical, highly professional layout.