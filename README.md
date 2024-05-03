# Mercury

## Project Description
Mercury is a University of Maryland combined semester planner and schedule builder. It is a web application running on a Node.js server framework using express and ejs, and interacts with a backend MongoDB database as well as calling the umd.io and Planetterp APIs.

Users first login to store their data, then can input their major, and previous courses/credit taken. After further user input, the algorithm plans out their semester schedule of classes. Users can then plan individual semester schedules.

## CMSC335 Information

This project was developed as a final project for CMSC335: Web Development.

Submitter: Alex Barker (abarker3)
Group Members: Alex Barker (abarker3)
App Description: allows users to create a 4 year plan and semester schedules
YouTube demo: TODO
API Information: umd.io (https://beta.umd.io/), Planetterp (https://planetterp.com/api/)
Contact email: abarker3@terpmail.umd.edu

## Functionality Summary

Current functionality:
- 

Planned functionality:
- convert PLC into equivalent credits by looking up db
* process courses already completed
* based on major, identify courses user still needs to take
- optimize course layout including prereqs
* find courses using api
* store user info in db using directory id
- keep track of login with cookies