const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json())

app.get('/', (req,res) => {
    res.send('To Do list server is running')
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hu7ym6e.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {serverApi: {version: ServerApiVersion.v1,strict: true,deprecationErrors: true,}});



async function run() {
  try {
    const userwithtaskCollection = client.db('todolist').collection('userwithtask');
    // Get All Tasks
    app.get('/tasks', async (req, res) => {
        let query = {}
        const email = req.query.email
        if (email) {
          query = {
            email: email,
          }
        }
        const tasks = await userwithtaskCollection.find(query).toArray()
        // console.log(booking)
        res.send(tasks);
      });



    // Get All Tasks By Status
    app.get('/status/tasks', async (req, res) => {
        let query = {}
        const status = req.query.status
        if (status) {
          query = {
            status: status,
          }
        }
        const tasks = await userwithtaskCollection.find(query).toArray()
        // console.log(booking)
        res.send(tasks);
      });


       //data load by id
      app.get('/tasks/:id', async (req, res) => {
        const query = { _id: new ObjectId(req.params.id)};
        const task = await userwithtaskCollection.findOne(query)
        res.send(task);
        
      })

     //delete operation
     app.delete('/tasks/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await userwithtaskCollection.deleteOne(query);
      res.send(result);
     })

      //data load by id for update
     app.get('/update/:id', async( req, res) => {
      const id = req.params.id;
      
      const query = { _id : new ObjectId(id)};
      const ForUpdate = await userwithtaskCollection.findOne(query);
      res.send(ForUpdate);
     })



    //form update
     app.put('/tasks/update/:id', async(req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id)};
      const task = req.body;
      const option = { upsert: true};
      const updatedTask = {
        $set: {
          title: task.title,
          description: task.description
        }
      }
       const result = await userwithtaskCollection.updateOne( filter, updatedTask, option);
       res.send(result);
     })

    //status update
     app.patch('/statusup/:id', async( req, res) => {
      const id = req.params.id;
      const status = req.body.status
      const query = { _id: new ObjectId(id)}
      const updatedDoc = {
        $set:{
          status: status
        }
      }
      const result = await userwithtaskCollection.updateOne( query, updatedDoc)
      res.send(result);
     })

     app.post('/taskadd', async(req, res) =>{
      const task = req.body;
      const result = await userwithtaskCollection.insertOne(task)
      res.send(result)
     })


     //Get Search Result
     app.get('/search-result', async(req, res) => {
      const query = {}
      const title = req.query.title
      if(title) query.title = title
      const cursor = userwithtaskCollection.find(query)
      const task = await cursor.toArray()
      res.send(task)
     })
 
  } finally {
   
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log('todo list server is running on port', port);
})