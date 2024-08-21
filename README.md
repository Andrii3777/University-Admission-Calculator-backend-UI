# University Admission Calculator

## Project Description:

Develop a university admission calculator. When a student enters their exam scores, the system determines if they qualify for free enrollment. If not, it calculates the cost of tuition for the cheapest program.

## Technical requirements:

- Programming language - **Javascript**
- Framework - **Express.js**
- Frontend - **ejs, CSS**
- Database - **MySQL**
- **Docker**

## Environment Variables

The application requires the following environment variables to be set. These can be defined in a `.env` file at the root of your project.
The **default** values provided below are configured for running the application in **Docker**.

### Application Configuration

- `APP_PORT` (default: `3000`): The port on which the application will run.
- `API_BASE_PATH` (default: `/api/v1`): The base path for the API endpoints.

### Security Configuration

- `SECRET_KEY` (default: `my_secret_key`): A secret key used for various security purposes in the application.

### JWT Configuration

- `JWT_ACCESS_SECRET` (default: `my_jwt_access_secret_key`): The secret key used to sign access tokens.
- `JWT_REFRESH_SECRET` (default: `my_jwt_refresh_secret_key`): The secret key used to sign refresh tokens.
- `ACCESS_TOKEN_AGE_SECONDS` (default: `15`): The lifespan of an access token in seconds.
- `REFRESH_TOKEN_AGE_SECONDS` (default: `30`): The lifespan of a refresh token in seconds.

### MySQL Configuration

- `MYSQL_ROOT_PASSWORD` (default: `pass`): The password for the MySQL root user.
- `MYSQL_DATABASE` (default: `university_admission`): The name of the MySQL database to be used.
- `MYSQL_HOST` (default: `mysql_university_admission`): The hostname of the MySQL server.
- `MYSQL_PORT` (default: `3306`): The port on which the MySQL server is running.
- `MYSQL_USERNAME` (default: `user`): The username to connect to the MySQL database.
- `MYSQL_PASSWORD` (default: `user`): The password to connect to the MySQL database.

### Example `.env` File

An example `.env.example` file is provided at the root of the project. You can copy the contents of this file to create your own `.env` file.

## Database

Database for **University Admission Calculator** includes next tables:

