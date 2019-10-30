import {Entity, PrimaryColumn} from "typeorm/browser";

@Entity("Visibility")
export class VisibilityEntity {

  @PrimaryColumn()
  value: string
}
