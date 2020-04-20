const express=require('express')
const router=new express.Router()

const{Auth,AdminAuth} =require('../middleware/Auth')
const QuestionController=require('../Controllers/Question')


// Add Question Manually
router.post('/question/add/:kind',Auth,QuestionController.Add_Question_Manually)

//Delete Question
router.delete('/Question/delete/:id',Auth,QuestionController.DeleteQuestion)

//Edit Question
router.patch('/question/edit/:id',Auth,QuestionController.EditQuestion)
//List Question
router.get('/question/List',Auth,QuestionController.List_Questions)

//get QB -user-
router.get('/questionbank/:domain_id',Auth,QuestionController.get_question_bank)
 //get QB
router.get('/admin/questionbank/:domain_id',AdminAuth,QuestionController.get_question_bank)

//add questions to QB
router.post('/questionbank/add',Auth,QuestionController.Add_Questions_to_QB)

//select question from question bank

router.get('/questionbank/:domain_id/:id',Auth,QuestionController.select_Question_from_QuestionBank)

module.exports=router