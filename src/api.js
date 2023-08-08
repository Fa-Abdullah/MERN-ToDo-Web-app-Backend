const express = require("express")
const Collection = require("./mongodb")
const cors = require("cors")
const serverless = require("serverless-http")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Get all tasks
app.get('/tasks', async (req, res) => {
  const { email } = req.query; // Use req.query to access query parameters
  const userData = await Collection.findOne({email:email});
  if (!userData) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(userData.tasks);
});


// Create a new task
app.post('/tasks', async (req, res) => {
  try {
    const { task } = req.body;
    const { email } = req.query;
    if (!task) {
      res.status(400).json({ error: 'Task is required' });
      return;
    }
    const newTask = { task, done: false };

    const userData = await Collection.findOneAndUpdate(
      { email: email },
      { $push: { tasks: newTask } }, // Use $push to add a new task to the tasks array
      { new: true }
    );

    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(201).json(userData.tasks);
  } catch (err) {
    res.status(501).json(`Error in adding new task: ${err}`);
  }
});


// Update task status
app.put('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { email, done } = req.query;

    const userData = await Collection.findOne({ email: email });

    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const task = userData.tasks.find((task) => task._id.toString() === taskId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    task.done = done;

    await userData.save();

    res.status(201).json(userData.tasks);
  } catch (error) {
    res.status(501).json(`Error in updating task: ${error}`);
  }
});


// Delete a task
app.delete('/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { email } = req.query;
    const userData = await Collection.findOne({ email: email });

    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const index = userData.tasks.findIndex((task) => task._id.toString() === taskId);

    if (index === -1) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    userData.tasks.splice(index, 1);
    await userData.save();

    res.status(201).json(userData.tasks);
  } catch (error) {
    res.status(501).json(`Error in deleting task: ${error}`);
  }
});

app.delete('/tasks', async (req, res) => {
  try {
    const { email } = req.query;
    const userData = await Collection.findOne({ email: email });

    if (!userData) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const tasksToDelete = userData.tasks.filter((task) => task.done === true);

    if (tasksToDelete.length === 0) {
      res.status(404).json({ error: 'No tasks found to delete' });
      return;
    }

    tasksToDelete.forEach((task) => {
      const index = userData.tasks.findIndex((t) => t._id.toString() === task._id.toString());
      if (index !== -1) {
        userData.tasks.splice(index, 1);
      }
    });

    await userData.save();

    res.status(201).json(userData.tasks);
  } catch (error) {
    res.status(501).json(`Error in deleting tasks: ${error}`);
  }
});



app.post("/",async(req,res)=>{

    try{
        const{email,password}=req.body

        const check=await Collection.findOne({email:email})

        if(check){
            if(check.password === req.body.password){
                res.json({name: check.name, password: check.password, email: check.email, phone: check.phone, birthYear: check.birthYear, task: check.task, done: check.done})
            }else{
                res.json("wrong password")
            }
        }
        else{
            res.json("notexist")
        }

    }
    catch(e){
        res.json("fail")
    }

})

app.post("/signup",async(req,res)=>{
    const{email,password,name,phone,birthYear}=req.body

    const data = {
        email: email,
        password: password,
        name: name,
        phone: phone,
        birthYear: birthYear
      };
      
      try {
        const check = await Collection.findOne({ email: email });
      
        if (check) {
          res.json("exist");
        } else {
          await Collection.insertMany([data]);
          res.json("notexist");
        }
      } catch (e) {
        res.json("fail");
      }
})

app.post("/profile",async(req,res)=>{
    const{email,password,name,phone,birthYear}=req.body

    const data={
        email:email,
        password:password,
        name:name,
        phone:phone,
        birthYear:birthYear
    }

    try{

        const check = await Collection.findOneAndUpdate(
            { email: email },
            { name:name, phone:phone, birthYear:birthYear, password: password },
            { returnOriginal: false }
          );

          console.log(check)

        if(check){
            res.json({name: check.name, password: check.password, email: check.email, phone: check.phone, birthYear: check.birthYear})
        }
        else{
            res.json("notexist")
            await Collection.insertMany([data])
        }
    }
    catch(e){
        res.json("fail")
    }
    
})

app.listen(7000,()=>{
    console.log("port connected");
})

module.exports.handler = serverless(app);