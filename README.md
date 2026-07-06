# Vitalis AI Health Dashboard

District Telemetry and AI forecasting system.

## Prerequisites

- Node.js
- MySQL

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Database Setup:**
    Ensure you have a MySQL server running locally. By default, it connects as `root` with no password (`''`), and creates a database named `vitalis_db`. You can modify this in `db_mysql.js` and `init_db.js`.
    To initialize the database and seed data:
    ```bash
    node init_db.js
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    PORT=3000
    ```

## Running the Application

You can start the server and the client using the following commands:

-   **Development mode (Server & Client concurrently):**
    ```bash
    npm run dev
    ```

-   **Start server only:**
    ```bash
    npm run server
    ```
    or
    ```bash
    npm start
    ```

-   **Start client only:**
    ```bash
    npm run client
    ```

-   **Build client:**
    ```bash
    npm run build
    ```

## System Overview

-   **Backend:** Express API with Node.js.
-   **Database:** MySQL.
-   **AI Integration:** Google Gemini (`@google/genai`) for predicting health metrics, required medicine stocks, and automated prescriptive actions.
-   **Real-time Updates:** Socket.io is utilized to provide live updates (e.g., mock GPS tracking for ambulances).
-   **Frontend:** Vite, HTML, Tailwind CSS. Includes connected UI dashboards for District Telemetry, AI Health Predictions, Medicine Inventory AI Forecast, City PHC details, and a Secure Admin Login.
