import { Role } from './role.js';

export class User {
    constructor({ _id, name, lastName, email, age, role, password }) {
        this._id = _id;
        this.name = name;
        this.lastName = lastName;
        this.email = email;
        this.age = age;
        if (!Object.values(Role).includes(role)) {
            throw new Error(`Invalid role: ${role}`);
        }
        this.role = role;
    }

    toJSON() {
        return {
            _id: this._id,
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            age: this.age,
            role: this.role,
            password: this.password,
        };
    }
}
