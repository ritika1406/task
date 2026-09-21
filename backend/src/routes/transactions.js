const express=require("express");
const multer=require("multer");
const {authenticate}=require("../middleware/auth");
const controller=require("../controllers/transactionController");
const upload=multer({
  storage:multer.memoryStorage(),
  limits:{fileSize:Number(process.env.MAX_FILE_SIZE_MB||5)*1024*1024},
  fileFilter:(req,file,cb)=>file.originalname.toLowerCase().endsWith(".csv")?cb(null,true):cb(new Error("Only CSV files are supported"))
});
const router=express.Router();
router.use(authenticate);
router.post("/upload",upload.single("file"),controller.uploadTransactions);
router.get("/",controller.listTransactions);
router.get("/summary",controller.summary);
router.get("/categories",controller.categories);
router.get("/monthly",controller.monthly);
module.exports=router;
