import mongoose, { Document, Schema } from 'mongoose';

export interface ICarouselSlide extends Document {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  locale: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CarouselSchema = new Schema<ICarouselSlide>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: '',
    },
    buttonLink: {
      type: String,
      default: '#',
    },
    locale: {
      type: String,
      required: true,
      enum: ['en', 'bs'],
      default: 'en',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose model oluşturulurken 'carousel' koleksiyonu kullanılacak
export default mongoose.models.Carousel || mongoose.model<ICarouselSlide>('Carousel', CarouselSchema); 