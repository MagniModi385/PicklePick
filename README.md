->Features
User Authentication via Clerk for secure sign-up/login

Venue Discovery with detailed court listings

Real-Time Court Slot Scraping from Hudle URLs (headless browser)

Game Posts and Matchmaking with skill levels and scheduling

Instant Messaging for players to coordinate games

Court Slot Booking with availability status

Admin Dashboard for managing posts and venues

Responsive design for desktop and mobile compatibility

->Tech Stack
Frontend: React, React Router, Clerk for authentication

Backend: Django REST Framework, Selenium for scraping, PostgreSQL database

Slot Scraper: Python Selenium headless Chrome to extract live slot data



Getting Started
Prerequisites
Python 3.8+

Node.js and npm

Chrome browser installed (for Selenium scraping)

Virtual environment tool (venv or conda)


Usage
Visit the homepage to browse pickleball venues.

Sign in or sign up using Clerk authentication.

View available courts, real-time slots, and book games.

Use in-app chat to coordinate matches.

Monitor your games and bookings via your profile.

Slot Scraper
Uses Selenium and headless Chrome to scrape court availability from Hudle.

Headless mode prevents browser pop-ups during scraping.

Scraper handles multiple courts and dynamic slot tables.

Returns structured availability data for the frontend.

Future Improvements
Payment Integration: Support secure booking payments with Stripe and PayPal.

Notifications: Push and email notifications for bookings and game updates.

Advanced Matchmaking: AI-driven skill matching and recommendations.

Tournament Management: Organize official pickleball competitions.

Mobile App: Native app for iOS and Android for notifications and easier access.

Contribution
Contributions are welcome! Please open issues or submit pull requests with meaningful changes or features.

License
This project is licensed under the MIT License.

Contact
For questions and support, reach out at: chirplabproductions@gmail.com
