import express from "express";
import config from "../config";
import middleware from "../middleware";
import initializeDb from "../config/db";
import user from "../controller/user";
import token from "../controller/token";
import fare from "../controller/fare";
import activity from "../controller/activity";
import history from "../controller/history";
import driver from "../controller/driver";
import card from "../controller/card";
import support from "../controller/support";
import notification from "../controller/notification";
import shares from "../controller/shares";
import voucher from "../controller/voucher";

let router = express();

//connect to db
initializeDb(db => {
  //internal middleware
  router.use(middleware({ config, db }));
  // api routes v1 (/v1)
  router.use('/user', user({ config, db }));
  router.use('/token', token({ config, db }));
  router.use('/fare', fare({ config, db }));
  router.use('/activity', activity({ config, db }));
  router.use('/history', history({ config, db }));
  router.use('/driver', driver({ config, db }));
  router.use('/card', card({ config, db }));
  router.use('/support', support({ config, db }));
  router.use('/notification', notification({ config, db }));
  router.use('/shares', shares({ config, db }));
  router.use('/voucher', voucher({ config, db }));
});




export default router;
