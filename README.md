# Inventory & Order Management API

This is a RESTful API for managing products and customer orders.

## Objective

To design and implement a RESTful API that evaluates backend system design, database modeling, transaction handling, and code quality.

## Tech Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB
- **MongoDB Atlas**: Cloud database service that supports transactions

---

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/soehtetlin/inventory-order-api.git
    cd inventory-order-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project directory. This file will hold your environment-specific configurations.

    You can choose to connect to either a local MongoDB database or a cloud-hosted MongoDB Atlas cluster.

    #### Option A: Using MongoDB Atlas (Recommended)

    1.  Copy the following into your `.env` file:
        ```env
        PORT=3000
        MONGODB_URI=
        ```
    2.  Replace the value of `MONGODB_URI` with your own connection string from MongoDB Atlas. It should look like this:
        `mongodb+srv://<username>:<password>@yourcluster.mongodb.net/your_database_name?retryWrites=true&w=majority`

    #### Option B: Using a Local MongoDB Database

    1.  Ensure you have MongoDB Community Server installed and running on your machine.
    2.  Copy the following into your `.env` file:
        ```env
        PORT=3000
        MONGODB_URI=mongodb://localhost:27017/inventory_order_db
        ```
        -   You can change `inventory_order_db` to any database name you prefer.
        -   **Note:** Using a local standalone MongoDB instance does not support transactions. The "Place Order" feature will work, but without the atomicity guarantee provided by transactions.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

---

---

## API Documentation

The base URL for all API endpoints is `http://localhost:3000`.

### Product Management

---

#### 1. Create a New Product

Creates a new product in the inventory.

-   **Endpoint:** `POST /api/products`
-   **Access:** Admin
-   **Request Body:** `application/json`

    ```json
    {
        "name": "Gaming Keyboard",
        "price": 75.50,
        "stock": 120
    }
    ```

-   **Success Response (201 Created):**

    ```json
    {
        "_id": "65e9b3a4f8b9c0d1e2f3g4h5",
        "name": "Gaming Keyboard",
        "price": 75.50,
        "stock": 120,
        "createdAt": "2024-03-07T12:00:00.000Z",
        "updatedAt": "2024-03-07T12:00:00.000Z"
    }
    ```

-   **Error Responses (400 Bad Request):**
    -   If required fields are missing:
        ```json
        {
            "message": "Please enter all fields: name, price, and stock"
        }
        ```
    -   If a product with the same name already exists:
        ```json
        {
            "message": "A product with this name already exists."
        }
        ```

---

#### 2. Get All Products

Retrieves a list of all available products.

-   **Endpoint:** `GET /api/products`
-   **Access:** Public
-   **Success Response (200 OK):**
    Returns an array of product objects.
    ```json
    [
        {
            "_id": "65e9b3a4f8b9c0d1e2f3g4h5",
            "name": "Gaming Keyboard",
            "price": 75.50,
            "stock": 120,
            "createdAt": "...",
            "updatedAt": "..."
        },
        {
            "_id": "65e9b3b5f8b9c0d1e2f3g4h6",
            "name": "Laptop",
            "price": 1200,
            "stock": 50,
            "createdAt": "...",
            "updatedAt": "..."
        }
    ]
    ```

---

#### 3. Get a Single Product

Retrieves a single product by its unique ID.

-   **Endpoint:** `GET /api/products/:id`
-   **Access:** Public
-   **Success Response (200 OK):**
    Returns the product object.
-   **Error Response (404 Not Found):**
    If the product with the specified ID does not exist.
    ```json
    {
        "message": "Product not found"
    }
    ```

---

#### 4. Update a Product

Updates the details of an existing product.

-   **Endpoint:** `PUT /api/products/:id`
-   **Access:** Admin
-   **Request Body:** `application/json`
    (You can include any fields you want to update)
    ```json
    {
        "price": 70,
        "stock": 110
    }
    ```
-   **Success Response (200 OK):**
    Returns the updated product object.
-   **Error Response (404 Not Found):**
    If the product to be updated does not exist.

---

#### 5. Delete a Product

Deletes a product from the inventory.

-   **Endpoint:** `DELETE /api/products/:id`
-   **Access:** Admin
-   **Success Response (200 OK):**
    ```json
    {
        "message": "Product deleted successfully",
        "deletedProduct": {
            "_id": "65e9b3a4f8b9c0d1e2f3g4h5",
            "name": "Gaming Keyboard",
            "price": 70,
            "stock": 110,
            "createdAt": "...",
            "updatedAt": "..."
        }
    }
    ```
-   **Error Response (404 Not Found):**
    If the product to be deleted does not exist.

---
### Order Management

---

#### 1. Place a New Order

Creates a new customer order. This process is transactional; it will either succeed completely or fail without changing any data.

-   **Endpoint:** `POST /api/orders`
-   **Access:** Customer/Admin
-   **Request Body:** `application/json`
    ```json
    {
        "customer_name": "John Doe",
        "items": [
            {
                "product_id": "65e9b3b5f8b9c0d1e2f3g4h6",
                "quantity": 1
            },
            {
                "product_id": "65e9b3a4f8b9c0d1e2f3g4h5",
                "quantity": 2
            }
        ]
    }
    ```
-   **Success Response (201 Created):**
    Returns the newly created order object with a calculated `total_price`.
-   **Error Responses (400 Bad Request):**
    -   If product stock is insufficient:
        ```json
        {
            "message": "Insufficient stock for product: Laptop. Available: 50, Requested: 51"
        }
        ```
    -   If a `product_id` is invalid:
        ```json
        {
            "message": "Product with ID 65e9b3b5f8b9c0d1e2f3g4h6 not found."
        }
        ```

---

#### 2. Get All Orders

Retrieves a list of all customer orders, sorted by the most recent.

-   **Endpoint:** `GET /api/orders`
-   **Access:** Admin
-   **Success Response (200 OK):**
    Returns an array of order objects.

---

#### 3. Get Orders by Customer

Retrieves all orders placed by a specific customer.

-   **Endpoint:** `GET /api/orders/customer/:customerName`
-   **Access:** Admin
-   **Success Response (200 OK):**
    Returns an array of order objects for the specified customer.

---

#### 4. Update Order Status

Updates the status of an existing order (e.g., from 'pending' to 'completed' or 'cancelled'). If the status is changed to 'cancelled', the stock for the products in the order will be restored.

-   **Endpoint:** `PUT /api/orders/:id/status`
-   **Access:** Admin
-   **Request Body:** `application/json`
    ```json
    {
        "status": "completed"
    }
    ```
-   **Success Response (200 OK):**
    Returns the updated order object.
-   **Error Responses:**
    -   **400 Bad Request:** If the provided status is invalid.
    -   **404 Not Found:** If the order to be updated does not exist.

## Testing

This project includes a suite of unit tests to ensure the reliability and correctness of the core business logic. The tests are written using the **Jest** framework.

### Key Areas Tested

**Product Controller:**

- Successful creation of a new product.
- Fetching all products and a single product by ID.
- Updating and deleting existing products.
- Error handling for invalid input (e.g., missing fields) and non-existent products.

**Order Controller:**

- Successful placement of a new order, ensuring product stock is correctly decremented.
- Error handling for insufficient stock.
- Logic for restoring product stock when an order is cancelled.
- Fetching all orders and orders by a specific customer.

### How to Run Tests

To run the entire test suite, use the following command from the project's root directory:

```bash
npm test