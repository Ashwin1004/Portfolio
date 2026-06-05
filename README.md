# Ashwin M S - Personal Portfolio

A premium, highly interactive personal portfolio website inspired by Cuberto, Linear, and Apple. Designed for system-level backend engineers, featuring interactive neural networks, physics-based magnetic tracking, custom cursor states, and staggered letter scroll reveals.

---

## ✨ Features

- **Interactive Hero Canvas**: Dynamic neural network canvas mapping cursor coordinates to simulate intelligence network nodes.
- **GSAP & ScrollTrigger Animations**: Staggered character rise-up text effects, smooth scrolling via Lenis, and dynamic timeline nodes.
- **Active Section Highlighting**: High-performance tracking that glows matching navbar links as you scroll.
- **Recruiter-Friendly Integration**:
  - Direct connection cards (Email, GitHub, LinkedIn).
  - **Anonymous Message Line**: Let visitors drop questions/feedback without needing name or email fields.
- **Fully Responsive**: Sleek glassmorphism details, adaptive sizing, and clean design tokens.

---

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla CSS3 (Custom design variables)
- **Animation**: GSAP (GreenSock Animation Platform), ScrollTrigger
- **Scroll Physics**: Lenis Smooth Scroll
- **Icons**: Lucide Icons & Custom SVG Layouts
- **Deployment & Server**: Python standard library (`http.server`) & Flask/Gunicorn

---

## 🚀 How to Run Locally

You can launch a local server instantly using Python's built-in HTTP server:

1. Clone or navigate to the repository directory:
   ```bash
   cd Portfolio
   ```
2. Start the local server:
   ```bash
   python -m http.server 8001
   ```
3. Open [http://localhost:8001](http://localhost:8001) in your browser.

---

## 🌐 Deploying to Render

This repository is pre-configured for two methods of deployment on **Render**:

### Method 1: Deploy as a Static Site (Recommended & Free ⚡)
1. Go to your **Render Dashboard** and click **New +** > **Static Site**.
2. Link your GitHub repository (`https://github.com/Ashwin1004/Portfolio.git`).
3. Leave **Build Command** blank.
4. Set **Publish Directory** to `.` (root directory).
5. Click **Deploy**.

### Method 2: Deploy as a Web Service (Python Backend)
1. Click **New +** > **Web Service**.
2. Choose **Python** as the runtime.
3. Set the **Start Command** to:
   ```bash
   gunicorn app:app
   ```
4. Render automatically reads `requirements.txt` and starts the Flask server to serve your assets.
