import { Router, type IRouter } from "express";
import healthRouter from "./health";
import kosRouter from "./kos";
import fasilitasRouter from "./fasilitas";

const router: IRouter = Router();

router.use(healthRouter);
router.use(kosRouter);
router.use(fasilitasRouter);

export default router;
