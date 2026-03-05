import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { UserRepository } from "../../repositories/user.repository";
import  bcryptjs from "bcryptjs"
import { HttpError } from "../../errors/http-error";

// let userRepository = new UserRepository();

// export class AdminUserService {
export class AdminUserService {
  constructor(private userRepository = new UserRepository()) {}
    async createUser(data: CreateUserDTO){
        const emailCheck = await this.userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        const usernameCheck = await this.userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        const newUser = await this.userRepository.createUser(data);
        return newUser;
    }

    // async getAllUsers(){
    //     const users = await userRepository.getAllUsers();
    //     return users;
    // }


     async getAllUsers(
        page?: string, size?: string, search?: string
    ){
        const pageNumber = page ? parseInt(page) : 1;
        const pageSize = size ? parseInt(size) : 10;
        const {users, total} = await this.userRepository.getAllUsers(
            pageNumber, pageSize, search
        );
        const pagination = {
            page: pageNumber,
            size: pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize)
        }
        return {users, pagination};
    }

    async deleteUser(id: string){
        const user = await this.userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const deleted = await this.userRepository.deleteUser(id);
        return deleted;
    }

    async updateUser(id: string, updateData: UpdateUserDTO){
        const user = await this.userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const updatedUser = await this.userRepository.updateUser(id, updateData);
        return updatedUser;
    }

    async  getUserById(id: string){
        const user = await this.userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

}