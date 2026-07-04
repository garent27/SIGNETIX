# Overview
* This file describes the general concept of what the website you will be building actually is
* Before that, even though CLAUDE.md mentions mobile responsiveness, this project does not need mobile view (for now), so don't waste time and tokens on that for the time being

- Name : Signetix (A real time Malaysian Sign Language [MSL] learning platform)
- Problem statement:
    - A lot of American Sign Langauge (ASL) applications, little to no MSL
    - Numerous apps focus on text to sign and sign to text, little focus on actual practice
    - Actual practice for MSL is lacking, as in, practical sessions where users get to sign and a system immediately lets them know their progress / whether they did it correctly or not. 
- Opportunity:
    - Signetix is a MSL learning platform that fills that gap
    - Flexible lessons for users to interactively learn how to sign in MSL 
        - Flexible because the lessons are not fixed to a curriculum. There is user mode and developer mode. Developer mode can add more sign language practices
- General idea of what the practice mode is:
    - Practice mode : 
        - There is a page of sign language categories (Created by developer end) cards. Click on the Card should lead to different practice / test modules.
        - These are sentences related to the category from earlier. Maybe the category is "Everyday conversations" and each modules will be a dedicated sentence like "Have you eaten today?", "How was your day?". 
        - Clicking on the module and confirming to start the practice mode will open up the practice mode screen. It shows the user webcam capture with the sentence underneath (arranged in MSL glosses). 
        - Right hand side will be a circular progress chart showing how accurately the user is signing the current word in the MSL gloss sentence. Once it reaches a threshold, the gloss is done (turns green), then move on to the next word, and then the next.
