import { Schema, model, models } from 'mongoose';
import { hash, compare } from 'bcrypt';
import { AdminRole } from '@/types';

const AdminSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'super-admin'] as AdminRole[],
    default: 'admin',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const hashedPassword = await hash(this.password, 10);
    this.password = hashedPassword;
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

// Method to check if password is correct
AdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await compare(candidatePassword, this.password);
  } catch (err) {
    console.error('Error comparing password:', err);
    return false;
  }
};

export default models.Admin || model('Admin', AdminSchema);
