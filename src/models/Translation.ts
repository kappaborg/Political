import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema({
  locale: {
    type: String,
    required: true,
    enum: ['en', 'bs'],
    unique: true,
  },
  translations: {
    type: Map,
    of: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

translationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Translation = mongoose.models.Translation || mongoose.model('Translation', translationSchema);

export default Translation; 