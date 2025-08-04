import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  userId: String,
  imageUrl: String,
  dateTaken: Date,
  year: {
    type: Number,
    required: true,
  },
  location: {
    name: String,
    lat: Number,
    lon: Number,
  },
}, { timestamps: true });

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
