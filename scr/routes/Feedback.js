const express= require('express')
const router=new express.Router()
const FeedbackController= require('../Controllers/Feedback')
const Auth=require('../middleware/Auth')


//Write(send) feedback
router.post('/feedback/write',Auth.Auth,FeedbackController.write_feedback)
//receive feedback
router.get('/admin/feedbacks',Auth.AdminAuth,FeedbackController.List_Feedbacks)
module.exports=router