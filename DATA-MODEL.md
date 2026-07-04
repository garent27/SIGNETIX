# Data Model
* This file describes the data relationship among different components and aspect of Signetix

## User (can be ignored for now, can just have a button at the start to toggle between user and developer mode)

## SL_CATEGORY
* The category where MSL gloss sentences of the same type will be under. For instance, "everyday conversations" category will have sign modules like "have you eaten today", "how was your day today"
- sl_category_id
- sl_category_name (UNIQUE)
- sl_category_desc ## Describes the types of sign language modules that it will contain and why it is useful
- sl_category_img ## To be used to display the image of the sign category
- sl_category_quantity ## The number of modules under this sign category
- sl_category_status (1 (Active), 0 (Not Active)) ## Ready or not ready to show yet

## SL_MODULE
* The sign language practice modules themselves. It contains all the information about the kind of practice the user will be doing when this is clicked in the website
- sl_module_id
- sl_module_category_id (FOREIGN KEY FOR SL_CATEGORY)
- sl_module_sentence ## The actual sentence (What the gloss actually means, e.g. "How are you feeling now")
- sl_module_gloss_sentence (No need to reference the GLOSS table) ## The glosses that will be displayed for the user to sign during practice (e.g. From the sentence, "you feeling how")
- sl_module_difficuly (E (Easy), M (Moderate), H (Hard))

## GLOSS
* The MSL glosses that the current model can predict / classify
- gloss_id
- gloss_name
- gloss_link ## The link to BIM sign bank page that explains how this gloss should be done


## TO BE CONTINUED
* There will be other tables and objects to come later on. But for the sake of MVP. This will do for now
