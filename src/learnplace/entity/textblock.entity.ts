import {VisibilityEntity} from "./visibility.entity";
import {LearnplaceEnity} from "./learnplace.enity";
import {
  Column, Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn,
  RelationOptions
} from "typeorm";

@Entity("TextBlock")
export class TextblockEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sequence: number;

  @Column()
  content: string;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;

  @OneToOne(type => LearnplaceEnity, learnplace => learnplace.map)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "objectId"})
  learnplace: LearnplaceEnity;
}
