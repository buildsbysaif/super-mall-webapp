# Super Mall Web Application

A modern, feature-rich web portal for a Super Mall, allowing an administrator to manage shop details and offers in real-time. Users can browse, search, and filter shops to find the latest deals.

**Live Demo URL**:  [https://super-mall-app-614a9.web.app](https://super-mall-app-614a9.web.app)

---

## Key Features

* **Real-time Admin Dashboard**: A secure admin panel with live statistics on total shops, categories, and floors.
* **Full CRUD Functionality**: Admins can Create, Read, Update, and Delete shops, categories, floors, and offers.
* **Professional Offer Management**: A clean pop-up modal for admins to manage offers for each specific shop.
* **Live Search & Filtering**: Users can instantly search for shops by name and apply filters for categories and floors.
* **Shop Details Modal**: A polished pop-up for users to view a shop's details and all its current offers.

---

## Technologies Used
- HTML5
- CSS3 (with CSS Variables for easy theming)
- Vanilla JavaScript
- **Firebase** for backend services:
    - **Authentication** for secure admin login
    - **Firestore** as a real-time NoSQL database

---

## Project Workflow & Execution

### Admin Workflow
1.  Navigate to `/admin.html`.
2.  Log in with the predefined admin credentials.
3.  View real-time statistics on the dashboard.
4.  Add new categories and floors as needed.
5.  Create new shop entries using the forms.
6.  Manage existing shops using the data table to add offers or delete entries.

### User Workflow
1.  Open the live application URL (`index.html`).
2.  View the grid of all available shops.
3.  Use the search bar and dropdown menus to filter the shops.
4.  Click the "View Details" button on any shop card to see its offers in a pop-up modal.

---

## How to Run Locally

1.  Clone the repository: `git clone <your-repo-url>`
2.  Install the "Live Server" extension in VS Code.
3.  Right-click on `index.html` and select "Open with Live Server".