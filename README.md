# E-commerce API

This project is a comprehensive RESTful API for a modern e-commerce backend. It features a robust, layered architecture and handles core functionalities like user authentication, product and inventory management, shopping carts, and transactional orders.

## Tech Stack & Key Concepts

-   **Framework:** Node.js with Express.js
-   **Database:** MongoDB with Mongoose (ODM)
-   **Architecture:** Layered Architecture (Controllers -> Services -> Repositories)
-   **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (Admin/Customer)
-   **Containerization:** Docker & Docker Compose for a consistent development and deployment environment.
-   **Testing:** Unit Tests (Jest) for services and Integration Tests (Jest & Supertest) for API endpoints.
-   **Data Validation:** `express-validator` for sanitizing and validating incoming request data.
-   **Security:** Password hashing with `bcryptjs` and management of secrets using environment variables.

---

## Project Status & Features

### Completed Features

-   [x] **User Authentication:** Full Register/Login flow with JWT and distinct **ADMIN** & **CUSTOMER** roles.
-   [x] **Product & Inventory Management:**
    -   Products (base details) and Variants (price, stock, SKU) are managed separately.
    -   Full CRUD (Create, Read, Update, Delete) operations for Products and Variants, restricted to ADMIN users.
    -   Advanced product listing endpoint with **pagination**, **filtering** by category, and **sorting** by price.
-   [x] **Shopping Cart:**
    -   Authenticated customers can add items to their personal cart.
    -   View cart contents with a dynamically calculated total price.
-   [x] **Transactional Orders:**
    -   Implemented atomic order creation using MongoDB transactions to ensure data integrity.
    -   Stock levels are correctly decremented upon successful order placement.
    -   Stock is correctly restored if an order is cancelled.
-   [x] **Layered Architecture:** Implemented a clean Controller -> Service -> Repository pattern.
-   [x] **Full Containerization:** The entire application and database are containerized with Docker for easy setup.
-   [x] **Comprehensive Testing:** Includes both unit tests for services and integration tests for key API endpoints.

### Future Improvements / Remaining Features

Due to the time constraints, the following features were planned but not fully implemented. This demonstrates an understanding of the complete project scope.

-   **Full Shopping Cart CRUD:** Implementing endpoints to update item quantities and remove items from the cart.
-   **Order from Cart:** Creating a dedicated endpoint (`POST /api/orders/from-cart`) that automatically converts a user's shopping cart into an order and clears the cart upon success.
-   **Coupon Management:** Building the full CRUD for Coupon codes and integrating the discount logic into the order creation process.
-   **Global Error Handling:** Implementing a centralized error handling middleware in `index.js` to catch all errors and format responses consistently.

---

## Getting Started

### Prerequisites

-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
-   [Git](https://git-scm.com/)

### Setup & Installation

This project is fully containerized, making setup incredibly simple.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/senior-ecommerce-api-assessment.git
    cd senior-ecommerce-api-assessment
    ```
    *(Replace the URL with your actual repository link)*

2.  **Create your environment file:**
    Create a file named `.env` in the root of the project. Copy the contents of `.env.example` (if you created one) or add the following required variables:

    ```env
    PORT=3000
    # This will be used by the Docker container for the app
    MONGODB_URI=mongodb://mongo:27017/ecommerce_db

    # Secret keys for JWT and Admin registration
    JWT_SECRET=your_super_secret_for_jwt_assessment
    ADMIN_SECRET_KEY=your_admin_secret_for_assessment
    
    # Connection string for running tests against a cloud DB
    MONGO_URI_TEST=your_mongodb_atlas_test_connection_string
    ```

3.  **Run the application with Docker Compose:**
    This single command will build the Node.js image, pull the MongoDB image, and start both containers.

    ```bash
    docker-compose up --build
    ```
    The API will be available at `http://localhost:3000`.

---

## Testing

The project includes a comprehensive suite of tests.

### How to Run Tests

To run all unit and integration tests, use the following command from the project's root directory:

```bash
npm test