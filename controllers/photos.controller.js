const Photo = require('../models/photo.model');
var sanitize = require('mongo-sanitize');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const title = sanitize(req.fields.title);
    const author = sanitize(req.fields.author);
    const email = sanitize(req.fields.email);
    const file = req.files.file;

    if(title && author && email && file) { // if fields are not empty...

      if (title.length > 25) {
        throw new Error('Too long title');
      }

      if (author.length > 50) {
        throw new Error('Too long author');
      }

      let regexEmail = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");

      if (!regexEmail.test(email)) {
        throw new Error('Wrong email');
      }

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0].toLowerCase();
      if (fileExt === 'jpg' || fileExt === 'gif' || fileExt === 'png') {
        const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
        await newPhoto.save(); // ...save new photo in DB
        res.json(newPhoto);
      } else {
        throw new Error('Wrong file extension');
      }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
