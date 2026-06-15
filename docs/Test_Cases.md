# Test Cases

## Functional Tests

| ID | Test | Expected Result | Status |
|---|---|---|---|
| FT-01 | Parent login with email works | Parent session saved and enquiry page opens | Passed local |
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
| FT-14 | Parent enquiry form submits successfully | Lead created with `new` status | Passed local |
| FT-15 | Parent portal update submits successfully | `parent-portal` workflow record appears in Operations | Passed local |
| FT-16 | Operations page loads workflow summary | Records, seats, referrals, and recommendations render | Passed local |
| FT-17 | Teacher/daycare/classroom workflow record saves | New `workflow_events` row appears in action history | Pending manual |
| FT-18 | Seat availability updates | Program seat count updates without duplicate row | Pending manual |
| FT-19 | Referral tracking saves | New referral appears in referral history | Pending manual |
| FT-20 | Rule-based recommendations load | Recommendations panel shows priority actions | Passed local |

## Edge Case Tests

| ID | Test | Expected Result | Status |
|---|---|---|---|
| ET-01 | Submit enquiry with empty required fields | Validation errors shown | Pending manual |
| ET-02 | Duplicate phone enquiry | Duplicate error shown | Pending manual |
| ET-03 | Book tour on full slot | Error shown, no booking created | Pending manual |
| ET-04 | Delete lead with history | Not implemented in current scope | N/A |
| ET-05 | Empty dashboard state | Empty message appears without crash | Pending manual |
| ET-06 | Mobile responsive layout | Sidebar collapses to hamburger | Pending manual |
| ET-07 | Parent login with invalid email | Validation error shown | Pending manual |
| ET-08 | Seat filled count greater than total seats | Backend returns validation error | Pending manual |
