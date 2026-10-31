# Student Management API using Node.js

## 1. Project Overview

This project demonstrates how HTTP methods work using Node.js and Postman.

We have created a simple Student Management API that allows users to retrieve, create, update, and delete student records.

The project uses Node.js's built-in HTTP module to create a server and handle HTTP requests and responses.

## 2. Technologies Used

- **Node.js:** Used to create the HTTP server.
- **JavaScript:** Used to implement the server-side logic.
- **HTTP:** Used for communication between the client and server.
- **Postman:** Used to test different HTTP methods.
- **Git and GitHub:** Used for version control and sharing the project.

## 3. Project Structure

```text
HTTP-Methods-Demo/
│
├── server.js
└── README.md
```

- `server.js`: Contains the complete Node.js server implementation.
- `README.md`: Contains project documentation and explanations.

## 4. Code Explanation

### Step 1: Importing the HTTP Module

```javascript
const http = require("node:http");
```

We import Node.js's built-in HTTP module using the `require()` function.

This module allows us to create an HTTP server and handle incoming requests and outgoing responses.

Since it is a built-in module, no separate installation is required.

### Step 2: Creating the Students Array

```javascript
let students = [
    {
        id: 1,
        name: "Aarav",
        email: "aarav@gmail.com"
    },
    {
        id: 2,
        name: "Priya",
        email: "priya@gmail.com"
    }
];
```

We create an array named `students` containing two initial student records.

Each student has three properties:

- `id`: Unique student identification number.
- `name`: Student's name.
- `email`: Student's email address.

We use `let` because the array will be modified when students are added, updated, or deleted.

### Step 3: Creating the sendResponse() Function

```javascript
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}
```

This function is responsible for sending HTTP responses to the client.

It accepts three parameters:

- `res`: The HTTP response object.
- `statusCode`: The HTTP status code.
- `data`: The information to be returned.

**Important methods:**

- `res.writeHead()` sets the status code and response headers.
- `JSON.stringify()` converts JavaScript data into a JSON string.
- `res.end()` sends the response and ends the response cycle.

The `Content-Type: application/json` header indicates that the response contains JSON data.

### Step 4: Creating the getBody() Function

```javascript
function getBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", (error) => {
            reject(error);
        });
    });
}
```

This function reads the data sent by the client in the HTTP request body.

It is particularly useful for POST, PUT, and PATCH requests.

**How it works:**

1. A Promise is created to handle the asynchronous request body.
2. The `data` event receives incoming data chunks.
3. These chunks are combined into the `body` variable.
4. The `end` event indicates that the request body has been completely received.
5. `JSON.parse()` converts the JSON string into a JavaScript object.
6. If parsing fails or a request error occurs, the Promise is rejected.

### Step 5: Creating the HTTP Server

```javascript
const server = http.createServer(async (req, res) => {

    const url = new URL(req.url, "http://localhost");
    const method = req.method;

});
```

The `http.createServer()` method creates our HTTP server.

It accepts two important parameters:

- `req`: Represents the incoming HTTP request.
- `res`: Represents the outgoing HTTP response.

We use the `async` keyword because some operations, such as reading the request body, are asynchronous.

We also extract:

- `url`: The requested URL.
- `method`: The HTTP method used by the client.

### Step 6: Implementing the GET Method

```javascript
if (method === "GET" && url.pathname === "/students") {
    return sendResponse(res, 200, students);
}
```

The GET method retrieves existing student records from the server.

When the client sends a GET request to `/students`, the server returns the complete students array.

**Status Code:** `200 OK`

This indicates that the request was successfully processed.

### Step 7: Implementing the POST Method

```javascript
if (method === "POST" && url.pathname === "/students") {
    try {
        const body = await getBody(req);

        if (!body.name || !body.email) {
            return sendResponse(res, 400, {
                message: "Name and email are required"
            });
        }

        const newStudent = {
            id: Math.max(0, ...students.map(s => s.id)) + 1,
            name: body.name,
            email: body.email
        };

        students.push(newStudent);

        return sendResponse(res, 201, newStudent);

    } catch (error) {
        return sendResponse(res, 400, {
            message: "Invalid JSON"
        });
    }
}
```

The POST method creates a new student record.

**How it works:**

1. `getBody(req)` reads the information sent by the client.
2. The server checks whether the name and email are provided.
3. A new student object is created.
4. A new ID is generated using the existing student IDs.
5. `students.push()` adds the new student to the array.
6. The server returns the newly created student.

**Status Codes:**

- `201 Created`: Student successfully created.
- `400 Bad Request`: Required information is missing or the JSON is invalid.

### Step 8: Finding a Student by ID

```javascript
const match = url.pathname.match(/^\/students\/(\d+)$/);

if (match) {
    const id = Number(match[1]);

    const index = students.findIndex(
        student => student.id === id
    );

    if (index === -1) {
        return sendResponse(res, 404, {
            message: "Student not found"
        });
    }
}
```

This section identifies a student using their ID.

For example, when the client accesses `/students/1`, the regular expression extracts the ID from the URL.

