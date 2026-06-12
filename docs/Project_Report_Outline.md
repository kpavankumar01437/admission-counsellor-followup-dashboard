# Project Report Outline

## Chapter 1: Introduction

FirstCry Intellitots is a preschool and early learning centre where parent enquiries, demo visits, admission follow-ups, and counsellor activity directly affect monthly admissions. In the current workflow, many enquiries are tracked through phone calls, WhatsApp messages, and scattered spreadsheets. This makes it difficult for counsellors to remember every follow-up, for centre heads to monitor ownership, and for the team to identify leads that need urgent attention.

The proposed project, **Admission Counsellor Follow-up Dashboard**, is a full-stack web application designed to manage the complete admission funnel from enquiry to conversion. The system allows parents to submit enquiries through a public form, assigns leads to counsellors, tracks each status change, logs follow-up calls, schedules demo tours, and provides analytics for centre heads. It also includes a rule-based AI layer that generates counsellor call scripts, follow-up messages, and priority flags without using any paid external AI API.

The main objective of the project is to improve admission conversion by reducing missed follow-ups and increasing accountability. Counsellors can quickly view their leads, update statuses, and log call outcomes. Admin users can monitor all leads, counsellor-wise performance, overdue follow-ups, demo bookings, and funnel movement. The project is built using React, Vite, Tailwind CSS, Node.js, Express, MySQL, and JWT authentication, making it practical for deployment through Vercel, Render, and Railway.

## Chapter 2: Literature Survey

- Compare existing tools: Google Sheets, Zoho CRM, HubSpot CRM.
- Explain why generic CRMs are too broad or costly for this internship use case.
- Gap analysis: preschool-specific funnel, demo visits, counsellor accountability, rule-based call scripts.

## Chapter 3: System Analysis

- Functional requirements: login, lead CRUD, public enquiry, follow-ups, tours, analytics, notifications.
- Non-functional requirements: responsive UI, secure JWT auth, role-based admin access, database integrity.
- Use cases: parent enquiry submission, counsellor follow-up, admin monitoring, demo booking.

## Chapter 4: System Design

- Architecture: React frontend, Express API, MySQL database, rule-based AI service, deployment layer.
- ER diagram: counsellors, leads, follow_ups, tour_slots, tour_bookings, admissions, notifications.
- API design: REST endpoints with standard success/error responses.

## Chapter 5: Implementation

- Frontend modules: login, dashboard, leads, lead detail, enquiry, tours, analytics.
- Backend modules: auth routes, lead routes, follow-up routes, analytics routes, AI engine.
- Key code snippets: JWT middleware, priority calculation, tour booking transaction.

## Chapter 6: Testing

- Functional tests table.
- Edge case tests table.
- Bug report table.
- API testing through Postman.

## Chapter 7: Deployment

- Railway MySQL setup.
- Render backend setup.
- Vercel frontend setup.
- Live URL and screenshots.

## Chapter 8: Conclusion and Future Scope

The Admission Counsellor Follow-up Dashboard successfully converts a manual admission tracking workflow into a structured digital system. It provides a single place to capture parent enquiries, assign counsellors, schedule demo visits, record follow-up calls, and monitor conversions. The dashboard improves visibility for the centre head and gives counsellors a clear daily action list, especially for pending and overdue follow-ups.

The project also demonstrates how rule-based AI can be useful even without paid external APIs. The call script generator, follow-up message generator, and priority calculation engine support counsellors with practical suggestions while keeping the system low-cost and easy to explain during review. The use of JWT authentication, role-based access, MySQL relational schema, and deployment-ready configuration makes the solution suitable as a realistic internship prototype.

Future improvements can include WhatsApp Business API integration for automated reminders, email notifications, fee payment tracking, parent portal access, advanced admission forecasting, and downloadable PDF reports for centre heads. The system can also be extended to support multiple branches, lead source ROI tracking, and OpenAI-powered conversation summaries if API access is approved later.

## References

- React documentation
- Vite documentation
- Express documentation
- MySQL documentation
- Render deployment documentation
- Vercel deployment documentation
- Railway MySQL documentation
