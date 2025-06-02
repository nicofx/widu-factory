import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async create(data: Partial<UserDocument>): Promise<UserDocument> {
    return new this.userModel(data).save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    console.log('[USER SERVICE] Buscando usuario con ID:', id);
    return this.userModel.findById(id).exec(); // 👈 importante
  }

  async updatePassword(id: string, password: string) {
    return this.userModel.findByIdAndUpdate(id, { password });
  }
}

