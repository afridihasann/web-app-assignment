/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Afridi Hasan Student ID: 125653196 Date: April 22nd 2022
*
* Online (Heroku) Link: https://gentle-retreat-63246.herokuapp.com/
*
*********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const multer = require("multer");
const app = express();
const bodyParser = require("body-parser");
const dataService = require("./data-service.js");
const path = require("path");
const exphbs = require("express-handlebars"); //handlebars
const dataServiceAuth = require (_dirname + "/data-service-auth.js")
const clientSessions = require('client-sessions')

const upload = multer({ storage: storage });
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

app.engine(".hbs", exphbs.engine({
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
function onHttpStart = () => {
  console.log("Express http server listening on port " + HTTP_PORT);
}

app.use(express.static('public')); // static middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req,res,next) {
  let route = req.baseUrl+req.path;
  app.locals.activeRoute = (route == "/") ? "/":route.replace(/\/$/,"");
  next();
});



app.get('/', (req, res) => {
  res.render("home");
});

app.get('/home', (req, res) => {
  res.render("home");
});

app.use(clientSessions( {
  cookieName: "session",
  secret: "WEB322A6Secret",
  duration: 2*60*1000,
  activeDuration: 1000*60
}));

app.use((req,res,next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin = (req,res,next) => {
  if (!(req.session.user)) {
      res.redirect("/login");
  }
  else { next(); }
};

app.get("/about", function (req, res) {
  // res.sendFile(path.join(__dirname, "/views/about.html"));
  res.render("about", {});
});



//Employee

app.get("/employees", ensureLogin, (req, res) => {
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



//Employees

app.get("/employee/:empNum", ensureLogin, (req, res) => {

  let viewData = {};
  dataservice.getEmployeeByNum(req.params.empNum).then((data) => {
      if (data) {
          viewData.employee = data; //store employee data
      } else {
          viewData.employee = null;
      }
  }).catch(() => {
      viewData.employee = null;
  }).then(dataservice.getDepartments)
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
      if (viewData.employee == null) { //return an error
          res.status(404).send("Employee Not Found");
      } else {
          res.render("employee", { viewData: viewData }); 
      }
  });
});

app.get('/employees/add', ensureLogin, (req,res) => {
  dataservice.getDepartments()
  .then(data => res.render("addEmployee", {departments: data}))
  .catch(err => res.render("addEmployee", {departments: []}));
});

app.post('/employees/add', ensureLogin, (req,res) => {
  dataservice.addEmployee(req.body).then(() => {
      res.redirect("/employees");
  })
});

app.post('/employee/update', ensureLogin, (req, res) => {
  dataservice.updateEmployee(req.body).then(() => {
      res.redirect("/employees");
  })
});

app.get('/employees/delete/:value', ensureLogin, (req,res) => {
  dataservice.deleteEmployeeByNum(req.params.value)
  .then(res.redirect("/employees"))
  .catch(err => res.status(500).send("Unable to Remove Employee / Employee not found"))
});



//Managers

app.get("/managers", ensureLogin, (req, res) => {
  dataservice.getManagers()
  .then(data => res.render("employees", {employees: data}))
  .catch(err => res.status(404).send("managers data not found"))
});



//Departments

app.get("/departments", ensureLogin, (req, res) => {
  dataservice.getDepartments()
  .then(data => res.render("departments", { departments: data }))
  .catch(err => res.status(404).send('departments not found'))
});

app.get("/departments/add", ensureLogin, (req,res) => {
  res.render(path.join(__dirname + "/views/addDepartment.hbs"));
});

app.post("/departments/add", ensureLogin, (req,res) => {
  dataservice.addDepartment(req.body).then(() => {
      res.redirect("/departments");
  })
});

app.post("/department/update", ensureLogin, (req,res) => {
  dataservice.updateDepartment(req.body).then(() => {
      res.redirect("/departments");
  })
});

app.get("/department/:departmentId", ensureLogin, (req, res) =>{
  dataservice.getDepartmentById(req.params.departmentId)
  .then((data) => {res.render("department", { department: data })})
  .catch(err => res.status(404).send("department not found"))
});

app.get('/departments/delete/:value', ensureLogin, (req,res) => {
  dataservice.deleteDepartmentByNum(req.params.value)
  .then(res.redirect("/departments"))
  .catch(err => res.status(500).send("Unable to Remove Department / Department not found"))
});



//Images

app.get("/images/add", ensureLogin, function (req, res) {
  // res.sendFile(path.join(__dirname, "/views/addImage.html"));
  res.render(path.join(__dirname + "/views/addImage.hbs"));
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



//Login

app.get("/login", (req,res) => {
  res.render("login");
});

app.get("/register", (req,res) => {
  res.render("register");
});

app.post("/register", (req,res) => {
  dataServiceAuth.registerUser(req.body)
  .then(() => res.render("register", {successMessage: "User created" } ))
  .catch (err => res.render("register", {errorMessage: err, userName:req.body.userName }) )
});

app.post("/login", (req,res) => {
  req.body.userAgent = req.get('User-Agent');
  dataServiceAuth.checkUser(req.body)
  .then(user => {
      req.session.user = {
          userName:user.userName,
          email:user.email,
          loginHistory:user.loginHistory
      }
      res.redirect("/employees");
  })
  .catch(err => {
      res.render("login", {errorMessage:err, userName:req.body.userName} )
  }) 
});



//Logout

app.get("/logout", (req,res) => {
  req.session.reset();
  res.redirect("/login");
});



//UserHistory

app.get("/userHistory", ensureLogin, (req,res) => {
  res.render("userHistory", {user:req.session.user} );
});




//Error

app.use((req, res) => {
  res.status(404).send("404 Page Not Found");
});



//Initialize

dataservice.initialize()
.then(dataServiceAuth.initialize())
.then(() => {
    app.listen(HTTP_PORT, onHttpStart())
}).catch (() => {
    console.log('promises unfulfilled');
})