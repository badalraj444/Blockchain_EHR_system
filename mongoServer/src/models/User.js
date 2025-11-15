import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  role: {
    type: String,
    enum: ["Patient", "CareProvider", "Researcher"],
    required: true,
  },
  publicpem: {
    type: String,
    required: true,
  },
  hashedkey : {
    type : String,
    required : true,
}
},

{timestamps : true}
);

//prehook to encrypt password before saving

userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        return;
    }
    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.matchPassword = async function (enteredPassword){
    const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
    return isPasswordCorrect;
};

const User = mongoose.model("User", userSchema);

export default User;