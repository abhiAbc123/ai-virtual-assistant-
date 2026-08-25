import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    action: {
      type: {
        type: String,
        enum: ['none', 'open_url', 'search_web', 'calculate', 'time', 'date', 'weather', 'timer', 'joke', 'clear'],
        default: 'none',
      },
      payload: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
