# API
* This page contains the API calls that will be made in Signetix between frontend and backend. But there might be missing calls here due to human error. So if there is some functionality that requires API call that is not listed here, it is ok to just go ahead and implement it. This here is just an idea and overview


##  GET /sign-categories/
- Retrieve all the sign categories

## GET /sign-categories/{sign-category-id}
- Retrieve the specific sign category

##  GET /sign-categories/{sign-category-id}/modules
- Retrieve all the sign modules from a specific sign category

##  GET /modules/{module-id}
- Retrieve the specific module metadata 

## POST /sign-categories
- Create a new sign category

## POST /sign-categories/{sign-category-id}/modules
- Create a specific sign module

## UPDATE /sign-categories/{sign-category-id}
- Update an existing sign category

## UPDATE /modules/{module-id}
- Update an existing sign module

* There is also websocket api connection that will be explained in more detail in the content/TECHNICAL.md file.