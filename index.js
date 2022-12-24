var path = require("path");
var express = require("express");
var dataService = require("./data-service.js");
var dataServiceAuth = require("./data-service-auth.js");
var clientSessions = require("client-sessions");
const exphbs = require('express-handlebars');
var app = express();
const fs = require("fs");
const multer = require("multer");
const imagePath = "/public/images/uploaded";
const dotenv = require('dotenv');
dotenv.config();


var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

app.engine('.hbs', exphbs.engine({
    extname: ".hbs",
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine', '.hbs');

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: process.env.DB_SECRET, // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
   

app.get("/", function (req, res) {
    res.redirect('/about');
});

app.get("/about", function (req, res) {
    res.render('about');
});

// ********************IMAGES ROUTES***********************************
app.get("/images/add", ensureLogin, function (req, res) {
    res.render("addImage");
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), function (req, res) {
    res.redirect("/images");
});

app.get("/images", ensureLogin, function (req, res) {
    fs.readdir(path.join(__dirname, imagePath), function (err, items) {
        res.render("images", { data: items });
    });
});
// ***********************************************************************


// ********************EMPLOYEES ROUTES***********************************
app.get("/employees", ensureLogin, function (req, res) {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            console.log(err);
            res.render({ message: err });
        });
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            console.log(err);
            res.render({ message: err });
        });
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            console.log(err);
            res.render({ message: err });
        });
    } else {
        dataService.getAllEmployees().then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            console.log(err);
            res.render({ message: err });
        });
    }
});

app.get("/employees/add", ensureLogin, function (req, res) {
    dataService.getDepartments().then((data) => {
        res.render("addEmployee", {
            departments: data
        });
    }).catch(() => {
        res.render("addEmployee", {
            departments: []
        });
    });
});

app.post("/employees/add", ensureLogin, function (req, res) {
    dataService.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to add Employee");
    });
});

app.post('/employee/update', ensureLogin, function (req, res) {
    dataService.updateEmployee(req.body).then(() => {
        console.log(req.body);
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to update Employee");
    });
});

app.get("/employee/:empNum", ensureLogin, function(req, res) {

    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data;
        } else {
            viewData.employee = null;
        }
    }).catch(() => {
        viewData.employee = null;
    }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data;
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = [];
        }).then(() => {
            if (viewData.employee == null) {
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData });
            }
        });
});

app.get("/employees/delete/:empNum", ensureLogin, function (req, res) {
    dataService.deleteEmployeeByNum(req.params.empNum).then((data) => {
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
    });
});
// ***********************************************************************


// ********************DEPARTMENT ROUTES***********************************
app.get("/departments", ensureLogin, function (req, res) {
    dataService.getDepartments().then((data) => {
        if (data.length > 0) {
            res.render("departments", { departments: data });
        } else {
            res.render("departments", { message: "no results" });
        }
    }).catch((err) => {
        console.log(err);
        res.render({ message: err });
    })
});

app.get("/departments/add", ensureLogin, function (req, res) {
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, function (req, res) {
    dataService.addDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to add Department");
    });
});

app.post("/department/update", ensureLogin, function (req, res) {
    dataService.updateDepartment(req.body).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Update Department");
    });
});

app.get("/department/:departmentId", ensureLogin, function (req, res) {
    dataService.getDepartmentById(req.params.departmentId).then((data) => {
        if (data.length > 0) {
            res.render("department", { departments: data });
        } else {
            res.status(404).send("Department Not Found");
        }
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

app.get("/departments/delete/:departmentId", ensureLogin, function (req, res) {
    dataService.deleteDepartmentById(req.params.departmentId).then((data) => {
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Remove Department / Department not found");
    });

});
// ***********************************************************************


// *****************LOGIN/LOGOUT/REGISTER ROUTES**************************
app.get("/login", function (req,res) {
    res.render("login");
});

app.get("/register", function (req,res) {
    res.render("register");
});

app.post("/login", function (req,res) {
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
        }
        res.redirect('/employees');
       }).catch((err) => {
            res.render("login", {errorMessage: err, userName: req.body.userName});
       });
});

app.post("/register", function(req, res) {
    dataServiceAuth.registerUser(req.body)
    .then(() => res.render('register', { successMessage: "User created"}))
    .catch((err) => res.render('register', { errorMessage: err, userName: req.body.userName }));
});

app.get("/logout", function (req,res) {
    req.session.reset();
    res.redirect("/register");
});

app.get("/userHistory", ensureLogin, function (req,res) {
    res.render("userHistory");
});

// ***********************************************************************

app.use(function (req, res) {
    res.status(404).send("404: Page Not Found");
})

dataService.initialize()
.then(dataServiceAuth.initialize)
.then(function () {
    app.listen(HTTP_PORT, function () {
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function (err) {
    console.log("unable to start server: " + err);
});
