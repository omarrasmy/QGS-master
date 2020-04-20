const Question= require('../models/Question')
const Distructor=require('../models/distractors')
const Complete= require('../models/complete')
const TrueOrFalse = require('../models/TrueOrFalse')
const DistructorController=require('../Controllers/distructor')
const MCQ= require('../models/mcq')
const DomainController=require('../Controllers/domain')


// edit Question
exports.EditQuestion=async(req,res)=>{
    const allowed=['Question','Level','state','keyword','distructor','distructors']
    const updates=Object.keys(req.body)
    const isValidOperation=updates.every((update)=>allowed.includes(update))
    if(! isValidOperation){
        res.status(404).send({error:'Not exisited properity'})

    }
    try{
        const question=await Question.findOne({_id:req.params.id})
        if(!question){
            return res.status(404).send('there is no such a question to be updated')
        }
        if(req.body.distructor){
        if(question.kind==='T/F'){
          const distructor= await DistructorController.Edit_distructor(question.distructor,req.body.distructor)
          req.body.distructor=distructors
           
          

        }}
        if(req.body.distructors){
            if(question.kind==='MCQ'){
               for( i=0;i<req.body.distructors.length;i++){
                const distructor= await DistructorController.Edit_distructor(question.distructors[i],req.body.distructors[i])
                req.body.distructors[i]=distructor


               }
            }
        }
        
        updates.forEach((update)=>question[update]=req.body[update])
        question.save()
        res.send(question)
    }catch(e){
        console.log(e)
        res.status(500).send(e)

    }


}
//Delete Question
exports.DeleteQuestion=async(req,res)=>{
    const question= await Question.findOne({_id:req.params.id})

    try{
        if(!question)
        {
          return  res.status(404).send('Not found')
        }
        if(question.kind==='Complete')
        {
          await question.remove()
         return res.status(200).send(question)

        }
        if(question.kind==='T/F'||'MCQ'){
         console.log(question.distructor)
        
        for (let index = 0; index < question.distructor.length; index++) {
            await  DistructorController.removeFromDistructor(question._id,question.distructor[index])

            
        }
            await question.remove()

            return res.status(200).send(question)
        }
    }
catch(e){
    console.log(e)
    res.status(500).send(e)

    
}
}
//Add Question Manually
exports.Add_Question_Manually= async(req,res)=>{
    try{
        //select domain
     const domain=await DomainController.Selectdomain(req.body.domain_name)
    const Type_of_Question= req.params.kind

    if(Type_of_Question==='mcq'){ 
        // Adding Distructors 
        const Array_of_distructors=[]
        const Add_Distructors=async()=>{
            const dis=req.body.add_distructors
            for (i = 0; i < 3; i++) {
                const distructor =await DistructorController.addDistructor(dis[i])
                 Array_of_distructors.push(distructor)
                }

                  return Array_of_distructors
                }
        // filling mcq Question Object
          const mcq= new MCQ({
            ...req.body,
            distructor: await Add_Distructors(),
            time:Date.now(),
            owner:req.instructor._id,
            domain

        })
        // saving question in database
           await mcq.save()

            // Linking distructors to that question
            Array_of_distructors.forEach((d)=>{
            DistructorController.LinkDistructorToQuestion(d,mcq._id)})
            
           // retrun question after populating it
           const m = await MCQ.findOne({_id:mcq.id}).populate({
               path:'domain',
               select:'domain_name'
           }).populate({
               path:'owner',
               select:'Email'
           }).populate({
               path:'distructors',
               select:'distructor'
           })

           return res.status(201).send(m)
            }
     if(Type_of_Question==='complete'){

            const complete= new Complete({
                ...req.body,
                time:Date.now(),
                owner:req.instructor._id,
                domain,
            })
            await complete.save()
            res.status(201).send(complete)}

            if(Type_of_Question==='trueorfalse'){

                const question= new TrueOrFalse({
                    ...req.body,
                    distructor: await DistructorController.addDistructor(req.body.add_distructor),
                    time:Date.now(),
                    owner:req.instructor._id,
                    domain

                })
                await question.save()
                await DistructorController.LinkDistructorToQuestion(question.distructor,question._id)
            // retrun question after populating it
           const m = await TrueOrFalse.findOne({_id:question._id}).populate({
            path:'domain',
            select:'domain_name'
        }).populate({
            path:'owner',
            select:'Email'
        }).populate({
            path:'distructor',
            select:'distructor'
        })
             return  res.status(201).send(m)}        
}catch(e){
    console.log(e)
    res.status(500).send(e)}} 


//get ids
exports.Get_ids=async(questions)=>{
    
   const _ids=[]
   for (let index = 0; index < questions.length; index++) {
        _ids[index] = await questions[index]._id
       
   }
   return _ids

}


//List Question - kont bgrb beha haga Not an required function-
exports.List_Question= async()=>{
    const Array_of_ids=[]
    const Questions=await Question.find({})
    if(!Questions){
        throw new Error('No Questions yet')
    }
     for(i=0;i<Questions.length;i++){
         Array_of_ids[i]=Questions[i]._id

     }
     
     return Array_of_ids
    
}
//List Questions route 
exports.List_Questions=async(req,res)=>{
    try{
    const Array_of_Question=[]
    const Questions=await Question.find({owner:req.instructor._id})
    if(Questions.length===0){
        res.status(404).send('No added Question ')
    }
     for(i=0;i<Questions.length;i++){
         Array_of_Question[i]=Questions[i].Question}

     res.status(200).send(Array_of_Question)

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
    

}
//getQuestions  -function takes ids and return questions-

exports.get_Questions=async(ids)=>{
    const Array_of_Question=[]
    for (let index = 0; index < ids.length; index++) {
        Array_of_Question[index] = await Question.findOne({_id:ids[index]})
        
        
    }
   return Array_of_Question

}
//retrun all questions in questionbank
exports.get_question_bank = async (req, res) => {
    try {
        const domain = req.params.domain_id
        let QB;
        if (domain === 'all') {
             QB = await Question.find({ public: true }).populate({
                path: 'domain',
                select: 'domain_name'

            })
        }
        else {
            

             QB = await Question.find({ public: true, domain: domain }).populate({
                path: 'owner',
                select: 'Email'
            }).populate({
                path: 'domain',
                select: 'domain_name'

            })
        }
        if (QB.length === 0) {
            console.log('wrong')
            res.status(404).send('No Questions in QB')
        }
        console.log(QB)
        res.status(200).send(QB)

    } catch (e) {
        console.log(e)
        res.status(500).send(e)

    }
}


exports.Add_Questions_to_QB=async(req,res)=>{
    try{
 // get all questions
    const Questions= await this.get_Questions(req.body.ids)
  // check if they are already in QB or not if not put them in new array -private questions-  
   const private_questions= Questions.filter((q)=> q.public===false)
   // add them to QB
    for (let index = 0; index < private_questions.length; index++) {
        private_questions[index].public=true
        await private_questions[index].save()
       res.status(200).send('your questions are added in QB .. ')  
    }

}catch(e){
    console.log(e)
    res.status(500).send(e)
}
}

exports.select_Question_from_QuestionBank=async(req,res)=>{
    try{
        const question=await Question.findOne({public:true,domain:req.params.domain_id,_id:req.params.id})
        if(!question){
           return res.status(404).send()
        }
        res.status(200).send(question)

    }catch(e){

        console.log(e)
        res.status(500).send(e)
    }

}



