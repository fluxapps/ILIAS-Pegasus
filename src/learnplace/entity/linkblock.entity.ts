import {
    Column,
    Entity,
    JoinColumn,
    JoinColumnOptions,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationOptions
} from "typeorm";
import {VisibilityEntity} from "./visibility.entity";

@Entity("LinkBlock")
export class LinkblockEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  iliasId: number;

  @Column()
  sequence: number;

  @Column()
  refId: number;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;
}
