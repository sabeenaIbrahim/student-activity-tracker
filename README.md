# Student Activity Tracker

Browser-based study tracker for students with activity management, reusable profile details, backup support, and offline-ready PWA behavior.

## Features

- Dashboard, activities view, and a dedicated student profile page
- Profile fields for student name, class, department, institution, university, academic year, semester, phone number, email, and extra notes
- Add, complete, prioritize, edit, and delete activities
- Click any activity card to open a study details popup with unlimited notes
- Google and ChatGPT quick actions generated from the activity plus saved academic profile context
- Priority activities stay at the top until they are completed
- Completed activities move to the bottom with a smooth in-page animation
- Dark mode, backup, import, about dialog, and manual update check
- LocalStorage-based persistence with PWA support

## How To Use

1. Open `Profile` and save the student details you want reused in search and study prompts.
2. Open `Activities` to add a task with title, description, and optional priority.
3. Click an activity card to add detailed notes, open Google references, or send a study prompt to ChatGPT.
4. Use the bottom action buttons on each activity to prioritize, complete, edit, or delete it.

## Backup And Restore

- Use `Backup Data` from the menu to download activities and profile data as JSON.
- Use `Import Data` to restore a previous backup, including saved student profile details.

## Tech Stack

- HTML
- CSS
- JavaScript
- localStorage
- Service Worker
- Web App Manifest
