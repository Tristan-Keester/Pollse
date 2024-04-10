import { Request, Response, NextFunction } from "express";

const pollController = {
  createPoll: (_req: Request, _res: Response, next: NextFunction) => {
    console.log("Entered the controller");
    // !!! Create a new poll in the DB
    next();
  }
}

export default pollController;
