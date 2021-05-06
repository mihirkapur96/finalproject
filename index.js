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

// GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM customer WHERE cusId = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("edit", { model: result.rows[0] });
    });
  });

// POST /edit/5
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const customer = [req.body.cusId, req.body.cusFname, req.body.cusLname,req.body.cusState,req.body.cusSalesYTD,req.body.cusSalesPrev];
    const sql = "UPDATE customer SET ID = $1, FName = $2, LName = $3, State = $4, SalesYTD = $5, PrevYearSales = #6 WHERE (cusId = $1)";
    pool.query(sql, customer, (err, result) => {
      // if (err) ...
      res.redirect("/customer");
    });
  });

  // GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM customer WHERE cusId = $1";
    pool.query(sql, [id], (err, result) => {
      // if (err) ...
      res.render("delete", { model: result.rows[0] });
    });
  });

// POST /delete/5
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const customer = [req.body.cusId, req.body.cusFname, req.body.cusLname,req.body.cusState,req.body.cusSalesYTD,req.body.cusSalesPrev];
    const sql = "UPDATE customer SET ID = $1, FName = $2, LName = $3, State = $4, SalesYTD = $5, PrevYearSales = #6 WHERE (cusId = $1)";
    pool.query(sql, customer, (err, result) => {
      // if (err) ...
      res.redirect("/customer");
    });
  });

// GET /delete/5
app.get("/Create Customer/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM customer WHERE cusId = $1";
  pool.query(sql, [id], (err, result) => {
    // if (err) ...
    res.render("Create Customer", { model: result.rows[0] });
  });
});

// POST /delete/5
app.post("/Create Customer/:id", (req, res) => {
  const id = req.params.id;
  const customer = [req.body.cusId, req.body.cusFname, req.body.cusLname,req.body.cusState,req.body.cusSalesYTD,req.body.cusSalesPrev];
  const sql = "UPDATE customer SET ID = $1, FName = $2, LName = $3, State = $4, SalesYTD = $5, PrevYearSales = #6 WHERE (cusId = $1)";
  pool.query(sql, customer, (err, result) => {
    // if (err) ...
    res.redirect("/customer");
  });
});

app.get("/import", (req, res) => {
  res.render("import");
});

app.post("/import",  upload.single('Input1'), (req, res) => {
   if(!req.file || Object.keys(req.file).length === 0) {
       message = "Error: Import file not uploaded";
       return res.send(message);
   };
   //Read file line by line, inserting records
   const buffer = req.file.buffer; 
   const lines = buffer.toString().split(/\r?\n/);

   lines.forEach(line => {
        //console.log(line);
        customer = line.split(",");
        //console.log(product);
        const sql = "INSERT INTO customer(ID, Fname, Lname, State, SalesYTD, PrevYearSales) VALUES ($1, $2, $3, $4, $5, $6)";
        pool.query(sql, customer, (err, result) => {
            if (err) {
                console.log(`Insert Error.  Error message: ${err.message}`);
            } else {
                console.log(`Inserted successfully`);
            }
       });
   });
   message = `Processing Complete - Processed ${lines.length} records`;
   res.send(message);
});

app.get("/output", (req, res) => {
  var message = "";
  res.render("output",{ message: message });
 });
 
 
 app.post("/output", (req, res) => {
     const sql = "SELECT * FROM customer ORDER BY cusId";
     pool.query(sql, [], (err, result) => {
         var message = "";
         if(err) {
             message = `Error - ${err.message}`;
             res.render("output", { message: message })
         } else {
             var output = "";
             result.rows.forEach(customer => {
                 output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate}, ${customer.cussalesytd}, ${customer.cussalesprev}\r\n`;
             });
             res.header("Content-Type", "text/csv");
             res.attachment("export.csv");
             return res.send(output);
         };
     });
 });