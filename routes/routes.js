const express = require('express')
const router = express.Router()
const User = require('../models/users');
const multer = require('multer');
const fs = require("fs");

// Image Upload 

var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './uploads')
    },
    filename: function(req,file, cb){
        cb(null, file.fieldname+"_"+ Date.now() + file.originalname);
    }
})

var upload = multer({
    storage: storage,
}).single("image");



router.get("/add", (req,res) =>{
    res.render("add_users", {title: "Add Users"})
})

// router.post("/add", upload, (req,res)=>{
//     const user = new User({
//         name : req.body.name,
//         email: req.body.email,
//         phone : req.body.phone,
//         image : req.file.filename
//     }) 
//     user.save()
//     .then((savedUser) => { 
//         req.session.message = {
//             type: 'success',
//             message: 'user added successfully'
//         };
//         res.redirect('/');
//   })
//   .catch((err) => {
//     res.json({ message: err.message, type: 'danger' });
//   });
    
// })

router.post("/add",upload, async(req,res)=>{
    const user = new User({
        name :req.body.name,
        email: req.body.email,
        phone : req.body.phone,
        image : req.file.filename

    })
    try{
          userSave = await user.save();
          req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect("/")
    }catch(err){
        console.log(err)
        res.json({ message: err.message, type: 'danger'})
    }

})

// Get all usesrs route
router.get("/", async (req,res)=>{
    try{
        const users = await User.find({});
        res.render("index", {title: "home page", users: users})
    }catch(err){
        res.json({ message: err.message})
    }
})

//edit an user route
router.get("/edit/:id", async (req,res) =>{
    console.log(req.params.id, "&^&^")
    try{
        let id = req.params.id
        console.log(id, "***")
        const user = await User.findById(id)
        if(user == null)
        {
            res.redirect("/")
        }else{
            res.render("edit_users.ejs",{
                title : "Edit User",
                user : user
            })
        }
        
    }catch(err){
       res.redirect("/")
    }
  
});


// update user route
router.post("/update/:id", upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = "";

        if (req.file) {
            new_image = req.file.filename; // take the new image
            // remove the old image asynchronously
            if (req.body.old_image) {
                fs.unlink("./uploads" + req.body.old_image, (err) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    }
                });
            }
        } else {
            new_image = req.body.old_image;
        }

        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (result) {
            req.session.message = { type: 'success', message: 'User updated successfully' };
            res.redirect("/");
        } else {
            res.json({ type: "danger", message: "User not found" });
        }
    } catch (err) {
        res.json({ type: "danger", message: err });
    }
});



// Delete user route
router.get("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id; // Extract the id from req.params

        const result = await User.findByIdAndRemove(id);

        if (result) {
            if (result.image !== "") {
                try {
                    fs.unlinkSync("./uploads/" + result.image);
                } catch (error) {
                    console.error(error); // Use console.error to log errors
                }
            }
            req.session.message = { type: "info", message: "User deleted successfully" };
            res.redirect("/"); // Redirect after deleting the user
        } else {
            res.json({ message: "User not found" });
        }
    } catch (error) {
        res.json({ message: "An error occurred while deleting the user" });
    }
});



module.exports = router


    
