import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';
import { PaginacaoQueryDto } from './dto/paginacao.dto';
import { Notificacao } from './entities/notificacao.entity';
import { Especie } from './entities/especie.entity';
import { Foto } from './entities/foto.entity';
import { MulterFile } from '../storage/storage.service.interface';
import { PaginatedResult, EstatisticasResponse } from './notificacoes.service';
import {
  PaginatedResultDto,
  EstatisticasResponseDto,
  PaginatedNotificacaoDto,
} from './dto/paginated-result.dto';

@ApiTags('notificacoes')
@ApiBearerAuth()
@Controller('notificacoes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@UseGuards(AuthGuard('jwt'))
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get('especies')
  @ApiOperation({ summary: 'List all venomous species' })
  @ApiResponse({
    status: 200,
    description: 'Return list of all venomous species',
    type: [Especie],
  })
  async findAllEspecies(): Promise<Especie[]> {
    return this.notificacoesService.findAllEspecies();
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of notifications' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated notifications',
    type: PaginatedNotificacaoDto,
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  async findAll(
    @Query() query: PaginacaoQueryDto,
  ): Promise<PaginatedResult<Notificacao>> {
    return this.notificacoesService.findAll(query);
  }

  @Get('estatisticas/totais')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return notification statistics',
    type: EstatisticasResponseDto,
  })
  async getEstatisticas(): Promise<EstatisticasResponse> {
    return this.notificacoesService.getEstatisticas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the notification',
    type: Notificacao,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Notificacao> {
    return this.notificacoesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: Notificacao,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateNotificacaoDto })
  async create(
    @Body() createNotificacaoDto: CreateNotificacaoDto,
  ): Promise<Notificacao> {
    return this.notificacoesService.create(createNotificacaoDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a notification by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
    type: Notificacao,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiBody({ type: UpdateNotificacaoDto })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotificacaoDto: UpdateNotificacaoDto,
  ): Promise<Notificacao> {
    return this.notificacoesService.update(id, updateNotificacaoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notificacoesService.remove(id);
  }

  @Post(':id/fotos')
  @ApiOperation({ summary: 'Upload photos for a notification' })
  @ApiResponse({
    status: 200,
    description: 'Photos uploaded successfully',
    type: [Foto],
  })
  @ApiResponse({
    status: 400,
    description: 'No files uploaded or invalid file type',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload up to 10 photos (JPEG, PNG, GIF, WebP)',
    schema: {
      type: 'object',
      properties: {
        fotos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: 'fotos',
          maxCount: 10,
        },
      ],
      {
        limits: {
          fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
          const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
          ];
          if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('Tipo de arquivo não permitido'), false);
          }
        },
      },
    ),
  )
  async uploadFotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: { fotos?: MulterFile[] },
  ): Promise<Foto[]> {
    if (!files.fotos || files.fotos.length === 0) {
      throw new Error('Nenhum arquivo enviado');
    }
    return this.notificacoesService.uploadFotos(id, files.fotos);
  }
}
