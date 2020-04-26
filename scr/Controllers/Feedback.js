const Feedback=require('../models/Feedback')
const Notification=require('./Notifications')
const instructor=require('./instructor')
exports.write_feedback=async(req,res)=>{
    try{
        const feedback= new Feedback({
            ...req.body,
            creator:req.instructor._id
        })
        await feedback.save()
        x=await Feedback.findById(feedback._id).populate({
            path:"creator",
            select:"Email"
        });
        y=await Notification.addInstructorRequest('An User of email ' + x.creator.Email + ' Add a Feedback Its content is '+feedback.feedback, x.creator.Email,feedback._id)
        if(y!=1){
            return res.status(500).send("can't added Notification Now!")
        }   
        res.status(201).send(feedback)

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
}

exports.DeleteMyfeeback=async (req,res)=>{
    try{
        let feedback=await Feedback.findByIdAndDelete(req.params.id)
        x=await Notification.DeleteAdminNotification("filterNotify",req.params.id)
        console.log(x)  
        res.status(200).send("deleted")
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
}
exports.List_Feedbacks=async(req,res)=>{
    try{
        let feedbacks
        if(req.body.hasOwnProperty('Email') && req.body.Email != ''){
        let feedback= await Feedback.find({}).populate('creator','Email')
        feedbacks=feedback.filter((e)=>e.creator.Email)
        }
        else if(req.hasOwnProperty('instructor')){
        feedbacks=await Feedback.find({creator:req.instructor._id})
        }
        else{
        feedbacks= await Feedback.find({}).populate('creator','Email')
        }
        if(feedbacks.length===0){
            res.status(404).send('No feedbacks to show')
        }
        feedbacks.sort((a,b)=>new Date(a.date)-(b.date))
        feeds=instructor.listSpecificItems(Number(req.params.count),Number(req.params.verision),feedbacks)
        res.status(200).send(feeds)

    }catch(e){
        console.log(e)
        res.status(500).send(e)

    }
}