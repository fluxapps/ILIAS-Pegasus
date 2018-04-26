import {Entity, PrimaryColumn} from "typeorm";

@Entity("Visibility")
export class VisibilityEntity {

  @PrimaryColumn()
  value: string
}
