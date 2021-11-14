import { Document, Model, Mongoose, Schema } from 'mongoose';
import ServiceContainer from '../services/service-container';
import Attributes from './model';
const mongooseToJson = require('@meanie/mongoose-to-json');

/**
 * Timer attributes.
 */
export interface Timer extends Attributes {
  title: string;
  description?: string;
  date: Date;
}

/**
 * Timer document.
 */
export interface TimerDocument extends Timer, Document {}

/**
 * Timer model.
 */
export interface TimerModel extends Model<TimerDocument> {}

/**
 * Creates the timer model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 * @returns Timer model
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): TimerModel {
  return mongoose.model<TimerDocument, TimerModel>('Timer', createTimerSchema(), 'timers');
}

/**
 * Creates the timer schema.
 * 
 * @returns Timer schema
 */
function createTimerSchema() {
  const schema = new Schema<TimerDocument, TimerModel>({
    title: {
      type: Schema.Types.String,
      required: [true, 'Timer title is required']
    },
    description: {
      type: Schema.Types.String,
      default: null
    },
    date: {
      type: Schema.Types.Date,
      required: [true, 'Timer date is required']
    }
  });

  schema.plugin(mongooseToJson);

  return schema;
}
