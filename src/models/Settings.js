import mongoose from 'mongoose';

const SocialMediaSchema = new mongoose.Schema({
  facebook: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  youtube: {
    type: String,
    default: ''
  }
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Municipality Portal'
  },
  siteDescription: {
    type: String,
    default: 'Official website of the Municipality.'
  },
  contactEmail: {
    type: String,
    default: ''
  },
  contactPhone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  socialMedia: {
    type: SocialMediaSchema,
    default: () => ({})
  },
  logo: {
    type: String,
    default: '/images/logo-placeholder.png'
  },
  primaryColor: {
    type: String,
    default: '#2563eb'
  },
  accentColor: {
    type: String,
    default: '#0891b2'
  },
  locale: {
    type: String,
    required: true,
    enum: ['en', 'bs'],
    unique: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema); 