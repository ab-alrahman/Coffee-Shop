import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(
    createAddressDto: CreateAddressDto,
    userId: string,
  ): Promise<Address> {
    try {
      if (createAddressDto.isDefault) {
        await this.addressRepository.update(
          { userId, isDefault: true },
          { isDefault: false },
        );
      }

      const address = this.addressRepository.create({
        ...createAddressDto,
        userId,
      });
      return await this.addressRepository.save(address);
    } catch (error) {
      throw new BadRequestException('فشل في إنشاء العنوان');
    }
  }

  async findAll(userId: string): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(`العنوان بالمعرف ${id} غير موجود`);
    }

    return address;
  }

  async findDefault(userId: string): Promise<Address | null> {
    return await this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
    userId: string,
  ): Promise<Address> {
    const address = await this.findOne(id, userId);

    // إذا كان العنوان المحدث افتراضي، قم بإلغاء الافتراضية من العناوين الأخرى
    if (updateAddressDto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true, id: address.id },
        { isDefault: false },
      );
    }

    Object.assign(address, updateAddressDto);

    try {
      return await this.addressRepository.save(address);
    } catch (error) {
      throw new BadRequestException('فشل في تحديث العنوان');
    }
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);

    // إلغاء الافتراضية من جميع العناوين الأخرى
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    address.isDefault = true;
    return await this.addressRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);

    try {
      await this.addressRepository.remove(address);
    } catch (error) {
      throw new BadRequestException('فشل في حذف العنوان');
    }
  }
}
