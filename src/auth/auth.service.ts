import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { jwt_config } from 'src/config/jwt';

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

  async login(data: LoginDto) {
    const checkUserExist = await this.authRepository.findOne({
      where: {
        email: data.email
      }
    });

    if (!checkUserExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const checkPassword = await compare(
      data.password,
      checkUserExist.password,
    );




    if (checkPassword) {
      const accessToken = this.generateJwt({
        sub: checkUserExist.id,
        name: checkUserExist.name,
        email: checkUserExist.email,
      });

      return {
        statusCode: 200,
        message: 'Login berhasil',
        accessToken: accessToken,
      };
    } else {
      throw new HttpException(
        'User or password not match',
        HttpStatus.UNAUTHORIZED,
      );
    }

  }

  async profile(userId : number) {
    return await this.authRepository.findOne({
      where: {
        id: userId
      },
      select: {
        name: true,
        email: true,
      }
    });
  }

  generateJwt(payload: any) {
    return this.jwtService.sign(
      payload, {
      secret: jwt_config.secret,
      expiresIn: jwt_config.expired,

    }
    );
  }
}
