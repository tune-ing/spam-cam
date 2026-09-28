# Visit the site here: 
https://spam-cam.lovable.app/

# Scan & Calendar
Generated prompt with the assistance of Google's Gemini. 
Create a clean, modern, mobile-first single-page application using React, Tailwind CSS, Lucide icons, and Shadcn UI that scans paper flyers using multimodal AI vision, displays the events on an interactive in-app calendar, and syncs them directly to Google Calendar.

1. Viewport & Mobile-First Layout

Design a single-column layout constrained to 100dvh (dynamic viewport height) optimized for mobile thumb interaction.

Provide a persistent sticky bottom action bar (bottom-0 z-50) with minimum 48x48px touch targets for primary actions.

Layout splits into two view tabs/sections: "Scan Flyer" and "My Calendar".

2. Camera Capture & Upload Interface

Primary Input: "Scan Flyer with Camera" button leveraging direct mobile camera input (<input type="file" capture="environment" accept="image/*">).

Secondary Input: "Choose from Photo Library" drag-and-drop/file selector button.

Instant photo preview thumbnail with a clear/remove button.

3. Immediate Text Extraction & AI Parsing (No Delays)

Action button "Extract Event Details" triggers immediate front-end loading states without mock timers or artificial delays.

Implement a backend API route handler (/api/parse-flyer) sending base64 images to a vision model (e.g., gpt-4o-mini).

Request structured JSON matching this schema:

title: string

startDate: ISO 8601 string (YYYY-MM-DDTHH:mm:ss)

endDate: ISO 8601 string (YYYY-MM-DDTHH:mm:ss)

location: string

description: string

4. Interactive Review Form & Low-Confidence Highlighting

Pre-populate an editable form card as soon as the API response arrives:

Event Name (text input, minimum 16px font size to prevent iOS auto-zoom)

Start Date & Time (datetime-local input)

End Date & Time (datetime-local input)

Location / Venue (text input with map pin icon)

Description / Extra Notes (expandable textarea)

Apply a subtle warning highlight/badge next to any field where extraction data was missing or uncertain.

5. In-App Interactive Calendar Component

Embedded monthly/weekly calendar view (using FullCalendar, react-big-calendar, or a custom grid) to visualize saved events right inside the app.

Save confirmed events to local state / localStorage so data persists across refreshes.

Pre-populate with 2–3 sample mock events on initial load.

Clicking any event block opens a modal with details and an "Export to Google Calendar" button.

6. Dynamic Sync & Export Actions

"Add to Google Calendar" Primary Action: Dynamically generate and open the official web creation URL using encoded parameters: https://calendar.google.com/calendar/render?action=TEMPLATE&text={TITLE}&dates={START_DATETIME}/{END_DATETIME}&location={LOCATION}&details={DESCRIPTION}

Convert timestamps to compact UTC strings (YYYYMMDDTHHMMSSZ) and sanitize inputs with encodeURIComponent().

"Save to In-App Calendar" Action: Adds the reviewed event straight to the embedded calendar view.

"Download .ics" Action: Generates a universal .ics file for native device calendars (Apple Calendar/Outlook).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://snap-and-save-events.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3e130cb4-a604-4259-8dcf-271dd4eb84a7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
