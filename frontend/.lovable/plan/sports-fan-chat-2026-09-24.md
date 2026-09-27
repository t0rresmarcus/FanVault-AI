# Sports fan chat

## Build
- Create a crisp white-and-purple chat workspace inspired by the supplied references, with a compact match-day identity and responsive mobile layout.
- Add separate conversation threads for teams and topics, each with its own dedicated `/chat/:threadId` page.
- Save threads and messages in browser storage, including creating, switching, renaming from the first message, and deleting chats.
- Build the transcript and composer with the official AI chat components, including quick sports prompts, loading feedback, and accessible controls.
- Add a streamed sports-assistant response endpoint and clear error states.

## Technical details
- Use TanStack file routes for the home redirect and thread pages.
- Keep all AI credentials server-side and use `openai/gpt-6-astra` with streamed reasoning.
- Use semantic design tokens for the purple, green, surface, and message colors.
- Verify navigation, sending, persistence after reload, responsive layout, metadata, and build checks.
