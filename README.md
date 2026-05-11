<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/52bf4f18-f7a1-49ac-bb56-040e38028b70

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Configure Supabase in `.env.local` (uses your existing config):
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (recommended for Vite), OR
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` (also supported)
4. Apply Supabase SQL (in order): [`supabase/rooms.sql`](supabase/rooms.sql) then [`supabase/schema.sql`](supabase/schema.sql) for `equipment`, `room_sections`, `section_checklist_items`, and `equipment_requests`. The schema file adds tables to the `supabase_realtime` publication when possible; confirm Realtime is enabled for all of these tables in the Supabase dashboard.
5. Run the app:
   `npm run dev`
