import { ArtWork } from './artWork.js';

export class Category {
    constructor({ _id, title, description, image, artWorks }) {
        this._id = _id;
        this.title = title;
        this.description = description;
        this.image = image;
        this.artWorks = Array.isArray(artWorks) ? artWorks.map(artWork => new ArtWork(artWork)) : [];
    }

    toJSON() {
        return {
            _id: this._id,
            title: this.title,
            description: this.description,
            image: this.image,
            artWorks: this.artWorks.map(artWork => artWork.toJSON()),
        };
    }
}
