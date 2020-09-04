import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from "typeorm";
import { Trial } from "./trial";

@Entity()
export class Condition extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    label!: string;

    @Column()
    target!: string;

    @Column({ type: "double" })
    weight!: number;

    @ManyToOne((type) => Trial, (trial) => trial.conditions)
    trial!: Trial;
}
