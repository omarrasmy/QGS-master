const Question = require('../models/Question')
const Distructor = require('../models/distractors')
const Complete = require('../models/complete')
const TrueOrFalse = require('../models/TrueOrFalse')
const DistructorController = require('../Controllers/distructor')
const MCQ = require('../models/mcq')
const DomainController = require('../Controllers/domain')
const request=require('request')
const fs=require('fs')

//see new edit exist
exports.CheckEdited = async (myQuestion,id)=>{
    let dumy
    if(myQuestion.kind =='MCQ' ){
        dumy = await MCQ.findOne({Question:myQuestion.Question,kind:myQuestion.kind,keyword:myQuestion.keyword,distructor:myQuestion.distructor,owner:id}).populate({
            path: 'domain',
            select: 'domain_name'
        }).populate({
            path: 'owner',
            select: 'Email'
        }).populate({
            path: 'distructor',
            select: 'distructor'
        })
    }
    else if(myQuestion.kind == 'T/F'){
        dumy = await TrueOrFalse.findOne({Question:myQuestion.Question,kind:myQuestion.kind,keyword:myQuestion.keyword,distructor:myQuestion.distructor,owner:id}).populate({
            path: 'domain',
            select: 'domain_name'
        }).populate({
            path: 'owner',
            select: 'Email'
        }).populate({
            path: 'distructor',
            select: 'distructor'
        })

    }
    else{
        dumy = await Complete.findOne({Question:myQuestion.Question,kind:myQuestion.kind,keyword:myQuestion.keyword,owner:id}).populate({
            path: 'domain',
            select: 'domain_name'
        }).populate({
            path: 'owner',
            select: 'Email'
        })
    }
    return dumy
}

