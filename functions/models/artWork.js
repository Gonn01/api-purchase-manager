export class ArtWork {
    constructor({ _id, title, description, images }) {
        this._id = _id;
        this.title = title;
        this.description = description;
        this.images = images;
    }

    toJSON() {
        return {
            _id: this._id,
            title: this.title,
            description: this.description,
            images: this.images,
        };
    }
}