# Department-Employee-Tracker

A web application for managing information about departments and employees in an organization. This application uses a MongoDB database to store and retrieve information, and uses Handlebars templates to render the user interface in the web browser. The application uses RESTful API design principles to enable CRUD (create, read, update, delete) operations on department and employee records.

<img width="1439" alt="Screen Shot 2022-12-10 at 6 34 04 PM" src="https://user-images.githubusercontent.com/58542001/206879478-be20ecb4-306b-4ecf-a0ff-bb434fc2e643.png">

## Requirements
- Node.js
- MongoDB
- Express-Handlebars

## Installation

1. Clone the repository:
- $ git clone git@github.com:Akeel14/Department-Employee-Tracker.git

2. Install dependencies:
- $ npm install


3. Create a `.env` file and add your MongoDB database credentials:
- DB_HOST=<your_database_host>
- DB_USER=<your_database_user>
- DB_PASS=<your_database_password>


4. Initialize the database by running the `db-init.js` script:
- $ node db-init.js


5. Start the application by running the `app.js` script:
- $ node app.js
This will start the web server and launch the application in your default web browser.

## Usage

To use the "Department-Employee-Tracker" application, you will need to create an account. This can be done by clicking the "Create Account" link on the login page. Once you have created an account, you can log in and access the application's features and functionality.

As a manager, you can use the "Create Employee" and "Create Department" forms to add new employees and departments to the database. You can also use the "Update Employee" and "Update Department" forms to modify existing records. To delete a record