![database](https://github.com/user-attachments/assets/2498073c-b028-42bd-9a89-5346b5f5b54a)

### 1. student

The student table stores information about the students. It includes the following fields:

- `id`: An integer that serves as the primary key and is auto-incremented.
- `email`: A string that stores the student's email - address, which must be unique and not null.
- `password`: A string that stores the student's password, which is also not null.

### 2. refreshToken

The refreshToken table stores refresh tokens associated with students. It includes the following fields:

- `id`: An integer that serves as the primary key and is auto-incremented.
- `token`: A string that stores the refresh token, which is not null.
- `studentId`: An integer that references the id field in the student table.

### 3. exam

The exam table stores information about different exams. It includes the following fields:

- `id`: An integer that serves as the primary key and is auto-incremented.
- `name`: A string that stores the name of the exam, which is not null.

### 4. studentExam

The studentExam table stores the scores of students for various exams. It includes the following fields:

- `studentId`: An integer that references the id field in the student table.
- `examId`: An integer that references the id field in the exam table.
- `score`: An integer that stores the score of the student in the exam.

### 5. specialty

The specialty table stores information about different specialties offered. It includes the following fields:

- `id`: An integer that serves as the primary key and is auto-incremented.
- `name`: A string that stores the name of the specialty, which is not null.
- `tuitionCost`: A decimal value that stores the tuition cost for the specialty.
- `passingScoreForFree`: A decimal value that stores the minimum score required for free enrollment.
- `passingScoreForPaid`: A decimal value that stores the minimum score required for paid enrollment.

### 6. specialtyExamCoefficient

The specialtyExamCoefficient table stores the coefficients for exams for each specialty. It includes the following fields:

- `specialtyId`: An integer that references the id field in the specialty table.
- `examId`: An integer that references the id field in the exam table.
- `coefficient`: A decimal value that stores the coefficient of the exam for the specialty.

## Initial Database Data

The database is initially populated with the following data:

### 1. exam

Contains names of various exams:

- Mathematics
- Physics
- Chemistry
- Biology

### 2. specialty

Includes various specialties with their tuition costs and passing scores for free and paid enrollment. For example:
Computer Science (example):

- `tuitionCost`: 3000.00
- `passingScoreForFree`: 280.00
- `passingScoreForPaid`: 180.00

### 3. specialtyExamCoefficient

Maps coefficients of exams for each specialty. For example:
Computer Science (example):

- Mathematics: 1.5
- Physics: 1.3
- Chemistry: 1.2
- Biology: 1.1

#### **Note**: The example shown is for "Computer Science". Similar data is populated for all other specialties and exams.

#### The application includes SQL scripts to create and populate the database tables. These scripts are located in the src/sql/scripts directory:

- `src/sql/scripts/createTables.sql`: This file contains the SQL commands to create the necessary tables in the database.
- `src/sql/scripts/fillTables.sql`: This file contains the SQL commands to populate the created tables with initial data.

## Base URL

`http://localhost:3000`

## API Endpoints

### 1. Home Page

**Endpoint:**
GET `api/v1/`

**Response:**

- Renders home view.

![homePage](https://github.com/user-attachments/assets/8275ba1b-7102-4c59-8de9-79b8d7703e60)

### 2. Signup Page

**Endpoint:**
GET `api/v1/signup`

**Response:**

- Renders signup view.

![signupPage](https://github.com/user-attachments/assets/f071f1d9-d803-42c4-bef0-c5f0149d36dd)

### 3. Login Page

**Endpoint:**
GET `api/v1/login`

**Response:**

- Renders login view.

![loginPage](https://github.com/user-attachments/assets/f83681bb-f61c-45c6-9689-d7db92e4ad89)

### 4. Calculator Page

**Endpoint:**
GET `api/v1/calculator`

**Response:**

- Renders calculator view.

![calculatorPage](https://github.com/user-attachments/assets/203df161-b6a9-4bf8-ac5c-0713e17d309f)

### 5. Signup

**Endpoint:**
POST `api/v1/signup`

- Creates a new student account.

**Request Body:**

```json
{
  "email": "user@gamil.com",
  "password": "Aa1234"
}
```

**Responses:**

- **201 Created:**
  ```json
  {
    "message": "Student signed up successfully",
    "accessToken": "<accessToken>"
  }
  ```
- **400 Bad Request:**
  ```json
  {
    "error": "That email is already in use",
    "path": "email"
  }
  ```
  ```json
  {
    "error": "<emailValidation>",
    "path": "email"
  }
  ```
  ```json
  {
    "error": "<passwordValidation>",
    "path": "password"
  }
  ```

  ![signup](https://github.com/user-attachments/assets/65c7645c-8c91-41a8-9de4-a1c2645b8467)

### 6. Login

**Endpoint:**
POST `api/v1/login`

- Authenticates a student and returns an access token.

**Request Body:**

```json
{
  "email": "user@gamil.com",
  "password": "Aa1234"
}
```

**Responses:**

- **200 OK:**
  ```json
  {
    "message": "Student logged in successfully",
    "accessToken": "<accessToken>"
  }
  ```
- **401 Unauthorized:**
  ```json
  {
    "error": "No such email exists",
    "path": "email"
  }
  ```
  ```json
  {
    "error": "Password is incorrect",
    "path": "password"
  }
  ```

  ![login](https://github.com/user-attachments/assets/849d68a8-36d0-4b46-90d3-61f18974630d)

### 7. Logout

**Endpoint:**
GET `api/v1/logout`

- Logs out the student and clears the tokens.

**Responses:**

- Redirects to the home page.

![logout](https://github.com/user-attachments/assets/c4a8b0ec-0fc6-4f99-aefd-affa601d53b4)

### 8. Enroll

**Endpoint:**
POST `api/v1/enroll`

- Calculates list of specialties for students based on their scores.

**Request Body:**

```json
{
  "scores": {
    "Mathematics": 90,
    "Physics": 12,
    "Chemistry": 12,
    "Biology": 86
  }
}
```

**Responses:**

- **200 OK:**

  ```json
  {
    "message": "List of specialties defined successfully",
    "type": "free",
    "specialties": [
      {
        "id": 9,
        "name": "Biomedical Engineering",
        "tuitionCost": 3200,
        "passingScoreForFree": 280,
        "passingScoreForPaid": 190,
        "coefficients": {
          "1": 1.5,
          "2": 1.4,
          "3": 1.4,
          "4": 1.3
        },
        "totalScore": "280.4",
        "calculationDetails": "90 * 1.5 + 12 * 1.4 + 12 * 1.4 + 86 * 1.3",
        "requiredScore": 280
      }
    ]
  }
  ```

  ![calculate](https://github.com/user-attachments/assets/148e7c44-aff4-4a58-bcdd-c6da38a0a7b7)

  ![enroll](https://github.com/user-attachments/assets/c33dcd34-7ea3-4077-9b36-988737f206eb)

### 9. Get Student Scores

**Endpoint:**
GET `api/v1/getStudentScores`

- Retrieves the student's scores.

**Responses:**

- **200 OK:**

  ```json
  {
    "scores": {
      "Mathematics": 90,
      "Physics": 12,
      "Chemistry": 12,
      "Biology": 86
    }
  }
  ```

  ![studentsScores](https://github.com/user-attachments/assets/53f365f3-f434-4607-866b-ad3489330c09)

  ![getSrudentsScores](https://github.com/user-attachments/assets/8cec1249-7258-41c2-877c-0e394997e025)

## Authentication

The application uses **JSON Web Tokens** (JWT) for authentication. JWT is a compact, URL-safe means of representing claims to be transferred between two parties. It allows the application to verify the identity of users and provide secure access to protected resources.

### JWT Tokens

The application uses two types of JWT tokens:

- `Access Token`: This token is used to access protected routes and resources. It has a short expiration time for security purposes.
- `Refresh Token`: This token is used to obtain a new access token when the current access token expires. It has a longer expiration time.

### Storage of Tokens

- `Access Token`: The access token is stored in an HTTP-only cookie for enhanced security.
- `Refresh Token`: The refresh token is also stored in an HTTP-only cookie and in the database in the refreshToken table for verification purposes.

![cookies](https://github.com/user-attachments/assets/b65c0f03-f6a7-46bc-8f34-215c5a3bad7d)

### Token Flow

1. **User Signup/Login**: Upon successful signup or login, the server generates an access token and a refresh token. Both tokens are sent to the client in the response as HTTP-only cookies. The refresh stored in the refreshToken table in the database on server side.
2. **Accessing Protected Routes**: When the client makes a request to a protected route, the requireAuth middleware checks for the presence and validity of the access token in the cookies.
3. Refreshing Tokens: If the access token is expired or invalid, the requireAuth middleware automatically calls the refresh method to obtain new tokens. If the refresh token is also invalid, the user is redirected to the **login page**.

## Middlewares

### Authentication Middleware: `requireAuth`

This middleware ensures that requests to protected routes are authenticated. It checks for the presence and validity of the access token in the cookies. If the access token is missing or invalid, it attempts to refresh the token using the refresh method.

### Usage:

The requireAuth middleware is used to protect the following routes:

- GET `/api/v1/calculator`
- POST `/api/v1/enroll`
- GET `/api/v1/getStudentScores`

Error Responses:

- **401 Unauthorized (No token)**:
If the access token is missing, the middleware calls the refresh method.
- **401 Unauthorized (Invalid token)**:
If the access token is invalid, the middleware calls the refresh method.

### Refresh method
The refresh method is responsible for generating new access and refresh tokens using the provided refresh token stored in cookies. This method ensures that the user remains authenticated even after the access token has expired.

**How It Works**
- **Check for Refresh Token**: The method first checks if a refresh token is present in the cookies. If not, it redirects the user to the login page.
- **Validate Refresh Token**: The method validates the refresh token using the tokenService.
- **Generate New Tokens**: If the refresh token is valid, the method generates new access and refresh tokens.
- **Set Cookies**: The new tokens are set in the HTTP-only cookies for security.
- **Continue to the Next Middleware**: If the tokens are successfully refreshed, the request continues to the next middleware.
- **Handle Errors**: If there is an error during the refresh process, such as an invalid refresh token, the user is redirected to the login page.

### Middleware: `checkUser`

The checkUser middleware sets the user's email in the res.locals object for use in rendering views.If the email is not set, a logout button will be displayed.

**How It Works**
- **Check for Tokens**: The method first checks if access and refresh tokens are present in the cookies.
- **Validate Tokens**: The method validates both tokens using the tokenService.
Set Email in Response Locals: If the tokens are valid, the email is set in res.locals.email.
- **Continue to the Next Middleware**: The request proceeds to the next middleware.
- **Handle Errors**: If there is an error, the email is set to null.

## Server-Side Rendering and Styling
This application uses EJS for server-side rendering of HTML pages and CSS for styling. This allows for dynamic and interactive web pages that are rendered on the server and sent to the client for display.

## Running the app with DOCKER

```bash
# create .env file and define all environment variables

# run the docker containers
$ docker-compose up -d

# run the docker containers and rebuild images if they have changed
$ docker-compose up -d --build
```

## Running the app (without DOCKER)

### Installation first time only!

```bash
# create .env file and define all environment variables

# install the dependencies
$ npm install

# start the application
$ npm start
```

## Test

```bash
# unit tests
$ npm test
```

## Shutdown

```bash
# stop the app in the terminal where it is running
$ CTRL + C

# stop the docker containers and all unnecessary volumes
$ docker-compose down -v
```
