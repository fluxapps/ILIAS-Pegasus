import {Column, Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {LearnplaceEnity} from "./learnplace.enity";

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

  @OneToOne(type => LearnplaceEnity, learnplace => learnplace.location)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "objectId"})
  learnplace: LearnplaceEnity;
}