// edit Question
exports.EditQuestion = async (req, res) => {
   
    try {
        
        const question = await Question.findOne({ _id: req.params.id })
        let myQuestion
        if (!question) {
            return res.status(404).send('there is no such a question to be updated')
        }
        let distructor=[]
        let distcheck=[]
        let check
        let returned
       if(question.kind == 'MCQ' || question.kind == 'T/F'){
        for (var i=0;i<question.distructor.length;i++){
           // console.log(question.distructor[i])
            x=await Distructor.findById(question.distructor[i])
           // console.log(x)
            distructor.push(x)
            distcheck.push(x.distructor)
        }
        let Type_of_Question
        if(question.kind == 'MCQ'){
            Type_of_Question=question.kind.toLowerCase()
        }
        else{
            Type_of_Question= 'trueorfalse'
        }
        check = await this.checkQuestion(Type_of_Question,{Question:question.Question,distructor:distcheck,id:req.instructor._id},{ch1:false,ch2:true})
        }
        else{
        check = await this.checkQuestion(question.kind.toLowerCase(),{Question:question.Question,id:req.instructor._id},{ch1:false,ch2:true})
        }
            if(check){
                if(question.kind == 'MCQ'){
                     myQuestion= new MCQ({
                        distructor:question.distructor,
                        public:false,
                        kind:question.kind,
                        Level:question.Level,
                        Question:question.Question,
                        keyword:question.keyword,
                        owner:req.instructor._id,
                        domain:question.domain,
                        time: Date.now(),
                     })
                    // await myQuestion.save()
                }
                else if(question.kind =='T/F'){
                    myQuestion= new TrueOrFalse({
                        distructor:question.distructor,
                        public:false,
                        kind:question.kind,
                        Level:question.Level,
                        Question:question.Question,
                        keyword:question.keyword,
                        owner:req.instructor._id,
                        domain:question.domain,
                        time: Date.now(),
                        state:question.state
                     })
                   // await myQuestion.save()
                }
                else{
                    myQuestion= new Complete({
                        public:false,
                        kind:question.kind,
                        Level:question.Level,
                        Question:question.Question,
                        keyword:question.keyword,
                        owner:req.instructor._id,
                        domain:question.domain,
                        time: Date.now(),
                     })
                    //await myQuestion.save()
                }
            }
            else{
                if(question.kind == 'MCQ'){
                    myQuestion=await MCQ.findOne({owner:req.instructor._id,Question:question.Question})
                }
                else if (question.kind == 'T/F'){
                    myQuestion=await TrueOrFalse.findOne({owner:req.instructor._id,Question:question.Question})

                }
                else if(question.kind == 'Complete'){
                    myQuestion=await Complete.findOne({owner:req.instructor._id,Question:question.Question})

                }
            }
        

        if(req.body.hasOwnProperty('NewDistructor') && req.body.NewDistructor !='' &&req.body.hasOwnProperty('OldDistructor') && req.body.OldDistructor !=''){
            oldIdDistructor=distructor.find((e)=> req.body.OldDistructor === e.distructor)
            await DistructorController.removeFromDistructor(myQuestion._id,oldIdDistructor._id)
            myQuestion.distructor.remove(oldIdDistructor._id)
            newIdDist=await DistructorController.addDistructor(req.body.NewDistructor)
            myQuestion.distructor.push(newIdDist)
            dumy = await this.CheckEdited({Question:myQuestion.Question,kind:myQuestion.kind,keyword:myQuestion.keyword,distructor:myQuestion.distructor},req.instructor._id)
            if(dumy){
                return res.status(300).send({massage:"question is already in your collection",question:dumy})
            }
            await DistructorController.LinkDistructorToQuestion(newIdDist,myQuestion._id)
            await myQuestion.save()
        }
        else if(req.body.hasOwnProperty('NewDistructor') && req.body.NewDistructor !=''){
            newIdDist=await DistructorController.addDistructor(req.body.NewDistructor)
            myQuestion.distructor.push(newIdDist)
            dumy = await this.CheckEdited({Question:myQuestion.Question,kind:myQuestion.kind,keyword:myQuestion.keyword,distructor:myQuestion.distructor},req.instructor._id)
            if(dumy){
                return res.status(300).send({massage:"question is already in your collection",question:dumy})
            }
            await DistructorController.LinkDistructorToQuestion(newIdDist,myQuestion._id)
            await myQuestion.save()
        }
        else if (req.body.hasOwnProperty('OldDistructor') && req.body.OldDistructor !=''){
            oldIdDistructor=distructor.find((e)=> req.body.OldDistructor === e.distructor)
            await DistructorController.removeFromDistructor(myQuestion._id,oldIdDistructor._id)
            myQuestion.distructor.remove(oldIdDistructor._id)
            dumy = await this.CheckEdited({Question:myQuestion.Question,kind:myQuestion.kind,keyword:myQuestion.keyword,distructor:myQuestion.distructor},req.instructor._id)
            if(dumy){
                return res.status(300).send({massage:"question is already in your collection",question:dumy})
            }
            await myQuestion.save()
        }
        else if(req.body.hasOwnProperty('Question') && req.body.Question !=''){
            //check if New edit is al ready found in the collection
            let dumy
            if(myQuestion.kind =='MCQ' || myQuestion.kind == 'T/F'){
            dumy = await this.CheckEdited({Question:req.body.Question,kind:myQuestion.kind,keyword:myQuestion.keyword,distructor:myQuestion.distructor},req.instructor._id)
            }
            else{
                dumy = await this.CheckEdited({Question:req.body.Question,kind:myQuestion.kind,keyword:myQuestion.keyword},req.instructor._id)
            }
            if(dumy){
                return res.status(300).send({massage:"question is already in your collection",question:dumy})
            }
            myQuestion.Question=req.body.Question
            await myQuestion.save()
            if(myQuestion.kind =='MCQ' || myQuestion.kind=='T/F'){
                for(var i = 0;i<myQuestion.distructor.length;i++){
                    await DistructorController.LinkDistructorToQuestion(myQuestion.distructor[i],myQuestion._id)
                }
            }
        }
        else if(req.body.hasOwnProperty('keyword') && req.body.keyword!=''){
            //htb2a na2sa 7ta b3d rabt l python
            myQuestion.keyword=req.body.keyword
            let dumy
            if(myQuestion.kind =='MCQ' || myQuestion.kind == 'T/F'){
            dumy = await this.CheckEdited({Question:myQuestion.Question,kind:myQuestion.kind,keyword:req.body.keyword,distructor:myQuestion.distructor},req.instructor._id)
        }
            else{
                dumy = await this.CheckEdited({Question:myQuestion.Question,kind:myQuestion.kind,keyword:req.body.keyword},req.instructor._id)
            }
            if(dumy){
                return res.status(300).send({massage:"question is already in your collection",question:dumy})
            }
            await myQuestion.save()
        }
        if(myQuestion.kind == 'MCQ'){
            returned = await MCQ.findOne({ _id: myQuestion._id }).populate({
                path: 'domain',
                select: 'domain_name'
            }).populate({
                path: 'owner',
                select: 'Email'
            }).populate({
                path: 'distructor',
                select: 'distructor'
            })
        }
        else if(myQuestion.kind=='T/F'){
            returned = await TrueOrFalse.findOne({ _id: myQuestion._id }).populate({
                path: 'domain',
                select: 'domain_name'
            }).populate({
                path: 'owner',
                select: 'Email'
            }).populate({
                path: 'distructor',
                select: 'distructor'
            })
        
        }
        else if(myQuestion.kind == 'Complete'){
            returned = await Complete.findOne({ _id: myQuestion._id }).populate({
                path: 'domain',
                select: 'domain_name'
            }).populate({
                path: 'owner',
                select: 'Email'
            }).populate({
                path: 'distructor',
                select: 'distructor'
            })
        }
        else{
            res.status(300).send({'massage':"Can't Edit Right now"})
        }

        res.status(202).send(returned)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)

    }


}
//Delete Question
exports.DeleteQuestion = async (req, res) => {
    const question = await Question.findOne({ _id: req.params.id })

    try {
        if (!question) {
            return res.status(404).send('Not found')
        }
        if (question.kind === 'Complete') {
            await question.remove()
            return res.status(200).send(question)

        }
        if (question.kind === 'T/F' || 'MCQ') {
            console.log(question.distructor)

            for (let index = 0; index < question.distructor.length; index++) {
                await DistructorController.removeFromDistructor(question._id, question.distructor[index])


            }
            await question.remove()

            return res.status(200).send(question)
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).send(e)


    }
}
exports.checkQuestion=async (type,question,ck)=>{
    Q=await Question.find({Question:question.Question})
    Qprivate=await Question.find({Question:question.Question,owner:question.id})
    if(Q.length >0){
        Q=JSON.parse(JSON.stringify(Q))
        let QP=[]
        if(ck.ch1){
        for(var i =0 ;i<Q.length;i++){
            if(Q[i].public===true){
                QP.push(Q[i])
            }
        }
    }
        if(ck.ch2){
        for(var i=0 ; i<Qprivate.length;i++){
            QP.push(Qprivate[i])
        }
    }
        if(QP.length >0){
            if(type === 'complete'){
                for(var i=0;i<QP.length;i++){
                   if(QP[i].kind ==="Complete"){
                    return false
                   }
                }
                return true
            }
            else{
                if(type === 'trueorfalse'){
                    if(question.hasOwnProperty('distructor')){
                    for(var i =0;i<QP.length;i++){
                    if(QP[i].kind === 'T/F'){
                    if(QP[i].hasOwnProperty('distructor')){
                    if(QP[i].distructor.length===0){
                        continue              
                          }
                     var dist= await Distructor.findById(QP[i].distructor) 
                     dist=JSON.parse(JSON.stringify(dist))
                     if(dist.distructor.toLowerCase() === question.distructor[0].toLowerCase()){
                         return false
                         } 
                        }
                    }
                }
                return true
            }
            else{
                for(var i =0;i<QP.length;i++){
                    if(QP[i].kind==='T/F'){
                        if(QP[i].distructor.length ===0){
                            return false
                        }
                    }
                }
                return true
            }
            }
            else if(type === 'mcq'){
                question.distructor=question.distructor.map(v => v.toLowerCase());
                for(var i =0;i<QP.length;i++){
                    if(QP[i].kind==='MCQ'){
                        var c=0
                        for(var n=0;n<QP[i].distructor.length;n++){
                            var dist= await Distructor.findById(QP[i].distructor[n]) 
                            dist=JSON.parse(JSON.stringify(dist))
                            if(question.distructor.includes(dist.distructor.toLowerCase())){
                                 c=c+1
                            }
                        }
                        if(c == question.distructor.length){
                            return false
                        }
                    }
                }
                return true    
            }
            return false
            }
        }
        return true
    }
    return true
}
//Add Reapeted Questions 
exports.Add_Repeated_Questions= async (req,res)=>{
    let check
    let Type_of_Question=req.params.kind
    const domain = await DomainController.Selectdomain(req.body.domain_name)
    const Array_of_distructors = []
        const Add_Distructors = async () => {
            const dis = req.body.add_distructors
            for (i = 0; i <req.body.add_distructors.length; i++) {
                const distructor = await DistructorController.addDistructor(dis[i])
                Array_of_distructors.push(distructor)
            }

            return Array_of_distructors
        }
    if(req.body.hasOwnProperty('add_distructors')){
        check = await this.checkQuestion(Type_of_Question,{Question:req.body.Question,distructor:req.body.add_distructors,id:req.instructor._id},{ch1:true,ch2:true})
    }
    else{
        check = await this.checkQuestion(Type_of_Question,{Question:req.body.Question,id:req.instructor._id},{ch1:true,ch2:true})
    }
    if(!check){
        let Q
        if(Type_of_Question === 'complete'){
            Type_of_Question = 'Complete'
            Q=await Question.findOne({Question:req.body.Question,kind:Type_of_Question,public:true,owner: req.instructor._id})
            if(!Q){
            Q2=await Question.findOne({Question:req.body.Question,kind:Type_of_Question,public:false,owner: req.instructor._id})
            if(Q2){
                return res.status(300).send({'massage':"you have already this Question in Your Collection"})
            }
            Q=JSON.parse(JSON.stringify(Q))
            const complete = new Complete({
                ...req.body,
                public:false,
                time: Date.now(),
                owner: req.instructor._id,
                domain,
            })
            await complete.save()
            res.status(201).send(complete)
        }
        return res.status(300).send({'massage':"you have already this Question in Your Collection"})
        }
        else{
            let distract

                if (Type_of_Question === 'mcq') {
                    Type_of_Question='MCQ'
                    QA=await Question.findOne({Question:req.body.Question,kind:Type_of_Question,public:true,owner: req.instructor._id})
                    Q2=await Question.findOne({Question:req.body.Question,kind:Type_of_Question,public:false,owner: req.instructor._id})
                    if(Q2  || QA){
                        console.log('in condition')
                        return res.status(301).send({'massage':"you have already this Question in Your Collection"})      
                          }
                    const mcq = new MCQ({
                        ...req.body,
                        distructor: await Add_Distructors(),
                        time: Date.now(),
                        public:false,
                        owner: req.instructor._id,
                        domain
        
                    })
                    // saving question in database
                    await mcq.save()
        
                    // Linking distructors to that question
                    Array_of_distructors.forEach((d) => {
                        DistructorController.LinkDistructorToQuestion(d, mcq._id)
                    })
        
                    // retrun question after populating it
                    const m = await MCQ.findOne({ _id: mcq.id }).populate({
                        path: 'domain',
                        select: 'domain_name'
                    }).populate({
                        path: 'owner',
                        select: 'Email'
                    }).populate({
                        path: 'distructor',
                        select: 'distructor'
                    })
        
                    return res.status(201).send(m)
                }
                else if (Type_of_Question === 'trueorfalse') {
                    Type_of_Question='T/F'
                    QA=await Question.findOne({Question:req.body.Question,kind:Type_of_Question,public:true,owner: req.instructor._id})
                    Q2=await Question.findOne({Question:req.body.Question,kind:Type_of_Question,public:false,owner: req.instructor._id})
                    if(Q2 || QA){
                        console.log('in condition')
                        return res.status(301).send({'massage':"you have already this Question in Your Collection"})      
                          }
                    let question
                    if(req.body.hasOwnProperty('add_distructors')){
                    question = new TrueOrFalse({
                        ...req.body,
                        distructor:  await Add_Distructors(),
                        time: Date.now(),
                        owner: req.instructor._id,
                        domain
        
                    })
                }
                else{
                    question = new TrueOrFalse({
                        ...req.body,
                        time: Date.now(),
                        owner: req.instructor._id,
                        domain
                    })
                }
                    x=await question.save()

                    let m 
                    if(req.body.hasOwnProperty('add_distructors')){
                    await DistructorController.LinkDistructorToQuestion(question.distructor, question._id)
                    m = await TrueOrFalse.findOne({ _id: question._id }).populate({
                        path: 'domain',
                        select: 'domain_name'
                    }).populate({
                        path: 'owner',
                        select: 'Email'
                    }).populate({
                        path: 'distructor',
                        select: 'distructor'
                    })    
                }
        
                    // retrun question after populating it
                    else{
                    m = await TrueOrFalse.findOne({ _id: question._id }).populate({
                        path: 'domain',
                        select: 'domain_name'
                    }).populate({
                        path: 'owner',
                        select: 'Email'
                    }).populate({
                        path: 'distructor',
                        select: 'distructor'
                    })
                }
                    return res.status(201).send(m)
                }
            
        return res.status(404).send({'massage':"not Found In QuestionBank"})
        }
    }
    return res.status(500).send({'massage':'no Question At QuestionBank as this'})
}

