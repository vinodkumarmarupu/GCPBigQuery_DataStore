var express = require('express');
var router = express.Router();
var JOI = require('joi');
var joi = require('../schemas/joi.validation');
var BigQuery = require('@google-cloud/bigquery');

var datastore = require('@google-cloud/datastore')({
    projectId: 'superb-watch-172816',
    keyFilename: './MyProject-bbc9fa271136.json'
});


/* GET users listing using BigQuery. */
router.get('/bigQuery/users', function(req, res, next) {
    var id = req.query.userIds;
    var limit = req.query.limit;
    var offset = req.query.offset;
    var fields = req.query.fields;
    /*var fields = (req.query.fields).replace(/[^0-9\.,]/g, "");
	console.log(fields);
	*/

    var sqlQuery = "";

    var res1 = id.toString().split(",");
    console.log(res1);
    /* var data="";
    for(var i=0;i<res1.length;i++){
    	data+="'" + res1[i] + "'";
    	
    } */


    var data = "'" + res1.join("','") + "'";
    console.log(data);
    //console.log(limit);
    if (limit == undefined && offset == undefined && fields == undefined) {
        console.log("only limit");
        //sqlQuery = "SELECT * FROM dataset1.Devicedata WHERE machine_Name=" + "'" + id + "'"
        sqlQuery = "SELECT * FROM SCCM_Data.user_details  where User_Id in (" + data + ")"

        console.log(sqlQuery);

    } else if (limit && offset && fields == undefined) {
        console.log("limit and offset");
        //sqlQuery = "SELECT * FROM dataset1.Devicedata WHERE machine_Name=" + "'" + id + "' limit " + limit + " offset " + offset
        sqlQuery = "SELECT * FROM SCCM_Data.user_details  where User_Id in (" + data + ")limit " + limit + " offset " + offset
    }
    /*else if(offset && limit == undefined){
    		 console.log("only offset");
     sqlQuery = "SELECT * FROM dataset1.Devicedata WHERE machine_Name="+"'"+id+"' offset "+offset 
    	 }*/
    else if (limit && fields) {
        console.log("limit and fields defined");
        sqlQuery = "SELECT " + fields + " FROM SCCM_Data.user_details  where User_Id in (" + data + ")limit " + limit

    } else if (limit && fields && offset) {
        console.log("all three defined");
        sqlQuery = "SELECT " + fields + " FROM SCCM_Data.user_details  where User_Id in (" + data + ")limit " + limit + " offset " + offset

    } else if (fields) {
        console.log("fields defined");
        sqlQuery = "SELECT " + fields + " FROM SCCM_Data.user_details  where User_Id in (" + data + ")"

    } else {
        console.log("limit defined");
        sqlQuery = "SELECT * FROM SCCM_Data.user_details  where User_Id in (" + data + ")limit " + limit

    }

    // Instantiates a client
    const bigquery = BigQuery({
        projectId: 'superb-watch-172816',
        keyFilename: './MyProject-bbc9fa271136.json'
    });

    const options = {
        query: sqlQuery,
        useLegacySql: false // Use standard SQL syntax for queries.
    };

    // Runs the query

    bigquery
        .query(options)
        .then((results) => {
            const rows = results[0];
            //console.log(rows);
            var users = [];
			for( var index in rows){
				if(rows.hasOwnProperty(index)){
					users.push({
						"userId": rows[index].User_Id,
						"firstName": rows[index].First_Name,
						"lastName": rows[index].Last_Name,
						"fullName": rows[index].Full_Name,
						"emailAddress": rows[index].Email_Address,
						"deptNumber": rows[index].Dept_Number,
						"userActive": rows[index].User_Active,
						"siteNumber": rows[index].Site_Number,
						"managerId": rows[index].Manager_Id,
						"jobTitle": rows[index].Job_Title,
						"userDn": rows[index].User_Dn,
						"insertDate": rows[index].Insert_Date
					})
				}
			}
			var userData = {
			"metadata": {
							"count": rows.length,
							"limit": limit,
							"offset": offset
						},
						"users": users
		   }
		   joiValidation(userData, joi, function(response) {
				console.log("JOI")
				res.send(response);
           
            });
           
        })
        .catch((err) => {
            console.error('ERROR:', err);
            res.send(err)
        });
});

var joiValidation = function(response, joi, callback) {
    JOI.validate(JSON.stringify(response), joi, function(err, value) {

        if (err) {
            callback(err);
        } else {
            callback(value);
        }
    });
};

router.get('/dataStore/users', function(req, res, next) {
    console.log("newloop");
    var userId = req.query.userId;
	var limit = req.query.limit;
    var offset = req.query.offset;
    var fields = req.query.fields;
	
    var query = "";
    console.log(userId);
    if (userId)

    {
        query = datastore.createQuery('User50records')
            .filter('userId', '=', userId);
    } else {
        if (limit) {
        var lim = limit;
    } else {
        lim = 1000;
    }

    if (offset) {
        var off = offset;
    } else {
        off = 0;
    }

    if (fields) {
        console.log("in fields");
		var fields1 = fields.toString().split(",");
		console.log(fields1);
        query = datastore.createQuery('User50records')

            .limit(parseInt(lim))
            .offset(parseInt(off))
            .select(fields);

    } else {
        console.log("not in fields");
        query = datastore.createQuery('User50records')

            .limit(parseInt(lim))
            .offset(parseInt(off));
    }
    }
    datastore.runQuery(query)
        .then((results) => {
            const tasks = results[0];
            tasks.forEach((task) => {
                const taskKey = task[datastore.KEY];
                console.log(taskKey.id, task);
            });
            res.send(
			{"metadata": {
                    "count": tasks.length,
                    "limit": limit,
                    "offset": offset
            },
			"users": tasks
			});

        })
        .catch((err) => {
            console.error('ERROR:', err)
            res.send(err)
        });


    //.select(['fullName']);


});

module.exports = router;