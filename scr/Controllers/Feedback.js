const Feedback=require('../models/Feedback')
exports.write_feedback=async(req,res)=>{
    try{
        const feedback= new Feedback({
            ...req.body,
            creator:req.instructor._id
        })
        await feedback.save()
        res.status(201).send(feedback)

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
}
exports.List_Feedbacks=async(req,res)=>{
    try{
        const feedbacks= await Feedback.find({}).populate('creator','Email')
        if(feedbacks.length===0){
            res.status(404).send('No feedbacks to show')
        }
        res.status(200).send(feedbacks)

    }catch(e){
        console.log(e)
        res.status(500).send(e)

    }
}