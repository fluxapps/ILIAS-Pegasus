import {LearnplaceEntity} from "./learnplace.entity";
import {VisibilityEntity} from "./visibility.entity";
import {Column, Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn, RelationOptions} from "typeorm";

@Entity("VideoBlock")
export class VideoBlockEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  iliasId: number;

  @Column()
  sequence: number;

  @Column()
  url: string;

  @Column()
  hash: string;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;

  @OneToOne(type => LearnplaceEntity, learnplace => learnplace.videoBlocks)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "objectId"})
  learnplace: LearnplaceEntity;
}
