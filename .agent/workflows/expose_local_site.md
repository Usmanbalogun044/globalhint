---
description: How to expose the local Laravel backend to the internet using Herd/Expose
---

# Expose Local Backend with Herd

This workflow guides you through sharing your local Laravel Herd site via a public URL and configuring the frontend to use it.

## Prerequisites

- Laravel Herd installed and running.
- `expose` installed (usually comes with Herd, or install via `composer global require beyondcode/expose`).

## Steps

1.  **Start the Backend Share**
    Open a terminal in your backend directory (or anywhere, really) and run:

    ```powershell
    herd share
    # OR if using raw expose
    expose share http://globalhint.test
    ```

    _Select the site you want to share if prompted._

2.  **Copy the Public URL**
    Look for the **HTTPS** URL in the output (e.g., `https://globalhint.sharedwithexpose.com`).

3.  **Update Frontend Configuration**
    Open `frontend_react/.env` and update the `VITE_API_URL`:

    ```env
    VITE_API_URL=https://your-new-url.com/api
    ```

    _Note: Ensure you append `/api` at the end._

4.  **Revert Hardcoded Changes (Important)**
    If you manually edited `src/lib/axios.ts`, revert it to use the environment variable:

    ```typescript
    baseURL: import.meta.env.VITE_API_URL || 'http://backend.test/api',
    ```

5.  **Restart Frontend**
    Stop the running frontend terminal (Ctrl+C) and run:

    ```powershell
    npm run dev
    ```

6.  **Verify**
    Open the new public URL in your browser to ensure it loads (you might need to bypass a warning page once). Then try your app.
