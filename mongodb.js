const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://tmtm:VUMQQ1FMviCyCuqk@cluster0.jwevna4.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("mongodb connected successfully");
})
.catch(()=>{
    console.log('mongodb connection failed');
})

const newSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  birthYear: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  tasks: [
    {
      taskId: {
        type: Number,
        unique: true,
      },
      task: {
        type: String,
      },
      done: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

newSchema.pre("save", async function (next) {
  const doc = this;
  if (!doc.isNew) {
    next();
    return;
  }
  try {
    const lastTask = await collection.findOne().sort({ "tasks.taskId": -1 });
    const lastTaskId = lastTask ? lastTask.tasks[0].taskId : 0;
    doc.tasks[0].taskId = lastTaskId + 1;
    next();
  } catch (error) {
    next(error);
  }
});

const collection = mongoose.model("collection", newSchema);

module.exports = collection;


// const mongoose=require("mongoose")
// mongoose.connect("mongodb+srv://tmtm:VUMQQ1FMviCyCuqk@cluster0.jwevna4.mongodb.net/?retryWrites=true&w=majority")
// .then(()=>{
//     console.log("mongodb connected");
// })
// .catch(()=>{
//     console.log('failed');
// })


// const newSchema=new mongoose.Schema({
//     email:{
//         type:String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     },
//     name:{
//         type:String,
//         required:true
//     },
//     birthYear:{
//         type:String,
//         required:true
//     },
//     phone:{
//         type:String,
//         required:true
//     },
//     tasks:[{
//         task:{
//             type:String,
//         } ,
//         done:{
//             type:Boolean,
//             default:false
//         }
//     }] ,
// })




// const collection = mongoose.model("collection",newSchema)

// module.exports=collection

