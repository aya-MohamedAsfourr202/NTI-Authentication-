const multer = require("multer");
const path = require("path");

// إعداد التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // اتأكدي إن الفولدر موجود
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// فلترة الصور فقط
const fileFilter = function (req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg, and png are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

module.exports = upload;
