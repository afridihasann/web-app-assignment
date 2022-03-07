const express = require("express");
const fs = require("fs");
const { resolve } = require("path");

var departments = [];
var employees = [];

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/employees.json", "utf8", (err, data) => {
      if (err) reject(err);
      employees = JSON.parse(data);
      resolve();
    });
    fs.readFile("./data/departments.json", "utf8", (err, data2) => {
      if (err) reject(err);
      departments = JSON.parse(data2);
      resolve();
    });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    try {
      resolve(employees);
    } catch (err) {
      console.log("error", err);
    }
  });
};

module.exports.getManagers = function () {
  return new Promise((resolve, reject) => {
    try {
      reject(employees);
    } catch (err) {
      console.log("error", err);
    }
  });
};

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    try {
      resolve(departments);
    } catch (err) {
      console.log("error", err);
    }
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    try {
      employees.push(employeeData);
      employeeData.employeeNum = employees.length + 1;
      resolve();
    } catch (err) {
      console.log("error==>", err);
    }
  });
};

module.exports.getEmployeesByStatus = function (status) {
  return new Promise((resolve, reject) => {
    var m_status = [];
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].status == status) {
        m_status.push(employees[i]);
      }
    }
    if (m_status.length == 0) reject("Error!");
    resolve(m_status);
  });
};

module.exports.getEmployeesByDepartment = function (department) {
  return new Promise((resolve, reject) => {
    var m_depart = [];
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].department == department) {
        m_depart.push(employees[i]);
      }
    }
    if (m_depart.length == 0) reject("Error!");
    resolve(m_depart);
  });
};

module.exports.getEmployeesByManager = function (manager) {
  return new Promise((resolve, reject) => {
    var m_manager = [];
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].employeeManagerNum == manager) {
        m_manager.push(employees[i]);
      }
    }
    if (m_manager.length == 0) reject("Error!");
    resolve(m_manager);
  });
};

module.exports.getEmployeeByNum = function (num) {
  return new Promise((resolve, reject) => {
    var m_employee = [];
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].employeeNum == num) {
        //     //console.log(employee);
        m_employee.push(employees[i]);
      }
    }
    if (m_employee.length == 0) reject("Error!");
    resolve(m_employee);
  });
};

module.exports.updateEmployee = (employeeData) => {
  return new Promise((resolve, reject) => {
    let empIdx = employees.findIndex(x => x.employeeNum == employeeData.employeeNum);

    if (empIdx >= 0) {
      employees[empIdx].firstName = employeeData.firstName;
      employees[empIdx].lastName = employeeData.lastName;
      employees[empIdx].email = employeeData.email;
      employees[empIdx].addressStreet = employeeData.addressStreet;
      employees[empIdx].addressCity = employeeData.addressCity;
      employees[empIdx].addressState = employeeData.addressState;
      employees[empIdx].addressPostal = employeeData.addressPostal;
      employees[empIdx].isManager = employeeData.isManager;
      employees[empIdx].employeeManagerNum = employeeData.employeeManagerNum;
      employees[empIdx].status = employeeData.status;
      employees[empIdx].department = employeeData.department;

      resolve();
    }
    else {
      reject("no employee found");
    }
  })
}
