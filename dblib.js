// Add packages
require("dotenv").config();
// Add database package and connection string
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customer";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};


const findCustomers = (customer) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 1;
    params = [];
    sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build query as necessary
    if (customer.cusId !== "") {
        params.push(parseInt(customer.cusId));
        sql += ` AND cusId = $${i}`;
        i++;
    };
    if (customer.cusFname !== "") {
        params.push(`${customer.cusFname}%`);
        sql += ` AND UPPER(cusFname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusLname !== "") {
        params.push(`${customer.cusLname}%`);
        sql += ` AND UPPER(cusLname) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusState !== "") {
        params.push(`${customer.cusState}%`);
        sql += ` AND UPPER(cusState) LIKE UPPER($${i})`;
        i++;
    };
    if (customer.cusSalesYTD !== "") {
        params.push(parseFloat(customer.cusSalesYTD ));
        sql += ` AND cusSalesYTD  >= $${i}`;
        i++;
    };
    if (customer.cusSalesPrev !== "") {
        params.push(parseFloat(customer.cusSalesPrev ));
        sql += ` AND cusSalesPrev  >= $${i}`;
        i++;
    };

    sql += ` ORDER BY cusId`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
             
            }
           
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

//export
module.exports.findCustomers = findCustomers;
module.exports.getTotalRecords = getTotalRecords;