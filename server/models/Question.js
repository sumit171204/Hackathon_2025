const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // HTML rich text
  tags: [{ type: String }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
