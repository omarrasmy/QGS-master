const Instructor = require('../models/instructorAccount')
const { CancelationMail } = require('../mails/sendMails')
const multer = require('multer')
const bcrypt = require('bcrypt');
const Request = require('../models/DomainRequests')
const Notification = require('./Notifications')


exports.Login = async (req, res) => {

    try {
        const instructor = await Instructor.findByCredentials(req.body.Email, req.body.Password)


        if (instructor.accepted === true) {
            const token = await instructor.GenerateTokens()
            Notification.updateTokens(req.body.Email,token)
            return res.send({ instructor, token })
        }
        res.send('wait untill receving gmail confrimation mail')
    } catch (e) {
        res.status(404).send(e)
    }

}

exports.Logout = async (req, res) => {
    try {
        req.instructor.tokens = req.instructor.tokens.filter((t) => {
            return t.token !== req.token

        })
        await req.instructor.save()
        res.send('logged out')

    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
}

exports.ReadProfile = async (req, res) => {
    res.send(req.instructor)
}

exports.logoutFromAllDevices = async (req, res) => {
    try {
        req.instructor.tokens = []
        await req.instructor.save()
        res.status(200).send('Logged out from all devicess successfully')

    } catch (e) {
        res.send(403).send(e)

    }
}

exports.deleteAccount = async (req, res) => {
    try {
        const instructor = req.instructor
        await instructor.remove()
        CancelationMail(instructor.Email, instructor.Frist_Name)
        res.send('successfully removed')

    } catch (e) {
        res.send(e)
    }

}

exports.image = multer({

    limits: {
        fieldSize: 1000000

    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|npg|jpeg)/)) {
            return cb('please provide an image!')

        }
        cb(undefined, true)
    }

})

exports.UploadProfilePicture = async (req, res) => {
    req.instructor.pic = req.file.buffer
    await req.instructor.save()
    res.send('image uploaded successfuly')
}
exports.fetcProfilePicture = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id)
        if (!instructor || !instructor.pic) {
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(instructor.pic)
    }
    catch (e) {
        res.status(404).send()
    }
}
//upload resources
exports.resource = multer({
    dest: 'Resources',
    limits: {
        fieldSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx|pdf)/)) {
            return cb(new Error('please upload a PDF or word File!'))
        }
        cb(undefined, true)
    }
})
exports.enterResources = async (req, res) => {

    res.send('file uploaded')
}
exports.Send_SingnUp_Request = async (req, res) => {
    
    try {
        const instructor = new Instructor(req.body)
        await instructor.save()
        await Notification.addInstructorRequest('An User of email ' + req.body.Email + ' Add a Request', req.body.Email)
        const requestOptions = {
            method: 'Get',
            headers: { 'Content-Type': 'application/json'},
        };
        res.status(200).send('your request is sent .. please check your response mail')
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }

}


exports.editInstructorProfile = async (req, res) => {
    const oldPassword = req.params.password
    const hashed = req.instructor.Password
    const allowed = ["Email", "Password", "Age", "Frist_Name", "Address", "Last_Name"]
    const updates = Object.keys(req.body)

    const isMatch = await bcrypt.compare(oldPassword, hashed)
    if (!isMatch) {
        return res.status(401).send('please enter your password correctly')
    }
    const IsValidUpdate=updates.every((update)=>allowed.includes(update))
    if (!IsValidUpdate) {
        return res.status(401).send({ error: 'Not exisited properity' })
    }
    try {
        updates.forEach((update) => req.instructor[update] = req.body[update])
        await req.instructor.save()
        const instructor = req.instructor
        res.send(instructor)
    } catch (e) {
        res.status(400).send(e)
    }
}

exports.x = async (id) => {
    const requests = await Request.find({})
    if (requests.length === 0) {
        throw new Error('no reqs')
    }
    // console.log(requests)
    var arr = []
    var re = []
    const is = requests.forEach((r) => {
        if (r.voters.includes(id)) {
            arr = r.voters
            //    console.log(arr)
            re = arr.filter(e => e != id)
            console.log(re)
        }

    })



}

