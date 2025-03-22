import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'past'],
    default: 'upcoming'
  },
  locale: {
    type: String,
    required: true,
    enum: ['en', 'bs']
  }
}, {
  timestamps: true
});

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema); 