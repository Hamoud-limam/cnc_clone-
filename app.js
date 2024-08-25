import express from 'express' 
import mongoose from'mongoose' 
import session from'express-session' 
import MongoStore  from 'connect-mongo' 
import User from'./models/user.js'
import bcrypt from'bcrypt'
import concours from "./models/concours.js"
import candidat from "./models/candidat.js"
 import multer from 'multer'
 import dotenv from 'dotenv'
 import { v2 as cloudinary } from 'cloudinary';
  import QRCode  from 'qrcode'

 dotenv.config();
const app = express();
app.use(express.static('public'))
mongoose.connect('mongodb://localhost:27017/CNC');
app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: 'wwj167CRFD$UV&^DFC$WSWJK^^%E%>NCUYiyr3sddfgdf67y8t44468obTFRDAHV,,;,.p2', 
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/CNC',
  }),
  cookie: {
    maxAge: 60000*60*24, 
  },
}));

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  } 
  res.redirect('/login');
}


app.get('/signup', (req, res) => {
  res.render('signup'); 
});

app.post('/signup', async (req, res) => {
  const { NNI,email,username, password } = req.body;
  const existingUser = await User.findOne({ NNI:req.body.NNI  });
if (existingUser) {
    console.log('user already indb')
  return 
}
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ NNI,email,username, password: hashedPassword });
  await user.save();
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login'); // Render login page
});

app.post('/login', async (req, res) => {
  const { NNI, password } = req.body;
  const user = await User.findOne({ NNI });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id; // Store user id in session
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

app.get('/', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.userId);
  const concouresopen = await concours.find({end:"open"});
  const concouresclose = await concours.find({end:"close"})
  res.render('dashboard', { user , concouresopen : concouresopen, concouresclose:concouresclose}); 
});

app.get('/depose', isAuthenticated, async (req, res) => {
  try {
    const concour = req.query.concour;
    const user = await User.findById(req.session.userId);

  
    const finddepose = await candidat.findOne({ concour: concour, NNI: user.NNI });
   const candidatID = await  candidat.findOne({NNI:user.NNI,concour: concour})
    if (finddepose) {
      res.render('depose', { user,candidatID, concour, finddepose: true });
    } else {
      res.render('depose', { user, concour, finddepose: false }); 
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
app.get('/recu', isAuthenticated, async (req, res) => {
  try {
    const concour = req.query.concour;
    const user = await User.findById(req.session.userId);

  
    const finddepose = await candidat.findOne({ concour: concour, NNI: user.NNI });
   const candidatID = await  candidat.findOne({NNI:user.NNI,concour: concour})
   const qrUrl = `https://bc67-41-188-119-228.ngrok-free.app/recu/${candidatID._id}`;

   const qrCode = await QRCode.toDataURL(qrUrl);
      res.render('recu', { user,candidatID, concour,qrCode });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
app.get('/recu/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const candidatsearch = await candidat.findOne({ _id: id });
   
 res.render('candidate-info',{candidatsearch})

    
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



 
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('failed to desroy', err);
        return res.redirect('/dashboard');
      }
      console.log('destroyed');
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
  


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// إعداد Multer لرفع الملفات
const storage = multer.diskStorage({});
const upload = multer({ storage });


// إنشاء Schema لمعلومات الطلاب





app.post('/submit', upload.fields([{ name: 'carte' }, { name: 'bac' }]), async (req, res) => {
  const { name, email,NNI, concour } = req.body;
  const carteFile = req.files['carte'][0];  // Carte d'identite
  const bacFile = req.files['bac'][0];      // Baccalaureat diplome

  try {
    // Upload both files to Cloudinary
    const carteResult = await cloudinary.uploader.upload(carteFile.path);
    const bacResult = await cloudinary.uploader.upload(bacFile.path);

    // Create a new document in the database
    const newCandidate = new candidat({
      name,
      email,
      NNI,
      concour,
      stautus:"En cours",
      carteUrl: carteResult.secure_url,  
      bacUrl: bacResult.secure_url  ,
      time  :new Date()
    });

    await newCandidate.save();
    res.send('تم استلام طلبك بنجاح!');
  } catch (error) {
    console.error(error);
    res.status(500).send('حدث خطأ أثناء رفع الملفات.');
  }
});
app.get('/deposerequest',isAuthenticated, async(req,res)=>{
  const user = await User.findById(req.session.userId);
  const finddepose = await candidat.find({NNI:user.NNI})

  res.render('deposerequests', { 
    user, 
    finddepose: finddepose.length > 0, 
    finddeposes: finddepose 
  }); 
})




app.listen(3000, () => {
  console.log('Server running on port 3000');
});