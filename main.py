# Leira Salene
# Final Project
# 1785752

import hashlib
from mysql.connector import connect
from mysql.connector.connection import MySQLConnection
from mysql.connector import Error
# importing the queries to connect vscode to mysql
from sql import create_connection
from sql import execute_query
from sql import execute_read_query
# import flask library from python
import flask
# import jsonify to make the crub operations execute in JSON format
from flask import jsonify
from flask import request, make_response

# setting up an application name
app = flask.Flask(__name__) #sets up the application
app.config["DEBUG"] = True #allow to show errors in browser

# connection to aws
conn = create_connection(
    'cis3368.cjryivjdivtd.us-east-2.rds.amazonaws.com',  'admin', 'AWS!cis3368', 'cis3368db')

masterPassword = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
masterUsername = 'username1'
validokens = {
    "100", "200", "300", "400"
}

# route to authenticate with username and password against a dataset (ideally from database and also hashed, not clear strings for passwords)
# test in postman by creating header parameters 'username' and 'password' and pass in credentials
# default url to force user to login before continuing to make changes to tables
@app.route('/authenticatedroute', methods=['GET'])
def auth_example():
    if request.authorization:
        encoded = request.authorization.password.encode()  # unicode encoding
        hashedResult = hashlib.sha256(encoded)  # hashing
        if request.authorization.username == masterUsername and hashedResult.hexdigest() == masterPassword:
            return '<h1> WE ARE ALLOWED TO BE HERE </h1>'
    return make_response('COULD NOT VERIFY!', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})


# home url that returns canada trip when executed
@app.route('/', methods=['GET'])
def home():
    return "<h1> Vacation Destination </h1>"

## GET: all destination and trip
# retrieves all of the data from the destination table
@app.route('/api/destination/all', methods=['GET'])
def alldestination():
    request_data = request.get_json()
    destsql = "SELECT * FROM destination"
    destination = execute_read_query(conn, destsql)
    return jsonify(destination)

# retrieves the data from the trip table and executes it in json format using the return line
@app.route('/api/trip/all', methods=['GET'])
def alltrip():
    request_data = request.get_json()
    tripsql = "SELECT * FROM trip"
    trip = execute_read_query(conn, tripsql)
    return jsonify(trip)

## GET: specific destination and trip
# retrieves the data asked for from the destination table
@app.route('/api/destination/<id>', methods=['GET'])
def destinationid(id):
    request_data = request.get_json()
    did = request_data['id']
    destsql = "SELECT * FROM destination WHERE id = '%s'"%(did)
    destination = execute_read_query (conn, destsql)
    return jsonify(destination)

# retrieves data asked for from the trip table
@app.route('/api/trip/<id>', methods=['GET'])
def tripid(id):
    request_data = request.get_json()
    tripid = request_data['id']
    tripsql = "SELECT * FROM trip WHERE id = '%s'" % (tripid)
    trip = execute_read_query (conn, tripsql)
    return jsonify(trip)

## POST: add destination and trip into the tables
# add destination into the destination table
@app.route('/api/destination', methods=['POST'])
def destination(): 
    request_data = request.get_json()
    country = request_data['country']
    city = request_data['city']
    ss = request_data['sightseeing']
    destsql = "INSERT INTO destination (country, city, sightseeing) VALUES ('%s', '%s', '%s')" %(country, city, ss)
    execute_query(conn, destsql)
    return 'destination added successfully'

# add a trip 
@app.route('/api/trip', methods=['POST'])
def trip(): 
    request_data = request.get_json()
    did = request_data['destinationid']
    transportation = request_data['transportation']
    sd = request_data['startdate']
    ed = request_data['enddate']
    tripsql = "INSERT INTO trip (destinationid, transportation, startdate, enddate) VALUES ('%s', '%s', '%s', '%s)" %(destinationid, transportation, startdate, enddate)
    execute_query(conn, tripsql)
    return 'trip added successfully'

## DELETE: delete trip or destination from the sql tables
# delete destination of choice by id 
@app.route('/api/deletedestination/<destinationid>', methods=['DELETE'])
def deldestination(destinationid):
    request_data = request.get_json()
    did = request_data['id']
    did_check = "SELECT * FROM trip WHERE destinationid="%(did)
    if count==0:
        destsql = "DELETE FROM destination WHERE id = '%s'" % (did)
        execute_query(conn, destsql)
        return "destination successfully deleted"
    else:
        return "False"

# delete trip of choice by specifying id
@app.route('/api/deletetrip/<id>', methods=['DELETE'])
def deltrip(id):
    request_data = request.get_json()
    tid = request_data['id']
    tripsql = "DELETE FROM trip WHERE id = '%s'" % (tid)
    execute_query(conn, tripsql)
    return "trip successfully deleted"

## PUT: update existing information on tables destination and trip
# update the destination information based on the selected destination's id
@app.route('/api/destinationupdate', methods=['PATCH'])
def upddestination():
    request_data = request.get_json()
    did = request_data['id']
    country = request_data['country']
    city = request_data['city']
    ss = request_data['sightseeing']
    destsql = "UPDATE destination SET  country = '%s', city = '%s', sightseeing = '%s' WHERE id = '%s'" % (country, city, ss, did)
    execute_query(conn, destsql)
    return "destination successfully updated"

# update the destination information based on the selected destination's id
@app.route('/api/tripupdate', methods=['PATCH'])
def updtrip():
    request_data = request.get_json()
    tid = request_data['id']
    did = request_data['destinationid']
    transportation = request_data['transportation']
    sd = request_data['startdate']
    ed = request_data['enddate']
    tripsql = "UPDATE trip SET destinationid = '%s', transportation = '%s', startdate = '%s', enddate = '%s' WHERE id = '%s'" % (did, transportation, sd, ed, tid)
    execute_query(conn, tripsql)
    return "trip successfully updated"


app.run()