# BacterioScan - Setup Guide

## Prerequisites
1.  **Node.js**: Download and install from [nodejs.org](https://nodejs.org/). (Version 18 or higher recommended).
2.  **VS Code**: Your code editor.

## Step-by-Step Setup

### 1. Create the Project
Open your terminal (Command Prompt or Terminal in VS Code) and run:

```bash
npx create-react-app bacterioscan --template typescript
```

This creates a folder named `bacterioscan`. Navigate into it:

```bash
cd bacterioscan
```

### 2. Install Dependencies
We need to install the icon library (Lucide) used in the code. Tailwind is loaded via CDN for simplicity in this specific build, so no complex CSS setup is needed.

```bash
npm install lucide-react
```

### 3. Copy the Code
You need to replace the generated files with the code provided in the XML response.

1.  **Delete** everything inside the `src/` folder except `react-app-env.d.ts` (if it exists, otherwise empty is fine).
2.  **Create** the files exactly as named in the XML output.
    *   Place `index.tsx`, `App.tsx`, `types.ts` in the **root** of your `src` folder (technically `src/` based on standard React structure, but the XML treats current dir as root). *Note: If using standard create-react-app, put these in `src/`*.
    *   Create a folder `src/components` and add `Header.tsx`, `LoginForm.tsx`, `CameraView.tsx`, `HistoryView.tsx`.
    *   Create a folder `src/services` and add `piService.ts`.
    *   Replace `public/index.html` with the `index.html` provided.

### 4. Running the App
In your terminal, inside the project folder:

```bash
npm start
```

This will open `http://localhost:3000` in your browser.

### 5. Using the App
1.  **Login**:
    *   Username: `Bacteria`
    *   Password: `Bacteria@123`
2.  **Camera**:
    *   Click "Capture Photo".
    *   Allow Camera permissions when the browser asks.
    *   Click the circle button to snap a picture.
3.  **Analysis**:
    *   After taking a photo, click "Analyze Sample".
    *   This currently uses a **Simulation** (Mock) service. It waits 2 seconds and gives a random bacteria result.
4.  **Raspberry Pi Integration**:
    *   To connect your real Pi, open `src/services/piService.ts`.
    *   Uncomment the `fetch` code block.
    *   Replace `http://YOUR_RASPBERRY_PI_IP:8000/...` with your actual Pi API URL.

### 6. Mobile Usage
To test the camera on your mobile phone:
1.  Ensure your computer and phone are on the same WiFi.
2.  Find your computer's local IP (e.g., `192.168.1.5`).
3.  On your phone, visit `http://192.168.1.5:3000`.
4.  *Note:* Modern browsers require HTTPS for camera access on external devices (non-localhost). For development, you might need to use a tunneling service like `ngrok` or setup a local HTTPS cert if the camera doesn't open on the phone.

