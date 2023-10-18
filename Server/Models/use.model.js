import { Schema,model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new Schema({
    fullName:{
        require:[true,'Name is required'],
        type:'String',
        minLength:[5, 'Name must be at least 5 characters'],
        maxLength:[50, 'Name must be less than 50 characters']
    },
    email:{
        type:'String',
        require:[true, 'Email is required'],
        lowercase:true,
        trim:true,
        unique:true,
        match:[
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,'Please fill in a valid email address'
        ]

    },
    password:{
        require:[true,'Your password is required'],
        type:'String',
        minLength:[8,'password must be at least 8 characters'],
        select:false
    },
    avatar:{
        public_id:{
            type:'String'
        },
        secure_url:{
            type:'String'
        }
    },
    role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgotPasswordToken:String,
    forgotPasswordExpirey: Date
},
{
    timestamps:true
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

userSchema.methods = {
    generateJWTToken: async function(){
        return await jwt.sign(
            {id: this._id, email: this.email, subscription: this.subscription, role:this.role},
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRY,
            }
        )
    },
    comparePassword: async function (plainTextPassword){
        return await bcrypt.compare(plainTextPassword,this.password);
    }
}

const user = model('webUser',userSchema);

export default user;