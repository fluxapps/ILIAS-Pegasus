import {Column, Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn} from "typeorm/browser";
import {LearnplaceEntity} from "./learnplace.entity";

@Entity("Location")
export class LocationEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @Column()
  elevation: number;

  @Column()
  radius: number;

  @OneToOne(type => LearnplaceEntity, learnplace => learnplace.location)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "id"})
  learnplace: LearnplaceEntity;
}
