import {VisibilityEntity} from "./visibility.entity";
import {
  Column,
  Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn,
  RelationOptions
} from "typeorm/browser";
import {LearnplaceEntity} from "./learnplace.entity";

@Entity("Map")
export class MapEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  zoom: number;

  @OneToOne(type => VisibilityEntity, <RelationOptions>{eager: true, onDelete: "RESTRICT"})
  @JoinColumn(<JoinColumnOptions>{name: "FK_visibility", referencedColumnName: "value"})
  visibility: VisibilityEntity;

  @OneToOne(type => LearnplaceEntity, learnplace => learnplace.map)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "id"})
  learnplace: LearnplaceEntity;
}
