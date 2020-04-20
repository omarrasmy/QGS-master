const Exam=require('../models/Exam')
const DomainController=require('../Controllers/domain')
const QuestionController=require('../Controllers/Question')

//Add New Exam
exports.Add_New_Exam=async(req,res)=>{
    try{
        //select domain
        const domain=await DomainController.Selectdomain(req.body.domain_name)
        
        // select Questions
        const Selected= await QuestionController.Select_Questions(['5e8492e760f56f13b027eb0b','5e8492b260f56f13b027eb09'])
    
        //exam object
        const exam= new Exam({
            ...req.body,
            owner: req.instructor._id,
            domain,
            Questions:await QuestionController.Get_ids(Selected)
            
            
            
        })

        await exam.save()

        const return_exam = await Exam.findOne({_id:exam._id}).populate({
            path:'Questions',
            select:'Question'

        }).populate({
            path:'owner',
            select:'Email'
        }).populate({
            path:'domain',
            select:' domain_name'
        })
        res.status(201).send(return_exam)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }

}

//veiw past exams
exports.View_Past_Exams=async(req,res)=>{
    try{
        await req.instructor.populate('Exams').execPopulate()
        res.send(req.instructor.Exams)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
    
}
//selete exam
exports.Select_Exam=async(req,res)=>{
    try{
        const exam = await Exam.findOne({_id:req.params.id}).populate({
            path:'owner',
            select:'Email'
        }).populate({
            path:'domain',
            select:'domain_name'
            
        }).populate({
            path:'Questions',
            select:'Question'
        })
        if(!exam){
            return res.status(404).send('No Such an Exam')

        }
        res.status(200).send(exam)

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
}
// Delete Exam
exports.Delete_Exam=async(req,res)=>{
    try{
        const exam=await Exam.findOne({_id:req.params.id})
        if(!exam){
            res.status(404).send('There is no such an exam!!')
        }
       await exam.remove()
       res.status(200).send(exam)

    }catch(e){
        console.log(e)
        res.status(500).send(e)

    }

}
//get all questions of exam
exports.Search_exam=async(_id)=>{
    const Array_of_Questions=[]
    const exam = await Exam.findOne({_id}).populate('Questions','Question')
    console.log(exam.Questions)
    
    for (let i = 0; i<exam.Questions.length ;i++) {
         Array_of_Questions[i]=exam.Questions[i].Question
       
        
    }
    
return Array_of_Questions    
    
    

}
//select Question from exam
// exports.Select_Question_from_Exam=async(question_id)=>{
//     const q
// }
// exports.Search_Question=async()


//select questions from past exams
exports.Select_Question_from_Exam=async(req,res)=>{
    try{
        const exam= await this.Search_exam(req.params.id)
       return exam.Questions
        


    }catch(e){
        console.log(e)
        res.status(500).send(e)

    }

    

}

//Edit Exam 
//print exam
//generate exam
//add questions of exam to Question bank






