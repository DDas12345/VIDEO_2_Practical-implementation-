const http = require("node:http");

// Initial student data
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

// Function to send HTTP responses
function sendResponse(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });

    res.end(JSON.stringify(data));
}

// Function to read request body
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

// Create HTTP server
const server = http.createServer(async (req, res) => {

    const url = new URL(req.url, "http://localhost");
    const method = req.method;

    // GET: Fetch all students
    if (method === "GET" && url.pathname === "/students") {
        return sendResponse(res, 200, students);
    }

    // POST: Add a new student
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

    // Find student by ID
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

        // PUT: Replace student details
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

        // PATCH: Update selected student details
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

        // DELETE: Remove a student
        if (method === "DELETE") {
            const deletedStudent = students.splice(index, 1)[0];

            return sendResponse(res, 200, {
                message: "Student deleted successfully",
                student: deletedStudent
            });
        }
    }

    // Handle unknown routes
    return sendResponse(res, 404, {
        message: "Route not found"
    });

});

// Start server
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});