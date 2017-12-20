import {Entity, PrimaryColumn} from "typeorm";

@Entity()
export class VisibilityEntity {

  @PrimaryColumn()
  visibility: string
}