`Number()` converts the extracted ID into a number.

`findIndex()` searches the students array and returns the index of the matching student.

If no student is found, the server returns:

**Status Code:** `404 Not Found`

### Step 9: Implementing the PUT Method

```javascript
if (method === "PUT") {
    try {
        const body = await getBody(req);

        if (!body.name || !body.email) {
            return sendResponse(res, 400, {
                message: "Name and email are required"
            });
        }

        students[index] = {
            id: id,
            name: body.name,
            email: body.email
        };

        return sendResponse(res, 200, students[index]);

    } catch (error) {
        return sendResponse(res, 400, {
            message: "Invalid JSON"
        });
    }
}
```

The PUT method replaces the existing student information.

The client provides the complete updated student details, including name and email.

The server replaces the existing array entry with the new student object.

**Status Code:** `200 OK`

### Step 10: Implementing the PATCH Method

```javascript
if (method === "PATCH") {
    try {
        const body = await getBody(req);

        const allowedFields = ["name", "email"];

        const isValid = Object.keys(body).every(
            key => allowedFields.includes(key)
        );

        if (!isValid || Object.keys(body).length === 0) {
            return sendResponse(res, 400, {
                message: "Invalid fields"
            });
        }

        students[index] = {
            ...students[index],
            ...body,
            id: id
        };

        return sendResponse(res, 200, students[index]);

    } catch (error) {
        return sendResponse(res, 400, {
            message: "Invalid JSON"
        });
    }
}
```

The PATCH method updates specific fields of an existing student record.

Unlike PUT, PATCH does not require the complete student information.

**How it works:**

1. The server reads the request body.
2. It checks that only the allowed fields (`name` and `email`) are provided.
3. The spread operator (`...`) combines the existing student data with the updated information.
4. The student ID is preserved.
5. The updated student object is returned.

**Status Code:** `200 OK`

### Step 11: Implementing the DELETE Method

```javascript
if (method === "DELETE") {
    const deletedStudent = students.splice(index, 1)[0];

    return sendResponse(res, 200, {
        message: "Student deleted successfully",
        student: deletedStudent
    });
}
```

The DELETE method removes an existing student record.

`splice()` removes the selected student from the array.

The deleted student information is returned along with a success message.

**Status Code:** `200 OK`

### Step 12: Handling Unknown Routes

```javascript
return sendResponse(res, 404, {
    message: "Route not found"
});
```

If the client sends a request to an endpoint that is not supported by our application, the server returns a `404 Not Found` response.

### Step 13: Starting the Server

```javascript
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
```

The `server.listen()` method starts the HTTP server on port `3000`.

Once the server starts successfully, a message is displayed in the terminal.

## 5. API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/students` | Retrieve all students |
| POST | `/students` | Create a new student |
| PUT | `/students/:id` | Replace student details |
| PATCH | `/students/:id` | Update selected student fields |
| DELETE | `/students/:id` | Delete a student |

## 6. Testing with Postman

The API can be tested using Postman.

**Base URL:**

```text
http://localhost:3000
```

### GET Request

```text
GET http://localhost:3000/students
```

Retrieves all student records.

Expected status: `200 OK`

### POST Request

```text
POST http://localhost:3000/students
```

Request body:

```json
{
    "name": "Debanshika",
    "email": "deban@gmail.com"
}
```

Creates a new student record.

Expected status: `201 Created`

### PUT Request

```text
PUT http://localhost:3000/students/1
```

Request body:

```json
{
    "name": "Aarav Sharma",
    "email": "aarav.sharma@gmail.com"
}
```

Replaces the existing details of student ID 1.

Expected status: `200 OK`

### PATCH Request

```text
PATCH http://localhost:3000/students/2
```

Request body:

```json
{
    "email": "priya.updated@gmail.com"
}
```

Updates only the email address of student ID 2.

Expected status: `200 OK`

### DELETE Request

```text
DELETE http://localhost:3000/students/1
```

Deletes student ID 1.

Expected status: `200 OK`

## 7. How to Run the Project

### Step 1: Clone the repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
```

### Step 2: Navigate into the project folder

```bash
cd HTTP-Methods-Demo
```

### Step 3: Start the server

```bash
node server.js
```

### Step 4: Open Postman

Use the base URL:

```text
http://localhost:3000
```

Now you can test all five HTTP methods.

## 8. Important Note

This project uses a JavaScript array to store student records in memory.

It does not use a permanent database such as PostgreSQL or MongoDB.

Therefore, changes made through POST, PUT, PATCH, and DELETE are temporary and will reset when the server restarts.

## 9. Learning Outcomes

Through this project, we learn:

- How to create an HTTP server using Node.js.
- How client-server communication works.
- How to handle HTTP requests and responses.
- How to implement GET, POST, PUT, PATCH, and DELETE methods.
- How to use HTTP status codes.
- How to test APIs using Postman.
- How to use Git and GitHub to share a project.

---

**Project:** Student Management API using Node.js  
**Purpose:** Understanding HTTP methods through practical implementation.
