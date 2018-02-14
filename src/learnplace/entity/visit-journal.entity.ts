import {LearnplaceEntity} from "./learnplace.entity";
import {Column, Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity("VisitJournal")
export class VisitJournalEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  time: number;

  @Column()
  synchronized: boolean;

  @OneToOne(type => LearnplaceEntity, learnplace => learnplace.map)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "objectId"})
  learnplace: LearnplaceEntity;
}