//Edite Question Or Distructor
exports.Edit

//Add Question Manually
exports.Add_Question_Manually = async (req, res) => {
    try {
        //select domain
        console.log(req.body.domain_name)
        const domain = await DomainController.Selectdomain(req.body.domain_name)
        const Type_of_Question = req.params.kind
        // Adding Distructors 
        const Array_of_distructors = []
        const Add_Distructors = async () => {
            const dis = req.body.add_distructors
            for (i = 0; i <req.body.add_distructors.length; i++) {
                const distructor = await DistructorController.addDistructor(dis[i])
                Array_of_distructors.push(distructor)
            }

            return Array_of_distructors
        }
        let check
        let check2
        if(req.body.hasOwnProperty('add_distructors')){
            check = await this.checkQuestion(Type_of_Question,{Question:req.body.Question,distructor:req.body.add_distructors,id:req.instructor._id},{ch1:true,ch2:false})
            check2 = await this.checkQuestion(Type_of_Question,{Question:req.body.Question,distructor:req.body.add_distructors,id:req.instructor._id},{ch1:false,ch2:true})

        }
        else{
            check = await this.checkQuestion(Type_of_Question,{Question:req.body.Question,id:req.instructor._id},{ch1:true,ch2:false})
            check2 = await this.checkQuestion(Type_of_Question,{Question:req.body.Question,id:req.instructor._id},{ch1:false,ch2:true})

        }
        if(check && check2){
        if (Type_of_Question === 'mcq') {
            
            // filling mcq Question Object
            const mcq = new MCQ({
                ...req.body,
                distructor: await Add_Distructors(),
                time: Date.now(),
                owner: req.instructor._id,
                domain

            })
            // saving question in database
            await mcq.save()

            // Linking distructors to that question
            Array_of_distructors.forEach((d) => {
                DistructorController.LinkDistructorToQuestion(d, mcq._id)
            })

            // retrun question after populating it
            const m = await MCQ.findOne({ _id: mcq.id }).populate({
                path: 'domain',
                select: 'domain_name'
            }).populate({
                path: 'owner',
                select: 'Email'
            }).populate({
                path: 'distructor',
                select: 'distructor'
            })

            return res.status(201).send(m)
        }
        if (Type_of_Question === 'complete') {

            const complete = new Complete({
                ...req.body,
                time: Date.now(),
                owner: req.instructor._id,
                domain,
            })
            await complete.save()
            res.status(201).send(complete)
        }

        if (Type_of_Question === 'trueorfalse') {
            let question
            if(req.body.hasOwnProperty('add_distructors')){
            question = new TrueOrFalse({
                ...req.body,
                distructor:  await Add_Distructors(),
                time: Date.now(),
                owner: req.instructor._id,
                domain

            })
        }
        else{
            question = new TrueOrFalse({
                ...req.body,
                time: Date.now(),
                owner: req.instructor._id,
                domain
            })
        }
            await question.save()
            let m 
            if(req.body.hasOwnProperty('add_distructors')){
            await DistructorController.LinkDistructorToQuestion(question.distructor, question._id)
            m = await TrueOrFalse.findOne({ _id: question._id }).populate({
                path: 'domain',
                select: 'domain_name'
            }).populate({
                path: 'owner',
                select: 'Email'
            }).populate({
                path: 'distructor',
                select: 'distructor'
            })    
        }

            // retrun question after populating it
            else{
            m = await TrueOrFalse.findOne({ _id: question._id }).populate({
                path: 'domain',
                select: 'domain_name'
            }).populate({
                path: 'owner',
                select: 'Email'
            }).populate({
                path: 'distructor',
                select: 'distructor'
            })
        }
            return res.status(201).send(m)
        }
    }
    else if (!check2 ){
        res.status(301).send({'massage':'The Question is Already Found On Your Collection'})

    }
    else{
        res.status(302).send({'massage':'The Question is Already Found On QuestionBank'})
    }
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}


//get ids
exports.Get_ids = async (questions) => {

    const _ids = []
    for (let index = 0; index < questions.length; index++) {
        _ids[index] = await questions[index]._id

    }
    return _ids

}


//List Question - kont bgrb beha haga Not an required function-
exports.List_Question = async () => {
    const Array_of_ids = []
    const Questions = await Question.find({})
    if (!Questions) {
        throw new Error('No Questions yet')
    }
    for (i = 0; i < Questions.length; i++) {
        Array_of_ids[i] = Questions[i]._id

    }

    return Array_of_ids

}
//List Questions route 
exports.List_Questions = async (id,domain) => {
    try {
       
        const Questions = await Question.find({ owner: id }).populate({
            path:'domain',
            select:'domain_name'
        })
        
        if (Questions.length === 0) {
            return false
        }
        let Q =JSON.parse(JSON.stringify(Questions))
        
        if(domain !='all'){
            Q = await Q.filter((element) => element.domain.domain_name === domain)
        }
        if(Q.length===0){
            return false
        }
        for(var i =0 ; i<Q.length;i++){
            let distructors=[]
            if(Q[i].kind != 'Complete'){
                if(Array.isArray(Q[i].distructor)){
                    for (var n =0 ;n<Q[i].distructor.length;n++){
                        x=await Distructor.findById(Q[i].distructor[n])
                        distructors.push(x.distructor)    
                    }
                }
                else{
                    x=await Distructor.findById(Q[i].distructor)
                    distructors = x.distructor
                }
                Q[i].distructor=distructors
            }
        }
        return Q.sort((a,b)=> new Date(b.time) - new Date(a.time))
    } catch (e) {
        console.log(e)
        return false
    }


}
//getQuestions  -function takes ids and return questions-

exports.get_Questions = async (ids) => {
    const Array_of_Question = []
    for (let index = 0; index < ids.length; index++) {
        Array_of_Question[index] = await Question.findOne({ _id: ids[index] })


    }
    return Array_of_Question

}
//retrun all questions in questionbank
exports.get_question_bank = async (req, res) => {
    try {
        let QB
        let FilterQB
        if (!req.body.hasOwnProperty("Domain_Name")) {
            QB = await getDomain('all')
        }
        QB = await getDomain(req.body.Domain_Name)
        if (QB === false) {
            return res.status(404).send({})
        }
        if (req.body.Question_Type === 'all') {
            FilterQB = QB
        }
        else {
            FilterQB = QB.filter((element) => element.kind === req.body.Question_Type)
        }
        if (FilterQB.length === 0) {
            return res.status(404).send([])
        }
        if (req.body.Search != '' && req.body.hasOwnProperty("Search")) {
            FilterQB = FilterQB.filter((element) => element.Question.toLowerCase().includes(req.body.Search.toLowerCase()))
        }
        console.log(FilterQB.length)
        if (FilterQB.length === 0) {
            return res.status(404).send([])
        }

        let Questions = []
        const Count = Number(req.params.count)
        const verision =Number(req.params.verision)
        if ((verision + 1) * Count > FilterQB.length) {
            for (var i = verision * Count; i < FilterQB.length; i++) {
                Questions.push(FilterQB[i])
            }
        }
        else {
            for (var i = verision * Count; i < (verision+1) *Count; i++) {
                Questions.push(FilterQB[i])
            }
        }
        res.status(202).send(Questions)
    }
    catch (e) {
        console.log(e)
        res.status(500).send("can't connect now")
    }
}

getDomain = async (domainName) => {
    try {
        let QB3;
        QB3 = await Question.find({ public: true,kind:{$ne:"Complete"} }).populate({
            path: 'domain',
            select: 'domain_name'
        }).populate({
            path: 'owner',
            select: 'Email'
        })
        let QB =JSON.parse(JSON.stringify(QB3))
        for(var i =0 ;i<QB.length;i++){
            let MyDistructor=[]
            if(Array.isArray(QB[i].distructor)){
                for(var n = 0 ;n<QB[i].distructor.length;n++){
                    x=await Distructor.findById(QB[i].distructor[n])
                    MyDistructor.push(x.distructor)
                }
            }
            else{
                x=await Distructor.findById(QB[i].distructor)
                MyDistructor = x.distructor
            }
            QB[i].distructor=MyDistructor
        }
        QB2 = await Question.find({ public: true,kind:"Complete" }).populate({
            path: 'domain',
            select: 'domain_name'
        }).populate({
            path: 'owner',
            select: 'Email'
        })
        
        QB2.forEach((element)=>{QB.push(JSON.parse(JSON.stringify(element)))})
        if (QB.length === 0) {
            console.log('wrong')
            return false
        }
        if (domainName == 'all') {
            return QB
        }
        DomainQB = await QB.filter((element) => element.domain.domain_name === domainName)
        if (DomainQB.length === 0) {
            return false
        }
        return DomainQB
    } catch (e) {
        console.log(e)
        return false
    }

}
exports.Add_Questions_to_QB = async (req, res) => {
    try {
        // get all questions
        const Questions = await this.get_Questions(req.body.ids)
        // check if they are already in QB or not if not put them in new array -private questions-  
        const private_questions = Questions.filter((q) => q.public === false)
        // add them to QB
        for (let index = 0; index < private_questions.length; index++) {
            private_questions[index].public = true
            await private_questions[index].save()
            res.status(200).send('your questions are added in QB .. ')
        }

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}

exports.select_Question_from_QuestionBank = async (req, res) => {
    try {
        const question = await Question.findOne({ public: true, domain: req.params.domain_id, _id: req.params.id })
        if (!question) {
            return res.status(404).send()
        }
        res.status(200).send(question)

    } catch (e) {

        console.log(e)
        res.status(500).send(e)
    }

}

exports.generateQuestions=async(req,res)=>{
    try{
        let path= req.body.path
        let type=req.params.type
        //reading file
         const data = fs.readFileSync(path).toString()
         // construct object
        let obj={
            'Domain':req.params.domain,
            'Text':data
        }
        if(req.body.hasOwnProperty('Diffculty')&&req.body.Diffculty!=''){
            obj.Diffculty=req.body.Diffculty}

        if(req.body.hasOwnProperty('Distructor')&&req.body.Distructor!=''){
                obj.Distructor=Number(req.body.Distructor)
            }
         //sending data to python
         const Url='http://localhost:5000/GenerateQuestion/Complete'
         await request.post({url:Url,json:true,body:obj },(error,response)=>{
            if(error){
                return res.status(404).send(error)
            }
            else{
                return res.status(200).send(response)
            }
         })
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
}


