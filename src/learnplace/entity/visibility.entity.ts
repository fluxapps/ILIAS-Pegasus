import {Entity, PrimaryColumn} from "typeorm";

@Entity()
export class VisibilityEntity {

  @PrimaryColumn()
  value: string
}
