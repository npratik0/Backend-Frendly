import mongoose,{Document,Schema} from "mongoose";
import {UserType} from '../types/user.type';

const UserSchema: Schema =  new Schema<UserType>(
    {
        email : {type: String, required: true, unique: true},
        password : {type: String, required: true},
        username: {type: String, required: true, unique: true},
        fullName: {type: String},
        phoneNumber: {type: Number},
        gender : {type: String, enum: ['male','female','other']},
        profilePicture: {type: String},
        bio: {type: String, maxLength: 160},
        role: {
            type: String,
            enum: ['user','admin'],
            default: 'user',
        }
    },
    {
        timestamps: true, // auto createdAt and updatedAt
    }
);

export interface IUser extends UserType, Document { // combine UserType and Document
    _id: mongoose.Types.ObjectId; // mongo related attribute/ cusotm attributes
    createdAt: Date;
    updatedAt: Date;

}

export const UserModel = mongoose.model<IUser>('User',UserSchema);
