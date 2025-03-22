import mongoose from 'mongoose';

const CarouselSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: false,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: ''
  },
  buttonLink: {
    type: String,
    default: '#'
  },
  order: {
    type: Number,
    default: 0
  },
  locale: {
    type: String,
    required: true,
    enum: ['en', 'bs']
  }
}, {
  timestamps: true
});

export default mongoose.models.Carousel || mongoose.model('Carousel', CarouselSchema); 