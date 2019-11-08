/* eslint-disable camelcase */
/* eslint-disable no-lonely-if */
const fs = require('fs');

module.exports = {
  addPlayerPage: (req, res) => {
    res.render('add-player.ejs', {
      title: 'Welcome to Socka | Add a new player',
      message: '',
    });
  },
  addPlayer: (req, res) => {
    if (!req.files) {
      return res.status(400).send('No files were uploaded.');
    }

    let message = '';
    const { first_name } = req.body;
    const { last_name } = req.body;
    const { position } = req.body;
    const { number } = req.body;
    const { username } = req.body;
    const uploadedFile = req.files.image;
    let image_name = uploadedFile.name;
    const fileExtension = uploadedFile.mimetype.split('/')[1];
    image_name = `${username}.${fileExtension}`;

    const usernameQuery = `SELECT * FROM \`players\` WHERE user_name = '${username}'`;

    db.query(usernameQuery, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (result.length > 0) {
        message = 'Username already exists';
        res.render('add-player.ejs', {
          message,
          title: 'Welcome to Socka | Add a new player',
        });
      } else {
        // check the filetype before uploading it
        if (
          uploadedFile.mimetype === 'image/png' ||
          uploadedFile.mimetype === 'image/jpeg' ||
          uploadedFile.mimetype === 'image/gif'
        ) {
          // upload the file to the /public/assets/img directory
          uploadedFile.mv(`public/assets/img/${image_name}`, err => {
            if (err) {
              return res.status(500).send(err);
            }
            // send the player's details to the database
            const query = `INSERT INTO \`players\` (first_name, last_name, position, number, image, user_name) VALUES ('${first_name}', '${last_name}', '${position}', '${number}', '${image_name}', '${username}')`;
            ("')");
            db.query(query, (err, result) => {
              if (err) {
                return res.status(500).send(err);
              }
              res.redirect('/');
            });
          });
        } else {
          message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
          res.render('add-player.ejs', {
            message,
            title: 'Welcome to Socka | Add a new player',
          });
        }
      }
    });
  },
  editPlayerPage: (req, res) => {
    const playerId = req.params.id;
    const query = `SELECT * FROM \`players\` WHERE id = '${playerId}' `;
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.render('edit-player.ejs', {
        title: 'Edit  Player',
        player: result[0],
        message: '',
      });
    });
  },
  editPlayer: (req, res) => {
    const playerId = req.params.id;
    const { first_name } = req.body;
    const { last_name } = req.body;
    const { position } = req.body;
    const { number } = req.body;

    const query = `UPDATE \`players\` SET \`first_name\` = '${first_name}', \`last_name\` = '${last_name}', \`position\` = '${position}', \`number\` = '${number}' WHERE \`players\`.\`id\` = '${playerId}'`;
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.redirect('/');
    });
  },
  deletePlayer: (req, res) => {
    const playerId = req.params.id;
    const getImageQuery = `SELECT image from \`players\` WHERE id = "${playerId}"`;
    const deleteUserQuery = `DELETE FROM players WHERE id = "${playerId}"`;

    db.query(getImageQuery, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      const { image } = result[0];

      fs.unlink(`public/assets/img/${image}`, err => {
        if (err) {
          return res.status(500).send(err);
        }
        db.query(deleteUserQuery, (err, result) => {
          if (err) {
            return res.status(500).send(err);
          }
          res.redirect('/');
        });
      });
    });
  },
};
