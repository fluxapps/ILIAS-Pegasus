import {VisibilityEntity} from "./visibility.entity";
import {LearnplaceEntity} from "./learnplace.entity";
import {
  Column, Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn,
  RelationOptions
} from "typeorm";

@Entity("PictureBlock")
export class PictureBlockEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  iliasId: number;

  @Column()
  sequence: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  thumbnail: string;

  @Column()
  thumbnailHash: string;

  @Column()
  url: string;

  @Column()
  hash: string;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;

  @OneToOne(type => LearnplaceEntity, learnplace => learnplace.pictureBlocks)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "objectId"})
  learnplace: LearnplaceEntity;
}
