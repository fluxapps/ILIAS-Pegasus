import {VisibilityEntity} from "./visibility.entity";
import {
  Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn,
  RelationOptions
} from "typeorm";
import {LearnplaceEnity} from "./learnplace.enity";

@Entity("Map")
export class MapEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;

  @OneToOne(type => LearnplaceEnity, learnplace => learnplace.map)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "objectId"})
  learnplace: LearnplaceEnity;
}
