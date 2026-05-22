# DriveFleet Server 🚗💨

DriveFleet is a robust, secure, and scalable Node.js & Express backend designed for a modern Car Rental Application. It manages car listings, user bookings, and real-time availability tracking, backed by MongoDB. Secure routing is implemented using JWT verification via remote JWKS (`jose-cjs`).

## 🚀 Live Links
- **Live Server Deployment:** [https://drivefleet-server-delta.vercel.app](https://drivefleet-server-delta.vercel.app)

---

## ✨ Features

- **Car Management (CRUD):** - Fetch all listed cars with dynamic searching (by make, model, or location) and sorting (by price or popularity based on booking counts).
  - Add, update, and delete cars under safe protected routes.
- **Booking Workflow:** - Dynamic booking creation and automated cancellation updates.
  - Smart state handling: Booking a car automatically flags `available: false` and increments `booking_count`. Canceling a booking reverses the process safely.
- **Enterprise-Grade Security:**
  - Route protection via JSON Web Tokens (JWT).
  - Uses `jose-cjs` to verify authorization headers against a remote JWKS (JSON Web Key Set) endpoint.
- **Production-Ready CORS:** Configured with explicit credential allowance, custom headers, and multi-origin support.
- **Complete Error Handling:** Built-in try-catch blocks ensuring server stability and informative HTTP response status codes.

---

## 🛠️ Tech Stack

- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Official Node.js Driver)
- **Security & Auth:** `jose-cjs` (JSON Web Tokens / JWKS)
- **Environment Management:** `dotenv`
- **Cross-Origin Resource Sharing:** `cors`

---

## 📋 API Endpoints

### 🚘 Cars API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/cars` | Public | Get all cars with optional queries: `?search=toyota&sortBy=booking_count` |
| **GET** | `/cars/:id` | Public | Get details of a single car by its ID. |
| **GET** | `/availableCars` | Public | Get the top 6 available cars for the landing homepage grid. |
| **GET** | `/cars/owner/:email` | **Protected** | Get all cars added by a specific vendor/owner. |
| **POST** | `/cars` | **Protected** | Add a new car to the fleet. |
| **PUT** | `/cars/:id` | **Protected** | Modify/Update an existing car details by ID. |
| **DELETE** | `/cars/:id` | **Protected** | Permanently remove a car from the database. |

### 📅 Bookings API
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/bookings` | **Protected** | Create a car booking (updates vehicle status instantly). |
| **GET** | `/bookings` | **Protected** | Get bookings filtered via email query: `?email=user@example.com` |
| **GET** | `/bookings/user/:userId` | **Protected** | Retrieve booking history for a specific authenticated User ID. |
| **DELETE** | `/bookings/:id` | **Protected** | Cancel/Delete a booking by ID (restores car availability `?carId=XYZ`). |

---

