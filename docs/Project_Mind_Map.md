# Admission Counsellor Follow-up Dashboard - Mind Map

Use this mind map to explain the project in review, report, or PPT.

```mermaid
mindmap
  root((Admission Counsellor Follow-up Dashboard))
    Mission
      Replace scattered Excel and WhatsApp tracking
      Prevent missed parent follow-ups
      Give centre head real-time admission visibility
      Improve conversion from enquiry to admission
    Users
      Parents
        Email-based login
        Submit enquiry form
        Update child and admission details
      Counsellors
        Manage assigned leads
        Log calls and follow-ups
        Book demo tours
        Generate call scripts
      Admin or Centre Head
        Monitor all leads
        Assign counsellors
        View analytics
        Track performance
    Project Faces
      Public Parent Portal
        Public URL visible to parents
        Parent login
        Enquiry form
        Parent portal updates
      Private Staff Portal
        Private staff URL
        JWT protected login
        Dashboard and CRM tools
        Not visible on public pages
    Core Workflow
      New Enquiry
      Contacted
      Demo Scheduled
      Demo Visited
      Follow-up
      Final Result
        Admitted
        Not Interested
        Lost
    Frontend Implementation
      React and Vite
      Tailwind CSS UI
      React Router routes
      AuthContext for staff session
      Axios API service
      Pages
        Parent Home
        Parent Login
        Enquiry
        Parent Portal
        Staff Login
        Dashboard
        Leads
        Lead Detail
        Tours
        Analytics
        Operations
      UI Features
        Sidebar and TopBar
        Search and filters
        Status and priority badges
        Follow-up timeline
        Notification dropdown
        Charts and summary cards
    Backend Implementation
      Node.js and Express
      REST API routes
      CORS configuration
      JSON validation
      JWT authentication
      MySQL connection pool
      Route Modules
        auth.js
        enquiry.js
        leads.js
        followups.js
        tours.js
        analytics.js
        ai.js
        notifications.js
        operations.js
        counsellors.js
    Database Storage
      Railway MySQL
      Tables
        counsellors
        parents
        leads
        follow_ups
        tour_slots
        tour_bookings
        admissions
        notifications
        referrals
        seat_availability
        workflow_events
    Main Functions
      Staff Auth
        login
        getMe
        verifyToken
        requireAdmin
      Parent Flow
        parentLogin
        submitEnquiry
        submitParentPortalUpdate
      Lead Management
        getLeads
        getLead
        createLead
        updateLeadStatus
        assignLead
        importLeads
      Follow-ups
        logFollowUp
        getTodayFollowUps
        getOverdueFollowUps
      Tours
        getTourSlots
        createTourSlot
        bookTour
        updateTourBooking
      Analytics
        getAnalyticsSummary
        getAnalyticsFunnel
        getCounsellorStats
        getMonthlyTrend
      AI and Rules
        generateCallScript
        calculatePriority
        generateFollowUpMessage
        generateOperationalRecommendations
      Notifications
        runNotificationScan
        startNotificationService
        markNotificationRead
    AI and Automation
      Rule-based no paid API
      Personalized call script
      Priority calculation
      WhatsApp-ready message
      Operational recommendations
      Hourly notification scan
    Deployment
      Frontend on Vercel
      Backend on Railway
      Database on Railway MySQL
      GitHub source code
      Desktop final handover folder
    Testing
      API smoke tests
      Frontend build test
      Deployment health check
      Login and dashboard verification
      Public parent flow verification
    Final Outcome
      One CRM dashboard for admission follow-up
      Parent enquiry captured properly
      Counsellor actions tracked
      Centre head gets analytics
      Follow-up reminders reduce missed leads
```

## Quick Explanation Script

This mind map shows the complete structure of our project. At the centre, we have the Admission Counsellor Follow-up Dashboard. The mission is to replace manual Excel and WhatsApp tracking with a proper CRM system for admissions.

The system has two faces. The public parent portal is for parents to login with email and submit enquiry details. The private staff portal is for counsellors, admins, and centre heads. Staff access is protected and not visible on public pages.

The main workflow starts from a new enquiry and moves through contacted, demo scheduled, demo visited, follow-up, and finally admitted, not interested, or lost.

Frontend is built using React, Vite, Tailwind CSS, React Router, Axios, and AuthContext. Backend is built using Node.js, Express, JWT authentication, and MySQL connection pool. Data is stored in Railway MySQL tables like leads, follow-ups, counsellors, tour bookings, admissions, and notifications.

The important functions handle login, parent enquiry submission, lead management, follow-up logging, tour booking, analytics, rule-based AI scripts, priority calculation, and automatic notifications.

The final output is a working admission CRM where parents can submit enquiries, counsellors can track every follow-up, and centre heads can monitor performance and conversion.

