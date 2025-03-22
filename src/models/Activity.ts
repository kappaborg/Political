import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  startDate: string;
  endDate?: string;
  status: 'upcoming' | 'ongoing' | 'past';
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
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
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'past'],
      required: true,
      default: 'upcoming',
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

// Etkinlikleri başlama tarihine göre sırala
ActivitySchema.index({ startDate: 1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema); 