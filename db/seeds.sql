USE employee_db;



INSERT INTO department (name)
VALUES  ("Sales"),
("Engineering"),
("Marketing");


INSERT INTO role (title, salary, department_id)
VALUES  ("Salesperson", 55000.00, 1),
("Marketing specialist", 80000.00, 3),
("Software Engineer", 80000.00, 2);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("John", "Doe", 3, NULL),
("Mary", "Louise", 3, 1);







