# Project-Q-backend

Backend for project Q for HG Hackathon.

## API end points

### Login

Get:
"/login"
returns the index page.

Post:
"/login"
Request body required fields:

- email
- password

Authenticates the user and returns user data.

### Register

Get:
"/register"
Gets the register page

Post:
"/register"
Request body required fields:

- firstName
- lastName
- email
- password

### Logout

Delete:
"/logout"
Logs out the user

### User

Get:
'/user/email=:email'
Requires email in the url parameters.
returns user with matching email.

'/user/id=:id'
Requires id in the url parameters.
returns user with matching id.

'/user/:id/answers'
Requires id in the url parameters.
returns user with matching id.

Post:
'/user/:id/answer'
Requires id in the url parameters.
Add a new journal entry to the user's data with id.
