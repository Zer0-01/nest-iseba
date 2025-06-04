import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    private jwtService: JwtService
  ) { }

  async create(createAuthDto: CreateAuthDto): Promise<Auth> {
    const auth = new Auth();
    auth.name = createAuthDto.name;
    auth.email = createAuthDto.email;
    auth.password = createAuthDto.password;
    return await this.authRepository.save(auth);
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    console.log('updateAuthDto', updateAuthDto);
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async register(data: RegisterDto) {
    const checkUserExist = await this.authRepository.findOne({
      where: {
        email: data.email
      }
    });

    if (checkUserExist) {
      throw new HttpException('User already exist', HttpStatus.FOUND);
    }

    const hashedPassword = await hash(data.password, 12);

    const user = this.authRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword
    });

    await this.authRepository.save(user);

    return {
      statusCode: HttpStatus.OK,
      message: 'User created successfully',
    }

  }
}
