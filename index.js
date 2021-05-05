//// Add packages

const express = require("express");
const app = express();

const multer = require("multer");
const upload = multer();

// Add packages
const dblib = require("./dblib.js");

// Add middleware to parse default urlencoded form
app.use(express.urlencoded({ extended: false }));

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
//notify ejs template engine must be used
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

//specify that views are saved in  view folder
//app.set("views", path.join(__dirname, "views"));

//Indicate that static files are saved in the “public” folder
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));



//return index.ejs
app.get("/", (req, res) => { {
    // res.send("Hello world...");
    res.render("index");
  }});



//display total number of records in db
app.get("/customer", async (req, res) => {
      // Omitted validation check
      const totRecs = await dblib.getTotalRecords();
      //create an empty customer oject to populate forms with values
      const cust={
          cusId:"",
          cusFname:"",
          cusLname:"",
          cusState:"",
          cusSalesYTD:"",
          cusSalesPrev:""
      };
      res.render("customer", {
          type: "get",
          cust: cust,
          totRecs: totRecs.totRecords
          
      });
});
  //post search result
  app.post("/customer", async (req, res) => {
    // Omitted validation check
    //  Can get this from the page rather than using another DB call.
    //  Add it as a hidden form value.
    const totRecs = await dblib.getTotalRecords();

    dblib.findCustomers(req.body)
        .then(result => {
          // console.log(`result is:`,result);
            res.render("customer", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: result,
                cust: req.body
            })
        })
        .catch(err => {
            res.render("customer", {
                type: "post",
                totRecs: totRecs.totRecords,
                result: `Unexpected Error: ${err.message}`,
                cust: req.body
            });
        });
});