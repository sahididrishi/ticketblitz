# Deploying TicketBlitz to Render.com

TicketBlitz is configured for a "Blueprints" deployment on Render, which automatically provisions the Database and Web Service.

## Prerequisites
1.  A [GitHub account](https://github.com) with this repository.
2.  A [Render.com account](https://render.com).

## Steps

1.  **Log in to Render** and go to your **Dashboard**.
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub repository (`sahididrishi/ticketblitz`).
4.  Give the blueprint a name (e.g., `ticketblitz-production`).
5.  Click **Apply**.

Render will automatically:
- Spin up a **PostgreSQL Database** (Free Tier).
- Build your **Spring Boot Docker Image**.
- Deploy the app and connect it to the database.

## Verification
Once deployed, Render will provide a URL (e.g., `https://ticketblitz.onrender.com`).
- Visit the URL.
- Log in with `admin`/`admin` (Default data will be seeded).
