const inquirer = require("inquirer");
const mysql = require("mysql2");

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "",
    database: "employee_db",
  },
  console.log(`Connected to the employee_db database.`)
);

db.connect((err) => {
  if (err) throw err;
  EmployeeTraker();
});

function EmployeeTraker() {
  inquirer
    .prompt({
      name: "job",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "view all Employees",
        "add an Employee",
        "update an Employee role",
        "view all roles or department",
        "add a role",
        "add a department",
        "quit",
      ],
    })
    .then(function ({ job }) {
      switch (job) {
        case "view all Employees":
          viewallEmployees();
          break;
        case "add an Employee":
          addanEmployee();
          break;
        case "update":
          update();
          break;
        case "view all roles or department":
          view();
          break;
        case "add a role":
          AddArole();
          break;
        case "add a department":
          addAdepartment();
          break;
        case "quit":
          db.end();
          return;
      }
    });
}

function viewallEmployees() {
  const sql = `SELECT emp.id, emp.first_name, emp.last_name, title, salary, CONCAT(mgr.first_name,
                mgr.last_name) AS manager, name
                FROM employee emp
                LEFT JOIN employee mgr ON mgr.id = emp.manager_id
                LEFT JOIN role ON emp.role_id = role.id
                LEFT JOIN department ON role.department_id =
                department.id;`;

  db.query(sql, function (err, res) {
    if (err) throw err;

    console.table(res);
    console.log("Employees viewed!\n");

    EmployeeTraker();
  });
}

function addanEmployee() {
  let employees = [];
  let roles = [];

  db.query(`SELECT * FROM role`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      roles.push(data[i].title);
    }

    db.query(`SELECT * FROM employee`, function (err, data) {
      if (err) throw err;

      for (let i = 0; i < data.length; i++) {
        employees.push(data[i].first_name);
      }

      inquirer
        .prompt([
          {
            name: "first_name",
            message: "what's the employees First Name",
            type: "input",
          },
          {
            name: "last_name",
            message: "What is their last name?",
            type: "input",
          },
          {
            name: "role_id",
            message: "What is their role?",
            type: "list",
            choices: roles,
          },
          {
            name: "manager_id",
            message: "Who is their manager?",
            type: "list",
            choices: ["none"].concat(employees),
          },
        ])
        .then(function ({ first_name, last_name, role_id, manager_id }) {
          let queryText = `INSERT INTO employee (first_name, last_name, role_id`;
          if (manager_id != "none") {
            queryText += `, manager_id) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(
              role_id
            )}, ${employees.indexOf(manager_id) + 1})`;
          } else {
            queryText += `) VALUES ('${first_name}', '${last_name}', ${
              roles.indexOf(role_id) + 1
            })`;
          }
          console.log(queryText);

          db.query(queryText, function (err, data) {
            if (err) throw err;

            EmployeeTraker();
          });
        });
    });
  });
}

function update() {
  inquirer
    .prompt({
      name: "update",
      message: "What would you like to update?",
      type: "list",
      choices: ["role", "manager"],
    })
    .then(function ({ update }) {
      switch (update) {
        case "role":
          update_role();
          break;
        case "manager":
          update_manager();
          break;
      }
    });
}

function update_role() {
  db.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;

    let employees = [];
    let roles = [];

    for (let i = 0; i < data.length; i++) {
      employees.push(data[i].first_name);
    }

    db.query(`SELECT * FROM role`, function (err, data) {
      if (err) throw err;

      for (let i = 0; i < data.length; i++) {
        roles.push(data[i].title);
      }

      inquirer
        .prompt([
          {
            name: "employee_id",
            message: "Who's role needs to be updated",
            type: "list",
            choices: employees,
          },
          {
            name: "role_id",
            message: "What is the new role?",
            type: "list",
            choices: roles,
          },
        ])
        .then(function ({ employee_id, role_id }) {
          //UPDATE `table_name` SET `column_name` = `new_value' [WHERE condition]
          db.query(
            `UPDATE employee SET role_id = ${
              roles.indexOf(role_id) + 1
            } WHERE id = ${employees.indexOf(employee_id) + 1}`,
            function (err, data) {
              if (err) throw err;

              EmployeeTraker();
            }
          );
        });
    });
  });
}

function update_manager() {
  db.query(`SELECT * FROM employee`, function (err, data) {
    if (err) throw err;

    let employees = [];

    for (let i = 0; i < data.length; i++) {
      employees.push(data[i].first_name);
    }

    inquirer
      .prompt([
        {
          name: "employee_id",
          message: "Who would you like to update?",
          type: "list",
          choices: employees,
        },
        {
          name: "manager_id",
          message: "Who's their new manager?",
          type: "list",
          choices: ["none"].concat(employees),
        },
      ])
      .then(({ employee_id, manager_id }) => {
        let queryText = "";
        if (manager_id !== "none") {
          queryText = `UPDATE employee SET manager_id = ${
            employees.indexOf(manager_id) + 1
          } WHERE id = ${employees.indexOf(employee_id) + 1}`;
        } else {
          queryText = `UPDATE employee SET manager_id = ${null} WHERE id = ${
            employees.indexOf(employee_id) + 1
          }`;
        }

        db.query(queryText, function (err, data) {
          if (err) throw err;

          EmployeeTraker();
        });
      });
  });
}

function view() {
  inquirer
    .prompt({
      name: "option",
      message: "Which would you like to view?",
      type: "list",
      choices: ["department", "role"],
    })
    .then(function ({ option }) {
      db.query(`SELECT * FROM ${option}`, function (err, data) {
        if (err) throw err;

        console.table(data);
        EmployeeTraker();
      });
    });
}

function AddArole() {
  let departments = [];

  db.query(`SELECT * FROM department`, function (err, data) {
    if (err) throw err;

    for (let i = 0; i < data.length; i++) {
      // Loops through and finds the name of all the departments
      db.push(data[i].name);
    }

    inquirer
      .prompt([
        {
          name: "title",
          message: "What is the role?",
          type: "input",
        },
        {
          name: "salary",
          message: "How much do they make?",
          type: "input",
        },
        {
          name: "department_id",
          message: "What department does it belong to?",
          type: "list",
          choices: departments,
        },
      ])
      .then(function ({ title, salary, department_id }) {
        let index = departments.indexOf(department_id);

        db.query(
          `INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', ${index})`,
          function (err, data) {
            if (err) throw err;
            console.log(`Added`);
            EmployeeTraker();
          }
        );
      });
  });
}

function addAdepartment() {
  inquirer
    .prompt({
      name: "name",
      message: "What is the department's name?",
      type: "input",
    })
    .then(function ({ name }) {
      db.query(
        `INSERT INTO department (name) VALUES ('${name}')`,
        function (err, data) {
          if (err) throw err;
          console.log(`Added`);
          EmployeeTraker();
        }
      );
    });
}
