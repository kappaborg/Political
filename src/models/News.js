import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
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
  date: {
    type: String,
    required: true
  },
  locale: {
    type: String,
    required: true,
    enum: ['en', 'bs']
  }
}, {
  timestamps: true
});

export default mongoose.models.News || mongoose.model('News', NewsSchema); 