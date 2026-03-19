## 1. Database Schema Update

- [x] 1.1 Add `peerProxyData Json?` field to `NegotiationSession` model in `prisma/schema.prisma`
- [x] 1.2 Run `npx prisma db push` to apply schema changes

## 2. Fix SSE Parsing in Stream Route

- [x] 2.1 Update SSE event parsing in `/api/negotiation/[id]/stream/route.ts` to extract content from `data.choices[0].delta.content`
- [x] 2.2 Test parsing logic handles the correct SecondMe API format

## 3. Persist and Retrieve peerProxyData

- [x] 3.1 Update `POST /api/negotiation/route.ts` to save `peerProxyData` when creating session
- [x] 3.2 Update `/api/negotiation/[id]/stream/route.ts` to load saved `peerProxyData` from session
- [x] 3.3 Use loaded peerProxyData in negotiation prompts instead of hardcoded "未知"
