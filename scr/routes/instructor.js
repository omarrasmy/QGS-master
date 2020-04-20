const express = require('express')
const Auth=require('../middleware/Auth')
const instructorController=require('../Controllers/instructor')
const router = new express.Router()
const Notify=require('../middleware/Notify')

// send Account request 
router.post('/instructor/signup',instructorController.Send_SingnUp_Request)

//Login 
router.post('/instructor/login',instructorController.Login)  

//upload resources
router.post('/upload/resources',Auth.Auth,Notify.GetNumberOfNotification,instructorController.resource.single('resource'),instructorController.enterResources)


//upload image
router.post('/upload/profilePicture',Auth.Auth,Notify.GetNumberOfNotification,instructorController.image.single('image'),instructorController.UploadProfilePicture)

// read his profile
router.get('/instructor/me',Auth.Auth,Notify.GetNumberOfNotification,instructorController.ReadProfile)

// Delete  his own account 
 router.delete('/instructor/delete',Auth.Auth,Notify.GetNumberOfNotification,instructorController.deleteAccount)

 //send feedback to Admin -done look at feedback route-

 //logout 
 router.post('/instructor/logout',Auth.Auth,Notify.GetNumberOfNotification,instructorController.Logout)

 //logout from all devices
  router.post('/instructor/logoutfromall',Auth.Auth,Notify.GetNumberOfNotification,instructorController.logoutFromAllDevices)

  //fetch pic on web 
router.get('/instructor/:id/pic',instructorController.fetcProfilePicture)

router.patch('/instructor/editme:password',Auth.Auth,Notify.GetNumberOfNotification,instructorController.editInstructorProfile)





 


module.exports=router

