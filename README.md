# RDM Motors Site

This is a Next.js application for RDM Motors, including an inventory management admin panel.

## Setup

1.  Open your terminal in this directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Panel

The admin panel allows you to manage vehicle inventory.

-   **URL:** [http://localhost:3000/admin](http://localhost:3000/admin)
-   **Login:**
    -   **Password:** `admin123` (Configurable in `.env.local`)

## Data Storage

Data is stored locally in `data/vehicles.json`.
-   The initial data is seeded from mock data.
-   You can add/edit/delete vehicles from the admin panel, and changes will persist to this file locally.
-   Images are handled as URLs (you can paste external URLs or upload valid data URLs).

## Features

-   **Public Site:** View available and sold vehicles.
-   **Admin Dashboard:**
    -   View analytics (page views, clicks - mocked for demo).
    -   Manage inventory (CRUD operations).
    -   Upload multiple images.
