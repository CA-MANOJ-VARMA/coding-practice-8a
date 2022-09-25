const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDBserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is UP and RUNNING`);
    });
  } catch (error) {
    console.log(`DBServer{error.message}`);
    process.exit(1);
  }
};

initializeDBserver();

// ### API 1

// #### Path: `/todos/`

// #### Method: `GET`

//      **Scenario 1**

//   - **Sample API**
//     ```
//     /todos/?status=TO%20DO

//  **Scenario 2**

//   - **Sample API**
//     ```
//     /todos/?priority=HIGH
// **Scenario 3**

//   - **Sample API**
//     ```
//     /todos/?priority=HIGH&status=IN%20PROGRESS
// - **Scenario 4**

//   - **Sample API**
//     ```
//     /todos/?search_q=Play

app.get(`/todos/`, async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  status.replace("%20", " ");

  //   console.log(status);
  //   console.log(search_q);

  if (priority !== "" && status === "" && search_q === "") {
    console.log(priority);
    const dbQuery = `
    SELECT * 
    FROM 
    todo
    WHERE
    priority = '${priority}'
  `;
    const array = await db.all(dbQuery);
    response.send(array);
  } else if (priority === "" && status !== "" && search_q === "") {
    const dbQuery = `
    SELECT * 
    FROM 
    todo
    WHERE 
    status = '${status}'
  `;
    const array = await db.all(dbQuery);
    response.send(array);
  } else if (priority !== "" && status !== "" && search_q === "") {
    const dbQuery = `
    SELECT * 
    FROM 
    todo
    WHERE 
    
    priority = '${priority}' AND
    status = '${status}'
  `;
    const array = await db.all(dbQuery);
    response.send(array);
  } else {
    const dbQuery = `
    SELECT * 
    FROM 
    todo
    WHERE 
    todo LIKE '%${search_q}%'
  `;
    const array = await db.all(dbQuery);
    response.send(array);
  }
});

// ### API 2

// #### Path: `/todos/:todoId/`

// #### Method: `GET`

app.get(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;

  const dbQuery = `
    SELECT * 
    FROM 
    todo
    WHERE
    id = ${todoId}
  `;
  const array = await db.get(dbQuery);
  response.send(array);
});

// ### API 3

// #### Path: `/todos/`

// #### Method: `POST`
app.post(`/todos/`, async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const dbQuery = `
    INSERT INTO 
    todo (id, todo, priority, status )
    VALUES 
    (${id}, '${todo}','${priority}','${status}')
  `;
  const array = await db.run(dbQuery);
  response.send("Todo Successfully Added");
});

// ### API 4

// #### Path: `/todos/:todoId/`

// #### Method: `PUT`
app.put(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;
  const { todo = "", priority = "", status = "" } = request.body;
  if (todo !== "" && priority === "" && status === "") {
    const dbQuery = `
    UPDATE
    todo 
    SET todo = '${todo}'
    WHERE 
    id = ${todoId}
  `;
    const array = await db.run(dbQuery);
    response.send("Todo Updated");
  } else if (todo === "" && priority !== "" && status === "") {
    const dbQuery = `
    UPDATE
    todo 
    SET priority= '${priority}'
    WHERE 
    id = ${todoId}
  `;
    const array = await db.run(dbQuery);
    response.send("Priority Updated");
  } else {
    const dbQuery = `
    UPDATE
    todo 
    SET status = '${status}' 
    WHERE 
    id = ${todoId}
  `;
    const array = await db.run(dbQuery);
    response.send("Status Updated");
  }
});

// ### API 5

// #### Path: `/todos/:todoId/`

// #### Method: `DELETE`
app.delete(`/todos/:todoId/`, async (request, response) => {
  const { todoId } = request.params;

  const dbQuery = `
    DELETE
    FROM
    todo 
    WHERE 
    id = ${todoId}
  `;
  const array = await db.run(dbQuery);
  response.send("Todo Deleted");
});

module.exports = app;
