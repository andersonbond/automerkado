You are a senior full-stack engineer. Build a production-ready state-of-the-art car tradining web platform with the following requirements:

## Tech Stack

* Framework: Next.js (App Router)
* Database: SQLite (using Prisma ORM)
* Styling: Tailwind CSS
* Authentication: NextAuth (credentials-based)
* Image Handling: Next.js Image component (next/image)

---

## Project Overview

Build a Car Trading Platform named Automerkado with:
* Public website (car browsing & bidding)
* Admin CMS (manage cars, users, bids)
* Analytics dashboard

---

## Core Features

### 1. Public Website

Pages:
* Home
* Car Listings
  * Certified Cars
  * Repossessed Cars
* Car Details Page with image slider
    * With Bid button (need user auth, if no user session, show a register form)
    * With Inspect button (need user auth, if no user session, show a register form)
* About
* Blog
* FAQ
* Contact

Features:
* Search and filter cars
* View car details (images, specs, price, status)
* Display car price list

---

### 2. Authentication
* User registration and login
* Session management
* Role-based access (admin vs user)

---

### 3. Car Management (Admin CMS)
State of the art CMS:
Side bar navigation (Dashboard, Cars, Images, Files, Settings, Logout)
* Dashboard will contain analytics
* Cars CRUD operations:
  * title, brand, model, year, price
  * category (certified / repossessed)
  * description
  * images (multiple uploads)
* Images will contain list of images and CRUD operations
    * Image upload with automatic optimization using next/image
    * Store image paths in SQLite
* Files will contain list of files and CRUD operations
* Settings will contain User Account Information
* Logout will logout the user and redirect to home page

---

### 4. Bidding System

* Users can place bids on cars
* Each car has:
  * current highest bid
  * bid history
* Enforce rule:
  * Bidding closes every Wednesday at 4:00 PM (server-side logic)
* Prevent bids after cutoff

---

### 5. Analytics Dashboard (Admin)

* Metrics:

  * Total users
  * Active users
  * Total cars
  * Cars per category
  * Total bids
  * Bids per car
* Display charts (use a lightweight chart library)

---

### 6. Database Design (Prisma Models)

Include:
* User
* Car
* Bid
* Category

Ensure relationships:
* One user → many bids
* One car → many bids

---

### 7. API & Architecture
* Use Next.js Route Handlers (/api)
* Follow clean architecture:

  * services
  * repositories
  * controllers
* Use server actions where applicable

---

### 8. Performance & Optimization

* Use next/image for all images
* Lazy load listings
* Optimize queries (pagination)

---

### 9. Security

* Validate all inputs
* Protect admin routes
* Prevent bid tampering (server validation)
* Prevent SQL injection

---

## Deliverables

* Fully working Next.js app
* Prisma schema and migrations
* Seed data
* README with setup instructions

---

## Additional requirements

* Email notification for user who bids
* Admin ability to close bidding manually
* SEO optimization for listings

## Branding
* Red #EA2027, Black #2f3542, White

---

Build the project step-by-step:

1. Initialize project
2. Setup database
3. Implement auth
4. Build CMS
5. Build public pages
6. Add bidding logic
7. Add dashboard
8. Optimize and secure