import { Request, Response, NextFunction } from "express";

interface IAsyncFunction {
  (req: Request, res: Response): Promise<void>;
}

export default (asyncFunction: IAsyncFunction) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncFunction(req, res);
    } catch (err) {
      next(err);
    }
  };
