# Practice Page
* This page has sections that lead to other pages (Sub categories in the sidebar)

## Sign Categories
* These are grids of cards that show the sign category that the user can choose to practice MSL on (e.g. everyday conversations, emergency communication, formalities, etc.) And each module under these categories will be a specific sentence that pertains to that category. 
- The sign category cards should show:
    - Image (Uploaded by developer when create the sign category in developer mode page) to describe the sign category
    - Sign category title
    - Description (What it is and why it is useful for learning)
    - Number of modules under this sign category
    - Browse now button

---

## Sign Modules
* This page shows the grid of module cards under the sign category card that the user has clicked on (Shown as sign language category under Practice in the side bar that the user can directly navigate to if they want)
- Each sign module card should show: 
    - The MSL gloss sequence (e.g. "You eat when")
    - The intended sentence (e.g. continuation from the gloss sequence - "When did you eat")
    - Module difficulty (Easy, Moderate, Hard)
    - Try now button

---

## Module Practice Mode
* Clicking on the module brings up this page (Not shown in sidebar, and can only be navigated via the module button 'Try now' button click). It should be a large pop up screen that covers 80% of the page below it. It should be brought to focus, blur out the page underneath it, and can only exit if the user clicks on the button "Exit Practice"
- There are 3 main sections in this pop up page:
    - Webcam capture: Displays the user webcam so that they can see how they are signing
    - Signing sequence: The sequence of MSL glosses configured for this module (Located just below the webcam view). It should have a fixed size, where longer glosses should not overflow and there will be horizontal scrollbar
    - Signing Accuracy Score : A circular progress bar adjacent UI to the right of the Webcam that shows how accurately the user is signing the current gloss (grey). When it reaches a certain threshold, say 80%, current gloss turns glowing green and move to the next gloss. This repeats until the final gloss is signed correctly. Context from TECHNICAL.md
    - Below the signing accuracy score shows the top 5 predicted gloss (Context From TECHNICAL.md)
- Start button to start the practice session
- Pause button to pause the practice session
- Exit button to exit the session and return to the modules page
* The pipeline overview goes like this: Module is clicked -> Opens up websocket connection with the server -> server received stream of user webcamm image -> Mediapipe hand and pose landmark extraction -> Model inference -> Send score back to frontend for display. The technical aspect of this will be explained more in the TECHNICAL.md file.