import {LearnplaceEntity} from "./learnplace.entity";
import {Column, Entity, JoinColumn, JoinColumnOptions, OneToOne, PrimaryGeneratedColumn} from "typeorm";

@Entity("VisitJournal")
export class VisitJournalEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  time: number;

  @Column()
  synchronized: boolean;

  @OneToOne(type => LearnplaceEntity, learnplace => learnplace.visitJournal)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "objectId"})
  learnplace: LearnplaceEntity;
}
