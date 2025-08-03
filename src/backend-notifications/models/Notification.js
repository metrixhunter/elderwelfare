import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Who receives this notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who triggered this notification (could be another user or 'system')
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Not required: system-generated notifications may not have a sender
  },
  // Main type of the notification (request, confirmation, report, comment, org_payment, etc.)
  type: {
    type: String,
    required: true,
    enum: [
      'request',            // help, medicine, money request, etc.
      'confirmation',       // confirmation of receiving help/money/etc.
      'comment',            // comment on something
      'report',             // report a user or issue
      'org_payment',        // organization payment/cashback reminder
      'org_interest',       // compounded interest/penalty message
      'system',             // system-wide message (e.g. you are now an elder)
      'custom'              // anything else
    ]
  },
  // Optional subtype for further specificity
  subtype: {
    type: String
    // e.g. 'medical', 'medicine', 'other_help', 'cashback', etc.
  },
  // Main notification content/message
  message: {
    type: String,
    required: true
  },
  // Related entities (can be request id, confirmation id, etc.)
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  // For organization notifications: track money/interest/penalty
  amount: Number,
  interestRate: Number,
  dueDate: Date,
  // For marking whether this notification has been read
  isRead: {
    type: Boolean,
    default: false
  },
  // When the notification was created
  createdAt: {
    type: Date,
    default: Date.now
  },
  // When (if) the notification was acted upon or confirmed
  confirmedAt: Date,
  // Whether the notification requires confirmation/response from the recipient
  requiresConfirmation: {
    type: Boolean,
    default: false
  },
  // If the recipient responded
  response: {
    type: String
  },
  // If this notification is for an organization account
  isOrganization: {
    type: Boolean,
    default: false
  }
});

export default mongoose.model('Notification', notificationSchema);