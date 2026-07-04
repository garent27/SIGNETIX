# Developer page 
* This page is only visible in the sidebar if the user clicks Developer mode button in the login page
- Allows developers to add / update / delete sign categories and add / update / delete the sign modules


## Sign category
- Add :  Developer need to fill in the name, the description, upload an image (to be rendered in the sign category card)
- Update : Developer can update the name, description and image
- Delete : Developer can recursively delete this sign category and all the modules that are under it

## Sign module
- Add : Developer need to select the sign category that this module falls under. They need to provide the module sentence (What the gloss sequence actually means) and also the module gloss sequence (The system must validate that the glosses are confined to words from the backend/assets2/label_map.json only).
    - Design idea: There can be a search bar to enter the gloss and the system quick filters the similar gloss available in the label map before the user completes the gloss spelling. When the right gloss is selected, it will be like a tag element at the bottom. So the completed gloss sequence will be like a row of tags. The user can cancel the tag to remove the gloss or drag and reorder the tags among themselves.
- Update : Developer can update the module sentence and gloss sequence
- Delete the sign module