import mongoose, { Document, Schema } from 'mongoose';

export interface INewsItem extends Document {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INewsItem>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    locale: {
      type: String,
      required: true,
      enum: ['en', 'bs'],
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

// Varsayılan olarak, haberleri yeni tarihli olanlar başta olacak şekilde sırala
NewsSchema.index({ date: -1 });

export default mongoose.models.News || mongoose.model<INewsItem>('News', NewsSchema); 