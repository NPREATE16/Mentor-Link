## Tutor Support System – HCMUT

A web platform to modernize and manage the Tutor/Mentor program at Ho Chi Minh City University of Technology (HCMUT). The system connects students with tutors, automates scheduling, and streamlines feedback and reporting.

### Key Features
- Centralized user and profile management for students and tutors
- Manual and automatic tutor matching (by subject and schedule)
- Automated session scheduling, notifications, and attendance
- Document sharing between tutors and students
- Feedback collection and visual reporting for all stakeholders
- Integration-ready with HCMUT’s authentication and data systems

### Tech Stack
- **Frontend:** ReactJS
- **Backend:** ExpressJS

### Project Structure
- `webapp/`: Frontend React app (components, pages, context, assets)
- `webserver/`: Backend Express server (data, routes, models)

### How to run project
1. Create .env file in `webserver`, type:
zDB_HOST=trolley.proxy.rlwy.net
DB_PORT=48989
DB_PASSWORD=MOPhJPjciaqKufVlIuEvOzecJJLnAgqS
DB_DATABASE=railway
DB_USER=root
3. Open first terminal, type:
```
cd webserver
npm install
node server.mjs
```
3. Open second terminal, type:
```
cd webapp
npm install
npm run dev
```



