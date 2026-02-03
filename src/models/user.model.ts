import mongoose,{Document,Schema} from "mongoose";
import {UserType} from '../types/user.type';

const UserSchema: Schema =  new Schema<UserType>(
    {
        email : {type: String, required: true, unique: true},
        password : {type: String, required: true},
        username: {type: String, required: true, unique: true},
        fullName: {type: String},
        phoneNumber: {type: Number},
        // phoneNumber: {type: String},
        gender : {type: String, enum: ['male','female','other']},
        // gender : {type: String},
        profilePicture: {type: String},
        bio: {type: String, maxLength: 160},
        // dateOfBirth: {type: String},
        role: {
            type: String,
            enum: ['user','admin'],
            // default: 'user',
        },
        imageUrl: { type: String , required: false},
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
