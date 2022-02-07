const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//models import
import User from '../models/user.js'

//Si es por POST -> req.body
//Si es por GET -> req.query

//AUTH

router.post("/login", async (req,res) =>{    
    const email = req.body.email;
    const password = req.body.password;

    var user = await User.findOne({email: email});

    if (!user){
        const toSend ={
            status: "error",
            error: "Invalid Credentials"
        }
        return res.status(401).json(toSend);
    }


    if(bcrypt.compareSync(password,user.password)){
      user.set('password', undefined, {strict:false});

      const token = jwt.sign({userData: user}, 'securePasswordHere',{
          expiresIn: 60 * 60 * 24 * 30}
       );
      const toSend={
          status:"success",
          token: token,
          userData:user
      }
      return res.json(toSend);

    }else{
        const toSend ={
            status: "error",
            error: "Invalid Credentials"
        }
        return res.status(401).json(toSend);
    }
});

router.post("/register", async (req,res) =>{
    try {
    console.log("REQ",req);
    const name = req.body.name;
    const email= req.body.email;
    const password= req.body.password;
    var salt = bcrypt.genSaltSync(10);
    const encryptedPassword = bcrypt.hashSync(password,salt);

    const newUser = {
        name: name,
        email: email,
        password: encryptedPassword
    };

    const user = await User.create(newUser);
    console.log("Este es el nuevo User",user);
    
    const toSend={
        status:"success",
    };
    res.json(toSend);

    } catch (error) {

        console.log("Erro- register endpoint")
        console.log(error);
        const toSend={
            status:"error",
            error: error
        };
        res.status(500).json(toSend);
    }
});

router.get('/new-user', async (req, res) =>{

    try {
        const user = await User.create({
            name: "Benjamin2",
            email: "a2@bd.com",
            password: "121212"
          });
          res.json({"status":"success"})
    } catch (error) {
        console.log(error);
        res.json({"status":"fail"});
    }

});

module.exports = router;