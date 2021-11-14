import { Request, Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * Timer controller.
 */
export default class TimerController extends Controller {

  /**
   * Creates a new timer controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, '/timers');
    this.registerEndpoint({ method: 'GET', uri: '/:timerId', handlers: this.getHandler });
    this.registerEndpoint({ method: 'POST', uri: '/', handlers: this.createHandler });
  }

  /**
   * Gets a timer.
   * 
   * Path : `GET /:timerId`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async getHandler(req: Request, res: Response): Promise<Response> {
    try {
      const timer = await this.db.timers.findById(req.params.timerId);
      if (timer == null) {
        return res.status(404).send(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Timer not found'
        }));
      }
      return res.status(200).send({ timer });
    } catch (err) {
      this.logger.error(err);
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Creates a new timer.
   * 
   * Path : `POST /`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async createHandler(req: Request, res: Response): Promise<Response> {
    try {
      const timer = await this.db.timers.create(req.body);
      return res.status(201).send({ id: timer.id });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof MongooseError.ValidationError) {
        return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
      }
    }
  }
}
