# API Documentation

## Endpoint: `/user/register`

### Description
This endpoint is used to register a new user in the system. It accepts user details such as name, email, phone, password, and an optional profile image. The first user to register is assigned the role of "admin" by default, while subsequent users are assigned the role of "user" unless specified.

### HTTP Method
`POST`

### URL
`/user/register`

### Request Headers
- `Content-Type: application/json`

### Request Body
The data should be sent as JSON with the following fields:

| Field         | Type     | Required | Description                              |
|---------------|----------|----------|------------------------------------------|
| `name`        | `string` | Yes      | Full name (min 3, max 50 characters).    |
| `email`       | `string` | Yes      | Valid unique email address.              |
| `phone`       | `string` | Yes      | Unique 10-digit phone number.            |
| `password`    | `string` | Yes      | Password (min 4 characters).             |
| `role`        | `string` | No       | User role (`user` or `admin`).           |

### Response

#### Success Response
- **Status Code:** `201 Created`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Registration successful",
      "data": {
          "name": "User Name",
          "email": "user@example.com",
          "phone": "1234567890",
          "role": "user",
          "loggedIn": false,
          "createdAt": "2024-01-20T12:00:00.000Z",
          "_id": "user_id"
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Validation error, existing email/phone, or missing required fields
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Email already registered"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during registration
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.post("https://online-shop-backend-qpnv.onrender.com/api/auth/user/register", {
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "1234567890",
    password: "securepassword"
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/login`

### Description
This endpoint is used to authenticate a user and provide a token for accessing protected resources. It accepts the user's email and password.

### HTTP Method
`POST`

### URL
`/user/login`

### Request Headers
- `Content-Type: application/json`

### Request Body
The data should be sent as JSON with the following fields:

| Field      | Type     | Required | Description                                    |
|------------|----------|----------|------------------------------------------------|
| `login`    | `string` | Yes      | User's email address or phone number.         |
| `password` | `string` | Yes      | User's password.                              |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Login successful",
      "data": {
          "token": "jwt_token",
          "user": {
              "id": "user_id",
              "name": "User Name",
              "email": "user@example.com",
              "role": "user"
          }
      }
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** Invalid email or password.
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Invalid email or password"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during login.
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.post("https://online-shop-backend-qpnv.onrender.com/api/auth/user/login", {
    login: "johndoe@example.com",
    password: "securepassword"
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/logout`

### Description
This endpoint is used to log out the currently authenticated user. It clears the JWT token cookie and updates the user's login status.

### HTTP Method
`GET`

### URL
`/user/logout`

### Request Headers
- `Authorization: Bearer <token>`

### Request Body
None required

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Logged out successfully"
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during logout
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get("https://online-shop-backend-qpnv.onrender.com/api/auth/user/logout", {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/profile`

### Description
This endpoint is used to retrieve the authenticated user's profile information.

### HTTP Method
`GET`

### URL
`/user/profile`

### Request Headers
- `Authorization: Bearer <token>`

### Request Body
None required

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "data": {
          "_id": "user_id",
          "name": "User Name",
          "email": "user@example.com",
          "phone": "1234567890",
          "role": "user",
          "profileImage": "image_url",
          "createdAt": "2024-01-20T12:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** User not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "User not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get("https://online-shop-backend-qpnv.onrender.com/api/auth/user/profile", {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/profile` (Update)

### Description
This endpoint is used to update the authenticated user's profile information.

### HTTP Method
`PUT`

### URL
`/user/profile`

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body
The data should be sent as JSON with the following fields:

| Field         | Type     | Required | Description                              |
|---------------|----------|----------|------------------------------------------|
| `name`        | `string` | No       | Full name (min 3, max 50 characters).    |
| `email`       | `string` | No       | Valid unique email address.              |
| `phone`       | `string` | No       | Unique 10-digit phone number.            |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Profile updated successfully",
      "data": {
          "_id": "user_id",
          "name": "Updated Name",
          "email": "updated@example.com",
          "phone": "9876543210",
          "role": "user",
          "profileImage": "image_url",
          "createdAt": "2024-01-20T12:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Validation error or existing email/phone
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Email already in use"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.put("https://online-shop-backend-qpnv.onrender.com/api/auth/user/profile", 
{
    name: "Updated Name",
    email: "updated@example.com",
    phone: "9876543210"
}, {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/profile-image`

### Description
This endpoint allows authenticated users to update their profile image. The endpoint performs validation on the image file including size and file type checks, handles the deletion of old profile images, and updates the user's profile with the new image path.

### HTTP Method
`PATCH`

### URL
`/user/profile/image`

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

### Request Body
The data should be sent as form-data with the following field:

| Field          | Type   | Required | Description                                     |
|----------------|--------|----------|-------------------------------------------------|
| `profileImage` | `file` | Yes      | Image file (JPG, JPEG, PNG). Max size: 5MB     |

### Validations
- File size must not exceed 5MB
- Only JPG, JPEG, and PNG file types are allowed
- Authentication token must be valid
- User must exist in the system

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Profile image updated successfully",
      "data": {
          "profileImage": "uploads/users/profileImage-timestamp.extension"
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Cases:**
    - No image uploaded
    - Invalid file type
    - File size exceeds limit
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Please upload an image"
    }
    ```
    ```json
    {
        "success": false,
        "message": "Please upload only JPG, JPEG or PNG images"
    }
    ```
    ```json
    {
        "success": false,
        "message": "Image size should be less than 5MB"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** Invalid or missing authentication token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** User not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "User not found"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during file upload or processing
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
const formData = new FormData();
formData.append('profileImage', imageFile);

axios.patch("https://online-shop-backend-qpnv.onrender.com/api/auth/user/profile-image", 
    formData,
    {
        headers: {
            "Authorization": "Bearer your_jwt_token",
            "Content-Type": "multipart/form-data"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/password-update`

### Description
This endpoint allows authenticated users to update their password. It requires the current password for verification before setting the new password.

### HTTP Method
`PUT`

### URL
`/user/password-update`

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### Request Body
The data should be sent as JSON with the following fields:

| Field         | Type     | Required | Description                              |
|---------------|----------|----------|------------------------------------------|
| `oldPassword` | `string` | Yes      | Current password for verification        |
| `newPassword` | `string` | Yes      | New password (min 4 characters)          |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Password updated successfully"
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Current password is incorrect
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Current password is incorrect"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during password update
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.put("https://online-shop-backend-qpnv.onrender.com/api/auth/user/password-update",
{
    oldPassword: "currentPassword123",
    newPassword: "newPassword123"
},
{
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/password-forgot`

### Description
This endpoint is used to initiate the password reset process by sending a reset link to the user's email.

### HTTP Method
`POST`

### URL
`/user/password-forgot`

### Request Headers
- `Content-Type: application/json`

### Request Body
The data should be sent as JSON with the following field:

| Field   | Type     | Required | Description           |
|---------|----------|----------|-----------------------|
| `email` | `string` | Yes      | User's email address |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Password reset link sent successfully"
  }
  ```

#### Error Responses
- **Status Code:** `404 Not Found`
  - **Reason:** User not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "User not found"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Email sending failed
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Email could not be sent"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.post("https://online-shop-backend-qpnv.onrender.com/api/auth/user/password-forgot", {
    email: "user@example.com"
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/user/password-reset/:token`

### Description
This endpoint is used to reset a user's password using a valid reset token. The token is received via email when using the forgot password endpoint.

### HTTP Method
`PUT`

### URL
`/user/password-reset/:token`

### Request Headers
- `Content-Type: application/json`

### URL Parameters
| Parameter | Type     | Description                          |
|-----------|----------|--------------------------------------|
| `token`   | `string` | Password reset token from email link |

### Request Body
The data should be sent as JSON with the following fields:

| Field             | Type     | Required | Description                                |
|-------------------|----------|----------|--------------------------------------------|
| `newPassword`     | `string` | Yes      | New password (min 4 characters)           |
| `confirmPassword` | `string` | Yes      | Must match newPassword                    |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Password reset successful"
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Invalid token, expired token, or passwords don't match
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Invalid or expired reset token"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during password reset
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.put(`https://online-shop-backend-qpnv.onrender.com/api/auth/user/password-reset/${resetToken}`, {
    newPassword: "newSecurePassword",
    confirmPassword: "newSecurePassword"
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/admin/users`

### Description
This endpoint allows administrators to retrieve a list of all users in the system. Only accessible by users with admin role.

### HTTP Method
`GET`

### URL
`/admin/users`

### Request Headers
- `Authorization: Bearer <token>`

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Get All User Successfully",
      "count": 10,
      "data": [
          {
              "_id": "user_id",
              "name": "User Name",
              "email": "user@example.com",
              "phone": "1234567890",
              "role": "user",
              "profileImage": "image_url",
              "createdAt": "2024-01-20T12:00:00.000Z"
          }
          // ... more users
      ]
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Role (user) is not authorized to access this route"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** No users found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "No users found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get("https://online-shop-backend-qpnv.onrender.com/api/auth/admin/users", {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/admin/users/:id`

### Description
This endpoint allows administrators to retrieve details of a specific user. Only accessible by users with admin role.

### HTTP Method
`GET`

### URL
`/admin/users/:id`

### Request Headers
- `Authorization: Bearer <token>`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the user to retrieve      |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "data": {
          "_id": "user_id",
          "name": "User Name",
          "email": "user@example.com",
          "phone": "1234567890",
          "role": "user",
          "profileImage": "image_url",
          "createdAt": "2024-01-20T12:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Role (user) is not authorized to access this route"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** User not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "User not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get(`https://online-shop-backend-qpnv.onrender.com/api/auth/admin/users/${userId}`, {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/admin/user/:id`

### Description
This endpoint allows administrators to delete a user account and their associated profile image. Only accessible by admin users.

### HTTP Method
`DELETE`

### URL
`/admin/user/:id`

### Request Headers
- `Authorization: Bearer <token>`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the user to be deleted    |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "User and profile image deleted successfully"
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Access denied. Admin only."
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** User not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "User not found"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during user deletion
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.delete(`https://online-shop-backend-qpnv.onrender.com/api/auth/admin/user/${userId}`, {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/product/create`

### Description
This endpoint allows administrators to create a new product with details including name, price, category, brand, stock, descriptions, FAQs, and multiple product images. Only accessible by users with admin role.

### HTTP Method
`POST`

### URL
`/product/create`

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

### Request Body
The data should be sent as multipart/form-data with the following fields:

| Field           | Type        | Required | Description                                    |
|----------------|-------------|----------|------------------------------------------------|
| `name`         | `string`    | Yes      | Product name                                  |
| `price`        | `number`    | Yes      | Product price                                 |
| `category`     | `string`    | Yes      | Product category                              |
| `brand`        | `string`    | Yes      | Product brand                                 |
| `stock`        | `number`    | Yes      | Available stock quantity                      |
| `description`  | `JSON`      | Yes      | Array of description objects (see format below)|
| `faqs`         | `JSON`      | Yes      | Array of FAQ objects (see format below)       |
| `productImages`| `file`      | Yes      | Up to 10 product images (JPG, JPEG, PNG)      |

### Description Object Format
```json
[
  {
    "title": "string",
    "points": ["string", "string"]
  }
]
```

### FAQ Object Format
```json
[
  {
    "question": "string",
    "answer": [
      {
        "title": "string",
        "points": ["string", "string"]
      }
    ]
  }
]
```

### Response

#### Success Response
- **Status Code:** `201 Created`
- **Response Body:**
  ```json
  {
      "success": true,
      "product": {
          "_id": "product_id",
          "name": "Product Name",
          "price": 999,
          "category": "Category",
          "brand": "Brand",
          "stock": 100,
          "description": [],
          "faqs": [],
          "productImages": [
              {
                  "url": "/uploads/products/image-filename.jpg",
                  "public_id": "image-filename"
              }
          ],
          "ratings": 0,
          "numReviews": 0,
          "status": "Active",
          "createdUser": "user_id",
          "createdAt": "2024-01-20T12:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Missing required fields or invalid data
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product images are required"
    }
    ```
    ```json
    {
        "success": false,
        "message": "Invalid JSON format in description or FAQs"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Role (user) is not authorized to access this route"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('price', '999');
formData.append('category', 'Category');
formData.append('brand', 'Brand');
formData.append('stock', '100');
formData.append('description', JSON.stringify([
    {
        title: "Description Title",
        points: ["Point 1", "Point 2"]
    }
]));
formData.append('faqs', JSON.stringify([
    {
        question: "FAQ Question?",
        answer: [{
            title: "Answer Title",
            points: ["Point 1", "Point 2"]
        }]
    }
]));

// Append product images
productImages.forEach(image => {
    formData.append('productImages', image);
});

axios.post('https://online-shop-backend-qpnv.onrender.com/api/product/create', 
    formData,
    {
        headers: {
            'Authorization': 'Bearer your_jwt_token',
            'Content-Type': 'multipart/form-data'
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: /product`

### Description
This endpoint allows retrieving all products in the system. No authentication is required to access this endpoint.

### HTTP Method
`GET`

### URL
`/product`

### Request Headers
None required

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "products": [
          {
              "_id": "product_id",
              "name": "Product Name",
              "price": 999,
              "category": "Category",
              "brand": "Brand",
              "stock": 100,
              "description": [
                  {
                      "title": "Description Title",
                      "points": ["Point 1", "Point 2"]
                  }
              ],
              "faqs": [
                  {
                      "question": "FAQ Question?",
                      "answer": [
                          {
                              "title": "Answer Title",
                              "points": ["Point 1", "Point 2"]
                          }
                      ]
                  }
              ],
              "productImages": [
                  {
                      "url": "/uploads/products/image-filename.jpg",
                      "public_id": "image-filename"
                  }
              ],
              "ratings": 0,
              "numReviews": 0,
              "status": "Active",
              "createdUser": {
                  "name": "Admin Name",
                  "email": "admin@example.com"
              },
              "createdAt": "2024-01-20T12:00:00.000Z"
          }
      ]
  }
  ```

#### Error Response
- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error while fetching products
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error",
        "error": "error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get('https://online-shop-backend-qpnv.onrender.com/api/product')
    .then(response => console.log(response.data))
    .catch(error => console.error(error.response.data));
```

## Endpoint: `/product/:id`

### Description
This endpoint allows retrieving details of a specific product by its ID. No authentication is required to access this endpoint.

### HTTP Method
`GET`

### URL
`/product/:id`

### Request Headers
None required

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to retrieve   |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "product": {
          "_id": "product_id",
          "name": "Product Name",
          "price": 999,
          "category": "Category",
          "brand": "Brand",
          "stock": 100,
          "description": [
              {
                  "title": "Description Title",
                  "points": ["Point 1", "Point 2"]
              }
          ],
          "faqs": [
              {
                  "question": "FAQ Question?",
                  "answer": [
                      {
                          "title": "Answer Title",
                          "points": ["Point 1", "Point 2"]
                      }
                  ]
              }
          ],
          "productImages": [
              {
                  "url": "/uploads/products/image-filename.jpg",
                  "public_id": "image-filename"
              }
          ],
          "ratings": 0,
          "numReviews": 0,
          "status": "Active",
          "createdUser": {
              "name": "Admin Name",
              "email": "admin@example.com"
          },
          "createdAt": "2024-01-20T12:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error while fetching product
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error",
        "error": "error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get(`https://online-shop-backend-qpnv.onrender.com/api/product/${productId}`)
    .then(response => console.log(response.data))
    .catch(error => console.error(error.response.data));
```

## Endpoint: `/product/:id` (Update)

### Description
This endpoint allows administrators to update an existing product's details. Only accessible by users with admin role.

### HTTP Method
`PUT`

### URL
`/product/:id`

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to update     |

### Request Body
The data should be sent as JSON. All fields are optional, but at least one must be provided:

| Field           | Type        | Required | Description                                    |
|----------------|-------------|----------|------------------------------------------------|
| `name`         | `string`    | No       | Product name                                   |
| `price`        | `number`    | No       | Product price                                  |
| `category`     | `string`    | No       | Product category                               |
| `brand`        | `string`    | No       | Product brand                                  |
| `stock`        | `number`    | No       | Available stock quantity                       |
| `description`  | `array`     | No       | Array of description objects (see format below)|
| `faqs`         | `array`     | No       | Array of FAQ objects (see format below)        |

### Description Object Format
```json
[
  {
    "title": "string",
    "points": ["string", "string"]
  }
]
```

### FAQ Object Format
```json
[
  {
    "question": "string",
    "answer": [
      {
        "title": "string",
        "points": ["string", "string"]
      }
    ]
  }
]
```

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "product": {
          "_id": "product_id",
          "name": "Updated Product Name",
          "price": 999,
          "category": "Updated Category",
          "brand": "Updated Brand",
          "stock": 100,
          "description": [],
          "faqs": [],
          "productImages": [
              {
                  "url": "/uploads/products/image-filename.jpg",
                  "public_id": "image-filename"
              }
          ],
          "ratings": 0,
          "numReviews": 0,
          "status": "Active",
          "createdUser": "user_id",
          "createdAt": "2024-01-20T12:00:00.000Z",
          "updatedAt": "2024-01-20T13:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Validation error or no fields to update
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "No valid fields to update"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Role (user) is not authorized to access this route"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.put(`https://online-shop-backend-qpnv.onrender.com/api/product/${productId}`,
    {
        name: "Updated Product Name",
        price: 999,
        stock: 100
    },
    {
        headers: {
            "Authorization": "Bearer your_jwt_token",
            "Content-Type": "application/json"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/product/:id/images`

### Description
This endpoint allows administrators to update product images. It supports multiple image uploads, replaces all existing images of the product, and validates file types and sizes.

### HTTP Method
`PUT`

### URL
`/product/:id/images`

### Request Headers
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to update     |

### Request Body
The data should be sent as form-data with the following field:

| Field           | Type     | Required | Description                                     |
|----------------|----------|----------|-------------------------------------------------|
| `productImages` | `file[]` | Yes      | Up to 10 image files (JPG, JPEG, PNG). Max size: 5MB each |

### Validations
- At least one image must be uploaded
- Each file size must not exceed 5MB
- Only JPG, JPEG, and PNG file types are allowed
- Maximum 10 images allowed
- Authentication token must be valid
- User must have admin role

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Product images updated successfully",
      "data": {
          "_id": "product_id",
          "productImages": [
              {
                  "url": "/uploads/products/image-filename.jpg",
                  "public_id": "image-filename"
              }
          ],
          // ... other product fields
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Cases:**
    - No images uploaded
    - Invalid file type
    - File size exceeds limit
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Please upload at least one image"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Role (user) is not authorized to access this route"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
const formData = new FormData();
productImages.forEach(image => {
    formData.append('productImages', image);
});

axios.put(`https://online-shop-backend-qpnv.onrender.com/api/product/${productId}/images`, 
    formData,
    {
        headers: {
            "Authorization": "Bearer your_jwt_token",
            "Content-Type": "multipart/form-data"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/product/:id` (Delete)

### Description
This endpoint allows administrators to delete a specific product. Only accessible by users with admin role.

### HTTP Method
`DELETE`

### URL
`/product/:id`

### Request Headers
- `Authorization: Bearer <token>`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to delete     |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Product deleted successfully"
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Role (user) is not authorized to access this route"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error during deletion
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error",
        "error": "error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.delete(`https://online-shop-backend-qpnv.onrender.com/api/product/${productId}`, {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/product/:id/review`

### Description
This endpoint allows authenticated users to add or update their review for a specific product. Users can provide a rating and comment for the product.

### HTTP Method
`POST`

### URL
`/product/:id/review`

### Request Headers
- `Authorization: Bearer <token>` (Required)
- `Content-Type: application/json`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to review     |

### Request Body
| Field     | Type     | Required | Description                              |
|-----------|----------|----------|------------------------------------------|
| `rating`  | `number` | Yes      | Rating value (1-5)                      |
| `comment` | `string` | Yes      | Review comment                          |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Review added successfully"
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Invalid rating value
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Please provide a rating between 1 and 5"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.post(`https://online-shop-backend-qpnv.onrender.com/api/product/${productId}/review`,
    {
        rating: 4,
        comment: "Great product! Would recommend."
    },
    {
        headers: {
            "Authorization": "Bearer your_jwt_token"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/product/:id/review` (Update)

### Description
This endpoint allows authenticated users to update their existing review for a product. Users can modify the rating and comment of their review.

### HTTP Method
`PUT`

### URL
`/product/:id/review`

### Request Headers
- `Authorization: Bearer <token>` (Required)
- `Content-Type: application/json`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to update review|

### Request Body
| Field     | Type     | Required | Description                              |
|-----------|----------|----------|------------------------------------------|
| `rating`  | `number` | Yes      | New rating value (1-5)                  |
| `comment` | `string` | Yes      | New review comment                      |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Review updated successfully"
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Reason:** Invalid rating value or no existing review found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Please provide a rating between 1 and 5"
    }
    ```
    ```json
    {
        "success": false,
        "message": "You haven't reviewed this product yet"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.put(`https://online-shop-backend-qpnv.onrender.com/api/product/${productId}/review`,
    {
        rating: 5,
        comment: "Updated review: Even better than I initially thought!"
    },
    {
        headers: {
            "Authorization": "Bearer your_jwt_token"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/product/:id/reviews`

### Description
This endpoint allows retrieving all reviews for a specific product along with reviewer details.

### HTTP Method
`GET`

### URL
`/product/:id/reviews`

### Request Headers
None required

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to get reviews|

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "reviews": [
          {
              "user": {
                  "_id": "user_id",
                  "name": "User Name",
                  "profileImage": "profile_image_url"
              },
              "rating": 4,
              "comment": "Great product!",
              "createdAt": "2024-01-20T12:00:00.000Z",
              "_id": "review_id"
          }
      ]
  }
  ```

#### Error Responses
- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error while fetching reviews
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Failed to fetch reviews",
        "error": "error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get(`https://online-shop-backend-qpnv.onrender.com/api/product/${productId}/reviews`)
    .then(response => console.log(response.data))
    .catch(error => console.error(error.response.data));
```

## Endpoint: `/cart/:id`

### Description
This endpoint allows authenticated users to add or update products in their shopping cart. When adding a product, users can specify the quantity. If the product already exists in the cart, its quantity will be updated.

### HTTP Method
`POST`

### URL
`/cart/:id`

### Request Headers
- `Authorization: Bearer <token>` (Required)
- `Content-Type: application/json`

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the product to add to cart|

### Request Body
| Field      | Type     | Required | Description                              |
|------------|----------|----------|------------------------------------------|
| `quantity` | `number` | No       | Quantity to add (default: 1, minimum: 1) |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Item added to cart",
      "cart": {
          "_id": "cart_id",
          "user": "user_id",
          "items": [
              {
                  "product": {
                      "_id": "product_id",
                      "name": "Product Name",
                      "price": 999,
                      "productImages": [
                          {
                              "url": "image_url",
                              "public_id": "image_id"
                          }
                      ]
                  },
                  "quantity": 2,
                  "_id": "cart_item_id"
              }
          ],
          "total": 1998
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Cases:**
    - Invalid quantity
    - Insufficient stock
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Please provide product ID and quantity should be at least 1"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.post(`https://online-shop-backend-qpnv.onrender.com/api/cart/${productId}`,
    {
        quantity: 2
    },
    {
        headers: {
            "Authorization": "Bearer your_jwt_token"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/cart`

### Description
This endpoint allows authenticated users to retrieve their shopping cart details, including all items and the total cart value.

### HTTP Method
`GET`

### URL
`/cart`

### Request Headers
- `Authorization: Bearer <token>` (Required)

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "cart": {
          "_id": "cart_id",
          "user": "user_id",
          "items": [
              {
                  "product": {
                      "_id": "product_id",
                      "name": "Product Name",
                      "price": 999,
                      "productImages": [
                          {
                              "url": "image_url",
                              "public_id": "image_id"
                          }
                      ]
                  },
                  "quantity": 2,
                  "_id": "cart_item_id"
              }
          ],
          "total": 1998,
          "createdAt": "2024-01-20T12:00:00.000Z",
          "updatedAt": "2024-01-20T13:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error while fetching cart
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get('https://online-shop-backend-qpnv.onrender.com/api/cart', {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/cart/update`

### Description
This endpoint allows authenticated users to update the quantity of a product in their cart or remove it if the quantity is set to 0.

### HTTP Method
`PUT`

### URL
`/cart/update`

### Request Headers
- `Authorization: Bearer <token>` (Required)
- `Content-Type: application/json`

### Request Body
| Field       | Type     | Required | Description                                    |
|-------------|----------|----------|------------------------------------------------|
| `productId` | `string` | Yes      | ID of the product in cart to update           |
| `quantity`  | `number` | Yes      | New quantity (0 to remove item, must be ≥ 0)  |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Cart updated successfully",
      "cart": {
          "_id": "cart_id",
          "user": "user_id",
          "items": [
              {
                  "product": {
                      "_id": "product_id",
                      "name": "Product Name",
                      "price": 999,
                      "productImages": [
                          {
                              "url": "image_url",
                              "public_id": "image_id"
                          }
                      ]
                  },
                  "quantity": 2,
                  "_id": "cart_item_id"
              }
          ],
          "total": 1998
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Cases:**
    - Invalid quantity
    - Insufficient stock
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Please provide product ID and valid quantity"
    }
    ```
    ```json
    {
        "success": false,
        "message": "Not enough stock available"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Cases:**
    - Cart not found
    - Item not found in cart
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Cart not found"
    }
    ```
    ```json
    {
        "success": false,
        "message": "Item not found in cart"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.put("https://online-shop-backend-qpnv.onrender.com/api/cart/update",
    {
        productId: "product_id",
        quantity: 2
    },
    {
        headers: {
            "Authorization": "Bearer your_jwt_token"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/cart/remove/:productId`

### Description
This endpoint allows authenticated users to remove a specific product from their shopping cart.

### HTTP Method
`DELETE`

### URL
`/cart/remove/:productId`

### Request Headers
- `Authorization: Bearer <token>` (Required)

### URL Parameters
| Parameter    | Type     | Description                          |
|-------------|----------|--------------------------------------|
| `productId` | `string` | ID of the product to remove from cart|

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Item removed from cart",
      "cart": {
          "_id": "cart_id",
          "user": "user_id",
          "items": [
              {
                  "product": {
                      "_id": "product_id",
                      "name": "Product Name",
                      "price": 999,
                      "productImages": [
                          {
                              "url": "image_url",
                              "public_id": "image_id"
                          }
                      ]
                  },
                  "quantity": 2,
                  "_id": "cart_item_id"
              }
          ],
          "total": 1998
      }
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Cart not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Cart not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.delete(`https://online-shop-backend-qpnv.onrender.com/api/cart/remove/${productId}`, {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/cart/clear`

### Description
This endpoint allows authenticated users to remove all items from their shopping cart.

### HTTP Method
`DELETE`

### URL
`/cart/clear`

### Request Headers
- `Authorization: Bearer <token>` (Required)

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "message": "Cart cleared successfully",
      "cart": {
          "_id": "cart_id",
          "user": "user_id",
          "items": [],
          "total": 0
      }
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Cart not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Cart not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.delete("https://online-shop-backend-qpnv.onrender.com/api/cart/clear", {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/order/create`

### Description
This endpoint allows authenticated users to create a new order. It processes the order items, verifies stock availability, calculates the total amount, updates product stock, and clears the user's cart upon successful order creation.

### HTTP Method
`POST`

### URL
`/order/create`

### Request Headers
- `Authorization: Bearer <token>` (Required)
- `Content-Type: application/json`

### Request Body
The data should be sent as JSON with the following fields:

| Field              | Type     | Required | Description                              |
|-------------------|----------|----------|------------------------------------------|
| `items`           | `array`  | Yes      | Array of order items                     |
| `shippingAddress` | `object` | Yes      | Shipping address details                 |
| `paymentInfo`     | `object` | Yes      | Payment information                      |

#### items Array Structure
```json
"items": [
    {
        "product": "product_id",
        "quantity": 2
    }
]
```

#### shippingAddress Object Structure
```json
"shippingAddress": {
    "street": "123 Main St",
    "city": "Cityville",
    "state": "State",
    "pinCode": "123456",
    "phone": "1234567890"
}
```

#### paymentInfo Object Structure
```json
"paymentInfo": {
    "id": "payment_id",
    "status": "success",
    "type": "card"
}
```

### Response

#### Success Response
- **Status Code:** `201 Created`
- **Response Body:**
  ```json
  {
      "success": true,
      "order": {
          "_id": "order_id",
          "user": "user_id",
          "items": [
              {
                  "product": "product_id",
                  "name": "Product Name",
                  "quantity": 2,
                  "price": 999
              }
          ],
          "shippingAddress": {
              "street": "123 Main St",
              "city": "Cityville",
              "state": "State",
              "pinCode": "123456",
              "phone": "1234567890"
          },
          "totalAmount": 1998,
          "paymentInfo": {
              "id": "payment_id",
              "status": "success",
              "type": "card"
          },
          "status": "pending",
          "paidAt": "2024-01-20T12:00:00.000Z",
          "createdAt": "2024-01-20T12:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `400 Bad Request`
  - **Cases:**
    - Validation error
    - Insufficient stock
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Insufficient stock for Product Name"
    }
    ```

- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Product not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Product not found: product_id"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.post("https://online-shop-backend-qpnv.onrender.com/api/order/create",
    {
        items: [
            {
                product: "product_id",
                quantity: 2
            }
        ],
        shippingAddress: {
            street: "123 Main St",
            city: "Cityville",
            state: "State",
            pinCode: "123456",
            phone: "1234567890"
        },
        paymentInfo: {
            id: "payment_id",
            status: "success",
            type: "card"
        }
    },
    {
        headers: {
            "Authorization": "Bearer your_jwt_token"
        }
    }
)
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/order/me`

### Description
This endpoint allows authenticated users to retrieve all their orders. The orders are sorted by creation date with the most recent orders appearing first.

### HTTP Method
`GET`

### URL
`/order/me`

### Request Headers
- `Authorization: Bearer <token>` (Required)

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "orders": [
          {
              "_id": "order_id",
              "user": "user_id",
              "items": [
                  {
                      "product": "product_id",
                      "name": "Product Name",
                      "quantity": 2,
                      "price": 999
                  }
              ],
              "shippingAddress": {
                  "street": "123 Main St",
                  "city": "Cityville",
                  "state": "State",
                  "pinCode": "123456",
                  "phone": "1234567890"
              },
              "totalAmount": 1998,
              "paymentInfo": {
                  "id": "payment_id",
                  "status": "success",
                  "type": "card"
              },
              "status": "pending",
              "paidAt": "2024-01-20T12:00:00.000Z",
              "createdAt": "2024-01-20T12:00:00.000Z"
          }
          // ... more orders
      ]
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error while fetching orders
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get("https://online-shop-backend-qpnv.onrender.com/api/order/me", {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```


## Endpoint: `/order/:id`

### Description
This endpoint allows authenticated users to retrieve details of a specific order. The response includes the order details along with the user information.

### HTTP Method
`GET`

### URL
`/order/:id`

### Request Headers
- `Authorization: Bearer <token>` (Required)

### URL Parameters
| Parameter | Type     | Description                     |
|-----------|----------|---------------------------------|
| `id`      | `string` | ID of the order to retrieve     |

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "order": {
          "_id": "order_id",
          "user": {
              "_id": "user_id",
              "name": "User Name",
              "email": "user@example.com"
          },
          "items": [
              {
                  "product": "product_id",
                  "name": "Product Name",
                  "quantity": 2,
                  "price": 999
              }
          ],
          "shippingAddress": {
              "street": "123 Main St",
              "city": "Cityville",
              "state": "State",
              "pinCode": "123456",
              "phone": "1234567890"
          },
          "totalAmount": 1998,
          "paymentInfo": {
              "id": "payment_id",
              "status": "success",
              "type": "card"
          },
          "status": "pending",
          "paidAt": "2024-01-20T12:00:00.000Z",
          "createdAt": "2024-01-20T12:00:00.000Z"
      }
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `404 Not Found`
  - **Reason:** Order not found
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Order not found"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get(`https://online-shop-backend-qpnv.onrender.com/api/order/${orderId}`, {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```

## Endpoint: `/order/admin/orders`

### Description
This endpoint allows administrators to retrieve all orders in the system. It provides a list of all orders along with the total amount across all orders. Only accessible by users with admin role.

### HTTP Method
`GET`

### URL
`/order/admin/orders`

### Request Headers
- `Authorization: Bearer <token>` (Required)

### Response

#### Success Response
- **Status Code:** `200 OK`
- **Response Body:**
  ```json
  {
      "success": true,
      "totalAmount": 5994,
      "orders": [
          {
              "_id": "order_id",
              "user": {
                  "_id": "user_id",
                  "name": "User Name",
                  "email": "user@example.com"
              },
              "items": [
                  {
                      "product": "product_id",
                      "name": "Product Name",
                      "quantity": 2,
                      "price": 999
                  }
              ],
              "shippingAddress": {
                  "street": "123 Main St",
                  "city": "Cityville",
                  "state": "State",
                  "pinCode": "123456",
                  "phone": "1234567890"
              },
              "totalAmount": 1998,
              "paymentInfo": {
                  "id": "payment_id",
                  "status": "success",
                  "type": "card"
              },
              "status": "pending",
              "paidAt": "2024-01-20T12:00:00.000Z",
              "createdAt": "2024-01-20T12:00:00.000Z"
          }
          // ... more orders
      ]
  }
  ```

#### Error Responses
- **Status Code:** `401 Unauthorized`
  - **Reason:** No token provided or invalid token
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Not authorized, authentication failed"
    }
    ```

- **Status Code:** `403 Forbidden`
  - **Reason:** User is not an admin
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Role (user) is not authorized to access this route"
    }
    ```

- **Status Code:** `500 Internal Server Error`
  - **Reason:** Server error while fetching orders
  - **Example Response:**
    ```json
    {
        "success": false,
        "message": "Server Error: error_message"
    }
    ```

### Example Usage
#### JavaScript (Axios)
```javascript
axios.get("https://online-shop-backend-qpnv.onrender.com/api/order/admin/orders", {
    headers: {
        "Authorization": "Bearer your_jwt_token"
    }
})
.then(response => console.log(response.data))
.catch(error => console.error(error.response.data));
```
