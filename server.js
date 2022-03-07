/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Afridi Hasan Student ID: 125653196 Date: 20th February 2020
*
* Online (Heroku) Link: https://gentle-retreat-63246.herokuapp.com/
*
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
const multer = require("multer");
var app = express();
var path = require("path");
const bodyParser = require("body-parser");
var dataService = require("./data-service.js");
const { resolve } = require("path");

//handlebar

const exphbs = require("express-handlebars");
app.use(express.static('public')); // static middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.engine(".hbs", exphbs({
  extname: ".hbs",
  defaultLayout: "main",
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



// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT); // .then(() => { app.listen(HTTP_PORT); })

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
  console.log("Express http server listening on: " + HTTP_PORT);
  res.render("home", {});
  // res.sendFile(path.join(__dirname, "/views/home.html"));

});


const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

//middleware for routes
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
});

app.get("/about", function (req, res) {
  // res.sendFile(path.join(__dirname, "/views/about.html"));
  res.render("about", {});
});

app.get("/employees", (req, res) => {
  if (req.query.status) {
    dataService
      .getEmployeesByStatus(req.query.status)
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });


  } else if (req.query.department) {
    dataService
      .getEmployeesByDepartment(req.query.department)
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });


  } else if (req.query.employeeManagerNum) {
    dataService
      .getEmployeesByManager(req.query.employeeManagerNum)
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });


  } else if (req.query.employeeNum) {
    dataService
      .getEmployeeByNum(req.query.employeeNum)
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });


  } else
    dataService
      .getAllEmployees()
      .then((data) => {
        res.render("employees", { employees: data });
      })
      .catch((err) => {
        res.render("employees", { message: "no results" });
      });
});

//employeeID
app.get("/employee/:id", (req, res) => {
  dataService.getEmployeeByNum(req.params.id)
    .then((data) => {
      res.render("employee", { employee: data });
    })
    .catch((err) => {
      res.render("employee", { message: "no results" });
    });
});


//post employee
app.post("/employee/update", (req, res) => { 
  dataService.updateEmployee(req.body)
  .then(res.redirect("/employees"))
  .catch((err) => res.render("employee", { message: "no results"}));
}); 

app.get("/managers", (req, res) => {
  let managers = [];
  dataService
    .getManagers()
    .then((employees) => {
      for (let i = 0; i < employees.length; i++) {
        if (employees[i].isManager) {
          managers.push(employees[i]);
          res.json(employees);
        }
      }
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/departments", function (req, res) {
  dataService
    .getDepartments()
    .then((data) => {
      res.render("departments", { departments: data });
    })
    .catch((err) => {
      res.render("departments", { message: "no results" });
    });
});

app.get("/employees/add", function (req, res) {
  // res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
  res.render("addEmployee", {});
});

app.post("/employees/add", function (req, res) {
  dataService
    .addEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch(function (err) {
      console.log("An error was encountered: " + err);
    });
}); ``

app.get("/images/add", function (req, res) {
  // res.sendFile(path.join(__dirname, "/views/addImage.html"));
  res.render("addImage", {});
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", function (req, res) {
  fs.readdir("./public/images/uploaded", function (err, items) {
    res.render("images", { images: items });

    var parsedItems = JSON.stringify({ images: items });
    res.send(parsedItems);
  });
});
//////////////////

// error page (did not try to make it custom. maybe next time)
app.use((req, res) => {
  res.status(404).send("404 Page Not Found");
});

// step 5 ( didnt add app.listen() ) see line 27
dataService
  .initialize()
  .catch((err) => { console.error(err); });