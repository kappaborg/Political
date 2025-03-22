import mongoose, { Document, Schema } from 'mongoose';

export interface ISocialMedia {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
}

export interface ISiteSettings extends Document {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: ISocialMedia;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  locale: string;
  createdAt: Date;
  updatedAt: Date;
}

const SocialMediaSchema = new Schema<ISocialMedia>({
  facebook: { type: String, default: '' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  youtube: { type: String, default: '' },
}, { _id: false });

const SettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      required: true,
      default: 'Municipality Portal',
    },
    siteDescription: {
      type: String,
      required: true,
      default: 'Official website of the Municipality.',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    socialMedia: {
      type: SocialMediaSchema,
      default: {},
    },
    logo: {
      type: String,
      default: '/images/logo-placeholder.png',
    },
    primaryColor: {
      type: String,
      default: '#2563eb',
    },
    accentColor: {
      type: String,
      default: '#0891b2',
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

export default mongoose.models.Settings || mongoose.model<ISiteSettings>('Settings', SettingsSchema); 