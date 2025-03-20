# Authentication & Authorization API

This project is a Node.js API that demonstrates user authentication and authorization using JSON Web Tokens (JWT). It also includes endpoints for managing products (CRUD operations) that are secured by token-based authentication.

## Features

- **User Registration:**  
  Users can register by providing their name, email, and password. Passwords are securely hashed before storage.

- **User Login:**  
  Registered users can log in using their email and password to receive a JWT.

- **JWT-Based Authentication:**  
  Protected routes require a valid JWT to access product-related operations.

- **Product Management:**  
  Endpoints for listing, retrieving, creating, updating, and deleting products.

- **CORS Enabled:**  
  Configured to allow requests from any origin.

## Technologies Used

- Node.js
- Express.js
- MongoDB & Mongoose
- bcryptjs (for password hashing)
- jsonwebtoken (JWT for authentication)
- Postman (for API testing)
- Render (for deployment)

### Running the Project

Start the server using:

```bash
node index.js

# API Documentation

The API will be available at:  
[https://kaz-authentication-and-authorization.onrender.com](https://kaz-authentication-and-authorization.onrender.com)

## API Endpoints

You can import the provided Postman collection to test the API endpoints. The collection includes the following endpoints:

- **User Registration:** `POST /register`
- **User Login:** `POST /login`
- **Get All Products:** `GET /products`
- **Get a Single Product:** `GET /product/:id`
- **Create a Product:** `POST /product`
- **Update a Product:** `PUT /product/:id`
- **Delete a Product:** `DELETE /product/:id`

## Production Base URL

For deployed instances on Render, use:  
[https://kaz-authentication-and-authorization.onrender.com/](https://kaz-authentication-and-authorization.onrender.com/)

## Deployment

This project is deployed on [Render](https://render.com/).
