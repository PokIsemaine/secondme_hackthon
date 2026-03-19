## 1. Add selectedMatch state

- [x] 1.1 Add `selectedMatchIndex` state to track user's selection
- [x] 1.2 Initialize with 0 (first match selected by default)

## 2. Update match result cards UI

- [x] 2.1 Add click handler to each match card to set selectedMatchIndex
- [x] 2.2 Add visual selected state (border, checkmark) when card is selected
- [x] 2.3 Deselect previous card when new card is clicked

## 3. Update negotiation to use selected match

- [x] 3.1 Modify runNegotiation to use `matches[selectedMatchIndex]` instead of `matches[0]`
- [x] 3.2 Verify selected match's post is passed correctly to negotiation API
