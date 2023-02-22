const express = require("express");
const router = express.Router();
var fetchuser = require('../middleware/fetchuser')
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator');



//route1 get all the notes using: GET "/api/auth/getuser"
router.get('/fetchallnotes', fetchuser, async(req,res)=> {
    try{
        const notes = await Note.find({user: req.user.id});
        res.json(notes);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})


//route2 Add a new note using: Post "/api/auth/addnote"  -->login require
router.post('/addnote', fetchuser,[
    body('title','Enter a valid name').isLength({min:3}),
    body('description', 'description must be atlest 5 char').isLength({min:5}),], async(req,res)=>
    {
        try {
            const {title,description,tag} = req.body;
            //if there are errors, return bad request and the errors
            const errors = validationResult(req);
            if(!errors.isEmpty())
            {
                return res.status(400).json({errors: errors.array()});
            }
            const note = new  Note({
                title, description, tag, user: req.user.id
            })
            const saveNote = await note.save();
            res.json(note);
        } catch(error){
            console.error(error.message);
            res.status(500).send("Internal Server error")
        }
    })

//route3 Update a exisiting note: Post "/api/auth/updatenote"  -->login require
router.put('/updatenote/:id',fetchuser,async (req,res)=>{
    const {title,description,tag} = req.body;
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    //find the note to be update it
    let note = await Note.findByIdAndUpdate(req.params.id);
    if(!note){
        return res.status(404).send("Not Found")
    }
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }
    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote},{new:true})
    res.json({note});
})

//route4 Delete a existing note: DELETE "/api/notes/updatenote"
router.delete('/deletenote/:id', fetchuser, async (req,res)=>{
    try{
        //find the note to be delete 
        let note = await Note.findById(req.params.id);
        if(!note){
            return res.status(401).send("Not Found");
        }

        //allow deletion only if user own this notes
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({"Success":"Note has been deleted Successfully", note:note});
    }catch(error){
        console.error(error.message);
        res.status(500).send("internal server error");
    }
})


module.exports = router; 