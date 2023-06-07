const express=require('express');//load express library
const app=express();
const PORT=process.env.PORT|| 8000
const {MongoClient}=require("mongodb");


/*
const articlesInfo = {
    "Learn-react": {
        comments: [],
    },
    "learn-node": {
        comments: [],
    },
    "nodejs": {
        comments: [],
    },
};
*/
//initialize middleware
//we use to have to install body parser but now it is a built in middleware
//function of express. it parse incoming json payload
app.use(express.json({ extended: false }));

const withdb=async(operations,res)=>{
    try
    {
        const client=await MongoClient.connect("mongodb://localhost:27017");
        const db=client.db("mernblog");
        await operations(db);
        client.close();

    }catch(error)
    {
        res.status(500).json({
            message:"Error connecting to database",error
        });

    }
};

app.get('/api/articles/:name',async(req,res)=>{
    //try
    withdb(async (db)=>{
 const articleName=req.params.name;
//    const client=await MongoClient.connect('mongodb://localhost:27017')
    //const db=client.db('mernblog')
    const articleInfo= await db
    .collection('articles')
    .findOne({name:articleName});
    res.status(200).json(articleInfo);
    },res);
    
       
    //client.close();

  /*  }catch(error)
    {
    res.status(500).json({message:"Error connecting to database",error});
    }*/
});
//just  a test rouute for now
//app.get('/',(req,res)=>res.send("Hello World"));
//app.post('',(req,res)=>res.send(`Hello ${req.body.name}`));

//app.get("/hello/:name",(req,res)=> res.send(`Hello ${req.params.name}`));
app.post('/api/articles/:name/add-comments', (req, res) => {
    const { username, text } = req.body;
    const articleName = req.params.name;
   // articlesInfo[articleName].comments.push({ username, text });
    //res.status(200).send(articlesInfo[articleName]);

    withdb(async(db)=>{
        const articleInfo=await db
        .collection("articles")
        .findOne({name:articleName});
        await db.collection('articles').updateOne({name:articleName},
            {
                $set:{
                    comments:articleInfo.comments.concat({username,text}),

                },
            });
            const updateArticleInfo=await db.collection('articles').findOne({name:articleName})
            res.status(200).json(updateArticleInfo);
    },res);
});

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
