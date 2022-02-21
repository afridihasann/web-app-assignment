/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Afridi Hasan Student ID: 125653196 Date: 20th February 2020
*
* Online (Heroku) Link: ________________________________________________________
*
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const multer = require("multer");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const dataService = require("./data-service.js");
const { resolve } = require("path");

app.use(express.static('public')); // static middleware
app.use(bodyParser.urlencoded({ extended: true }));

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    console.log("Express http server listening on: " + HTTP_PORT);
    res.sendFile(path.join(__dirname, "/views/home.html"));
});
// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT); // .then(() => { app.listen(HTTP_PORT); })

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  

  const upload = multer({ storage: storage });
  

  app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
  });
  

  app.get("/employees", (req, res) => {
    if (req.query.status) {
      dataService
        .getEmployeesByStatus(req.query.status)
        .then((employees) => {
          res.json(employees);
        })
        .catch();
    } else if (req.query.department) {
      dataService
        .getEmployeesByDepartment(req.query.department)
        .then((data) => {
          res.json(data);
        })
        .catch();
    } else if (req.query.employeeManagerNum) {
      dataService
        .getEmployeesByManager(req.query.employeeManagerNum)
        .then((data) => {
          res.json(data);
        })
        .catch();
    } else if (req.query.employeeNum) {
      dataService
        .getEmployeeByNum(req.query.employeeNum)
        .then((data) => {
          res.json(data);
        })
        .catch();
    } else
      dataService
        .getAllEmployees()
        .then((employees) => {
          res.json(employees);
        })
        .catch((err) => {
          res.send(err);
        });
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
      .then((departments) => {
        res.json(departments);
      })
      .catch((err) => {
        res.send(err);
      });
  });
  
  app.get("/employees/add", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
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
  });
  
  app.get("/images/add", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/addImage.html"));
  });
  
  app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
  });
  
  app.get("/images", function (req, res) {
    fs.readdir("./public/images/uploaded", function (err, items) {
      var parsedItems = JSON.stringify({ images: items });
  
      res.send(parsedItems);
    });
  });

app.use((req, res) => {
    res.status(404).send("404 Page Not Found");
});

dataService
    .initialize()
    .catch((err) => { console.error(err); });