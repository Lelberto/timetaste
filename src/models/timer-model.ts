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
  remaining?: number;
}

/**
 * Timer document.
 */
export interface TimerDocument extends Timer, Document {
  toTimer(style?: TimerStyle): string;
}

/**
 * Timer model.
 */
export interface TimerModel extends Model<TimerDocument> {}

/**
 * Timer style.
 */
export type TimerStyle = 'digit' | 'word';

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
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  schema.virtual('remaining').get(function(this: TimerDocument) {
    return this.date.getTime() - Date.now();
  });

  schema.method('toTimer', function(this: TimerDocument, style: TimerStyle = 'digit') {
    const remaining = this.remaining;
    switch (style) {
      case 'digit':
      default:
        return createDigitTimer(remaining);
      case 'word':
        return createWordTimer(remaining);
    }
  });

  schema.plugin(mongooseToJson);

  return schema;
}

/**
 * Creates digit timer.
 * 
 * @returns Digit timer
 */
function createDigitTimer(remaining: number) {
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const daysStr = days < 10 ? `0${days}` : days.toString(10);
  const hoursStr = hours < 10 ? `0${hours}` : hours.toString(10);
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString(10);
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds.toString(10);
  return `${daysStr}:${hoursStr}:${minutesStr}:${secondsStr}`;
}

/**
 * Creates word timer.
 * 
 * @returns Word timer
 */
function createWordTimer(remaining: number) {
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const daysStr = (days < 10 ? `0${days}` : days.toString(10)) + (days === 1 ? ' day' : ' days');
  const hoursStr = (hours < 10 ? `0${hours}` : hours.toString(10)) + (hours === 1 ? ' hour' : ' hours');
  const minutesStr = (minutes < 10 ? `0${minutes}` : minutes.toString(10)) + (minutes === 1 ? ' minute' : ' minutes');
  const secondsStr = (seconds < 10 ? `0${seconds}` : seconds.toString(10)) + (seconds === 1 ? ' second' : ' seconds');
  return `${daysStr} ${hoursStr} ${minutesStr} ${secondsStr}`;
}
