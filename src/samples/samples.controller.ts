import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { SamplesService } from "./samples.service";
import { CreateSampleDto } from "./dto/create-sample.dto";
import { UpdateSampleDto } from "./dto/update-sample.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { PoliciesGuard } from "src/casl/guards/policies.guard";
import { CheckPolicies } from "src/casl/decorators/check-policies.decorator";
import { AppAbility } from "src/casl/casl-ability.factory";
import { Action } from "src/casl/action.enum";
import { Sample, SampleDocument } from "./schemas/sample.schema";
import { FilterQuery } from "mongoose";
import { Attachment } from "src/attachments/schemas/attachment.schema";
import { CreateAttachmentDto } from "src/attachments/dto/create-attachment.dto";
import { AttachmentsService } from "src/attachments/attachments.service";
import { UpdateAttachmentDto } from "src/attachments/dto/update-attachment.dto";

@ApiBearerAuth()
@ApiTags("samples")
@Controller("samples")
export class SamplesController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
    private readonly samplesService: SamplesService,
  ) {}

  // POST /samples
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Sample))
  @Post()
  async create(@Body() createSampleDto: CreateSampleDto): Promise<Sample> {
    return this.samplesService.create(createSampleDto);
  }

  // GET /samples
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get()
  async findAll(
    @Query() filters?: FilterQuery<SampleDocument>,
  ): Promise<Sample[]> {
    const sampleFilters = filters ?? {};
    return this.samplesService.findAll(sampleFilters);
  }

  // GET /samples/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Sample))
  @Get("/:id")
  async findOne(@Param("id") id: string): Promise<Sample | null> {
    return this.samplesService.findOne({ sampleId: id });
  }

  // PATCH /samples/:id
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Sample))
  @Patch("/:id")
  async update(
    @Param("id") id: string,
    @Body() updateSampleDto: UpdateSampleDto,
  ): Promise<Sample | null> {
    return this.samplesService.update({ sampleId: id }, updateSampleDto);
  }

  // DELETE /samples/:id
  @UseGuards()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Sample))
  @Delete("/:id")
  async remove(@Param("id") id: string): Promise<unknown> {
    return this.samplesService.remove({ sampleId: id });
  }

  // POST /samples/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Attachment),
  )
  @Post("/:id/attachments")
  async createAttachments(
    @Param("id") id: string,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ): Promise<Attachment> {
    const createAttachment = { ...createAttachmentDto, sampleId: id };
    return this.attachmentsService.create(createAttachment);
  }

  // GET /samples/:id/attachments
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Attachment))
  @Get("/:id/attachments")
  async findAllAttachments(@Param("id") id: string): Promise<Attachment[]> {
    return this.attachmentsService.findAll({ sampleId: id });
  }

  // PATCH /samples/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Attachment),
  )
  @Patch("/:id/attachments/:fk")
  async findOneAttachmentAndUpdate(
    @Param("id") sampleId: string,
    @Param("fk") attachmentId: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ): Promise<Attachment | null> {
    return this.attachmentsService.findOneAndUpdate(
      { _id: attachmentId, sampleId },
      updateAttachmentDto,
    );
  }

  // DELETE /samples/:id/attachments/:fk
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Attachment),
  )
  @Delete("/:id/attachments/:fk")
  async findOneAttachmentAndRemove(
    @Param("id") sampleId: string,
    @Param("fk") attachmentId: string,
  ): Promise<unknown> {
    return this.attachmentsService.findOneAndRemove({
      _id: attachmentId,
      sampleId,
    });
  }
}