

// load the express 
var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const apiEndPoint = "http://127.0.0.1:5000/api/"; // assign a const to call api from port 8080 --> just need to change path for differnt pages


// required module to make calls to a REST API
const axios = require('axios');

//to display alert messages
let alert = require('alert');


app.use(bodyParser.urlencoded());
// set the view engine to ejs
app.set('view engine', 'ejs');




// when application firstrun redirect to home page
app.get("/", function (req, res) {
    LoadHomePage(res);
});

//for manage-destination page
//this will call the api '/api/destination/all' from sprint1.py file and list all destination there --> it is also a homepage for out GUI
app.get('/destination', function (req, res) {    //get method to show all destination on homepage
});
function LoadHomePage(res) {
    let results = [];
    // connecting python API --> apiEndPoint const we defined above
    axios.get(apiEndPoint + 'destination/all') //calling all the available destinations from destination/api and render them to mange-destination.ejs page
        .then((response) => {
            if (response && response.data) {
                results = response.data;
                res.render("pages/destination/manage-destination.ejs", { data: results });//render the results in manage-destination.ejs page to show all data and add new destination button
            }
            else {
                res.render("pages/destination/manage-destination.ejs", { data: results });
            }
        });
}

//display all available trips in /trip page using get method
app.get('/trip', function (req, res) {
    let results = [];   //hold results into a variable
    axios.get(apiEndPoint + 'trip/all')      //calling /trip/all api from python file to show all trip using get method
        .then((response) => {
            if (response && response.data) {
                results = response.data;     //adding all available trips in results
                res.render("pages/trip/manage-trip.ejs", { data: results, message: null });   //render the data manage-trip.ejs page to show data and add new trip button
            }
            else {
                res.render("pages/trip/manage-trip.ejs", { data: results, message: null });
            }
        });
});

//Adding a new destination to the destination table from GUI
app.get('/add-destination', function (req, res) {    //get method to show the elements of the add-destination.ejs page in browser
    res.render("pages/destination/add-destination.ejs", { data: null }); //render new destination to add-destination.ejs page
});
// redirecting to the api/destination from python file, and adding destination in the database
app.post('/add-destination', function (req, res) {    //post method to add new destinations in GUI and Database
    axios.post(apiEndPoint + 'destination', req.body)   //calling destination api in POST method to add new destinations in the Databse
        .then((response) => {
            res.redirect('/destination');   //After adding new destinations it will redirect to the /destination page in browsser
        });
});

//edit destination in destination table from GUI based on ID using get method
app.get('/edit-destination/:id', function (req, res) {    //get method to show elemets in edit-destination page in browser based on id provided
    const id = req.params.id;
    axios.get(apiEndPoint + 'destination/' + id)    //using destination id, showing the name related to id using get method
        .then((response) => {
            if (response && response.data) {
                results = response.data;
                res.render("pages/destination/edit-destination.ejs", { data: results });  //redner the selected destination based on id and showing buttons and text box for edit in edit-destination.ejs page
            }
            else {
                res.render("pages/destination/edit-destination.ejs", { data: results });
            }
        });
});


//using post method to edit the selected destination based on id selected in above API
app.post('/edit-destination', function (req, res) {
    axios.patch(apiEndPoint + 'destinationupdate', req.body)  //calling destinationupdate API from python file
        .then((response) => {
            res.redirect('/destination');   //after updating the destination, the browser will redirect to the /destination page or homepage (Because both are same)
        });
});

//Deleting the destination based on id
app.get('/deletedestination/:id', function (req, res) {   //get method to show delete-destination based on id ()
    try {
        const id = req.params.id;
        //calling deletedestination api from Python file and using delete method to delete destination based on id
        axios.delete(apiEndPoint + "deletedestination/" + id).then(
            (response) => {
                //destination and trip are connected with foreign keys. So if destination have any trip assosiated with them then it will not delete and give an alert. If destination does not have any trips associated their id then it will be deleted.
                if (response.data == "False") {
                    alert("You cannot delete this destination! This destination is assigned to trip(s)! Please remove the associated trip(s) first!")
                }
                res.redirect('/destination');   //after delete/alert it will be redirected to /destination page in browser
            });
    }
    catch {
        console.log('in exception')
        alert("You cannot delete this destination! This destination is assigned to trip(s)! Please remove the associated trip(s) first!")
    }

});


//Adding a new trip 
// using get method to show the text box and buttons available in /add-trip page in browser
app.get('/add-trip', function (req, res) {
    let destinations = [];
    axios.get(apiEndPoint + 'destination/all')     //calling destination/all api from python file to show all destination in add-trip page then trip can be added by the destinations
        .then((response) => {
            if (response && response.data) {
                destinations = response.data;
                res.render("pages/trip/add-trip.ejs", { destinations: destinations, message: null });   //rendering the data in add-trip.ejs page
            }
        });

});


//using post method adding a new trip in add-trip page
app.post('/add-trip', function (req, res) {
    axios.post(apiEndPoint + 'trip', req.body)
        .then((response) => {
            response.data == "True"
            res.redirect('/trip');     //after adding the trip, the browser will redirect the /trip page
            
        });
});

//edit the trip in trip table from GUI based on ID using get method
app.get('/edit-trip/:trip_id', function (req, res) {    //get method to show elemets in edit-trip page in browser based on id provided
    //get destinations
    try {
        let destinations = [];
        const trip_id = req.params.trip_id;
        axios.get(apiEndPoint + 'destination/all')
            .then((response) => {
                if (response && response.data) {
                    destinations = response.data;
                    //get trip data
                    axios.get(apiEndPoint + 'trip/' + trip_id)  //using trip_id, showing the transportation related to id using get method
                        .then((rresponse) => {
                            if (rresponse && rresponse.data) {
                                results = rresponse.data;
                                //redner the selected trip and showing buttons and text box for edit in edit-trip.ejs page
                                res.render("pages/trip/edit-trip.ejs", { data: results, destinations: destinations });
                            }
                            else {
                                res.redirect('/trip');
                            }
                        });
                }
            });
    }
    catch { }

});


//using post method to edit the selected trip based on id selected in above API
app.post('/edit-trip', function (req, res) {
    axios.patch(apiEndPoint + 'tripupdate', req.body)    //calling tripupdate API from python file
        .then((response) => {
            res.redirect('/trip');   //after updating the trip, the browser will redirect to the trip page
        });
});


//Deleting the trip based on id
app.get('/delete-trip/:trip_id', function (req, res) {
    const trip_id = req.params.trip_id;
    //calling deletetrip api from Python file and using delete method to delete destination based on id
    axios.delete(apiEndPoint + "deletetrip/" + trip_id).then((response) => {
        res.redirect('/trip');    //after delete it will be redirected to /trip page in browser 
    });
});


app.listen(8080, () => {
    console.log(
        `8080 is a Magic Port`);
});