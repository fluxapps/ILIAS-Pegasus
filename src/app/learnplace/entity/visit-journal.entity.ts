import {LearnplaceEntity} from "./learnplace.entity";
import {Column, Entity, JoinColumn, JoinColumnOptions, ManyToOne, PrimaryGeneratedColumn} from "typeorm/browser";

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

  @ManyToOne(type => LearnplaceEntity, learnplace => learnplace.visitJournal)
  @JoinColumn(<JoinColumnOptions>{name: "FK_learnplace", referencedColumnName: "id"})
  learnplace: LearnplaceEntity;
}
