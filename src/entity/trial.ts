import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
} from "typeorm";
import { User } from "./user";
import { Condition } from "./condition";

@Entity()
export class Trial extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    hash!: string;

    @Column()
    label!: string;

    @Column({ type: "enum", enum: ["random", "balanced"] })
    sampling!: "random" | "balanced";

    @ManyToOne((type) => User, (user) => user.trials)
    user!: User;

    @OneToMany((type) => Condition, (condition) => condition.trial, {
        cascade: ["insert", "update", "remove"],
        eager: true,
    })
    conditions!: Condition[];
}

// what?!
