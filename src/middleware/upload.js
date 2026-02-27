const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let subfolder = 'others';
    if (file.fieldname === 'profileImage') {
      subfolder = 'profiles';
    } else if (file.fieldname === 'handmadeProofImage') {
      subfolder = 'handmade-proof';
    } else if (file.fieldname === 'images') {
      subfolder = 'products';
    }

    const uploadPath = path.join(__dirname, '..', '..', 'uploads', subfolder);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image uploads are allowed'));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = {
  upload,
};

