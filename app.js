const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();



const priorityAndStatus(requestQuery){
    return (
        requestQuery.priority!==undefined && requestQuery.status!==undefined
    );
};

const hasPriority(requestQuery){
    return(
        requestQuery.priority!==undefined;
    );
    
};

const hasStatus(requestQuery){
    return(
        requestQuery.status!==undefined;
    );
};

app.get("/todos",async(request,response)=>{
    let data=null;
    let getTodosQuery="";
    const{search_q="",priority,status}=request.query;
    switch(true){
        case priorityAndStatus(request.query):
            getTodosQuery=`
            select * from todo where todo like '%${search_q}%'
            and status = '${status}'
            and priority = '${priority}';
            `;
            break;

        case hasPriority(request.query):
            getTodosQuery=`
            select * from todo where todo like '%${search_q}%'
            and priority ='${priority}';
            `;
            break;
        case hasStatus(request.query):
            getTodosQuery=`
            select * from todo where todo like '%${search_q}%'
            and status='${status}';`;
            break;
        default:
            getTodosQuery=`
            select * from todo where todo like '%${search_q}%';
            `;

    }

    data = await database.all(getTodosQuery);
    response.send(data);
});

app.get("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const getTodoQuery=`
    select * from todo where id = ${todoId};`;
    const todo = await database(getTodoQuery);
    response.send(todo);
});


app.post("/todos",async(request,response)=>{
    const {id,todo,priority,status}=request.body;
    const postQuery=`
    insert into todo (id,todo,priority,status)
    values(${id},'${todo}','${priority}','${status}');
    `;
    const todo=await database.run(postQuery);
    response.send("Todo Successfully Added");

});

app.delete("/todos/:todoId/",async(request,response)=>{
    const {todoId}=request.params;
    const deleteQuery=`
    delete from todo where todoId=${todoId};
    `;
    await database.run(deleteQuery);
    response.send("Todo Deleted");

});

app.put("/todos/:todoId/",async (request,response)=>{
    const{todoId}=request.params;
    let updateColumn="";
    const requestBody=request.body;
    switch(true){
        case requestBody.status!==undefined:
            updateColumn="Status";
        case requestBody.priority!==undefined:
            updateColumn="Priority";
        case requestBody.todo!==undefined:
            updateColumn="Todo";
        break;
    }
    const previousTodoQuery=`select * from todo where todoId=${todoId};`;
    const previousTodo=await database.get(previousTodoQuery);


    const{todo=previousTodo.todo,status=previousTodo.status,priority=previousTodo.priority}=request.body;

    const updateTodoQuery=`update todo
     set
      todo='${todo}',
      priority='${priority}',
      status='${status}'
      where
      id=${todoId};`;

      await database.run(updateTodoQuery);
      response.send(`${updatedColumn} Updated`);
});















