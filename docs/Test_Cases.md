# Test Cases

## Functional Tests

| ID | Test | Expected Result | Status |
|---|---|---|---|
| FT-01 | Public enquiry form submits successfully | Lead created with `new` status | Pending manual |
| FT-02 | Counsellor login works with correct credentials | JWT token stored, dashboard opens | Pending manual |
| FT-03 | Login fails with wrong password | Error toast shown | Pending manual |
| FT-04 | JWT token expires | User redirects to login | Pending manual |
| FT-05 | Create new lead | Lead appears in list | Pending manual |
| FT-06 | Update lead status | Follow-up history entry created | Pending manual |
| FT-07 | Log follow-up | Timeline updates on detail page | Pending manual |
| FT-08 | Book tour | Slot booked count increases | Pending manual |
| FT-09 | Analytics summary loads | Correct cards and charts shown | Pending manual |
| FT-10 | Call script generates | Script panel displays text | Pending manual |
| FT-11 | Notifications appear | Bell shows unread count | Pending manual |
| FT-12 | Admin assigns counsellor | Lead owner changes | Pending manual |
| FT-13 | Overdue leads highlighted | Red alert panel shows overdue leads | Pending manual |

## Edge Case Tests

| ID | Test | Expected Result | Status |
|---|---|---|---|
| ET-01 | Submit enquiry with empty required fields | Validation errors shown | Pending manual |
| ET-02 | Duplicate phone enquiry | Duplicate error shown | Pending manual |
| ET-03 | Book tour on full slot | Error shown, no booking created | Pending manual |
| ET-04 | Delete lead with history | Not implemented in current scope | N/A |
| ET-05 | Empty dashboard state | Empty message appears without crash | Pending manual |
| ET-06 | Mobile responsive layout | Sidebar collapses to hamburger | Pending manual |
