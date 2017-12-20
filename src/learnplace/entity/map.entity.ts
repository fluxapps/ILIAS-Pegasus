import {VisibilityEntity} from "./visibility.entity";
import {Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class MapEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => VisibilityEntity)
  @JoinColumn()
  visibility: VisibilityEntity;
}
