import express from "express";

const router = express.Router();

router.post("/register", async (req, res) =>{
    try{
        const {username, email, password} = req.body;

        if(username ||email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password should be at least 6 characters long"})
        }

        if(username.length < 6){
            return res.status(400).json({message: "Username should be at least 6 characters long"})
        }


        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({message: "Email is already registered"})   
        }

        const existingUsername = await User.findOne({username});
        if(existingUsername){
            return res.status(400).json({message: "Username is already taken"})   
        }

        const profileImage = "https://api.dicebear.com/9.x/pixel-art/svg?seed=" + username + "&scale=90&radius=50";

        const user = new User({
            username,
            email,
            password,
            profileImage,
        });

        await user.save();

    }catch {error}{

    }
});

router.post("/login", async (req, res) =>{
    res.send("Login Successful");
})

export default router;