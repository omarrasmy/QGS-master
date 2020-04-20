const express=require('express')
const router= new express.Router()
const Notifications=require('../middleware/Auth')
const NotificationController=require('../Controllers/Notifications')



//List Admin Notification
router.get('/Admin/ListMyNotification/:Reciver_Email',Notifications.AdminAuth,NotificationController.ListSpecificNotification)


//List Instructor Notification
router.get('/Instructor/ListMyNotification/:Reciver_Email',Notifications.Auth,NotificationController.ListSpecificNotification)

//Seen Notification
router.get('/Admin/SeenNotification/:id',Notifications.AdminAuth,NotificationController.SeenNotification)
router.get('/Instructor/SeenNotification/:id',Notifications.Auth,NotificationController.SeenNotification)

//Push Notification
router.post('/Admin/subscribe',Notifications.AdminAuth,NotificationController.PushNotification)
router.post('/Instructor/subscribe',Notifications.Auth,NotificationController.PushNotification)


module.exports = router