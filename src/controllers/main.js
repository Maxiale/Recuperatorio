const bcryptjs = require('bcryptjs');
const db = require('../database/models');

const mainController = {
  home: (req, res) => {
    db.Book.findAll({
      include: [{ association: 'authors' }]
    })
      .then((books) => {
        res.render('home', { books });
      })
      .catch((error) => console.log(error));
  },
  bookDetail: (req, res) => {
    db.Books.findByPk(req.params.id)
        .then((Books) => {
          res.render("Books", {Books: Books})
        })
        .catch(function(error){
          console.log(error)});
    res.render('bookDetail');
  },
  bookSearch: (req, res) => {
    res.render('search', { books: [] });
  },
  bookSearchResult: (req, res) => {
    // Implement search by title
    res.render('search');
  },
  deleteBook: (req, res) => {
    db.Books.destroy({
      where: {id: req.params.id}
      })
  .then(() => {
    res.redirect("/")
  })
     .catch(function(error){
      console.log(error)});   
    res.render('home');
  },
  authors: (req, res) => {
    db.Author.findAll()
      .then((authors) => {
        res.render('authors', { authors });
      })
      .catch((error) => console.log(error));
  },
  authorBooks: (req, res) => {
    // Implement books by author
    res.render('authorBooks');
  },
  register: (req, res) => {
    res.render('register');
  },
  processRegister: (req, res) => {
    db.User.create({
      Name: req.body.name,
      Email: req.body.email,
      Country: req.body.country,
      Pass: bcryptjs.hashSync(req.body.password, 10),
      CategoryId: req.body.category
    })
      .then(() => {
        res.redirect('/');
      })
      .catch((error) => console.log(error));
  },
  login: (req, res) => {
    res.render('login');
  },
  processLogin: (req, res) => {
    db.User.findAll({where: {email: req.body.email}})
        .then((resultado) => {
        if (resultado.length == 0){
            res.render("login", {
                errors:{
                    email: {msg: "El email no corresponde a un usuario registrado" }}, 
                    oldData : req.body}
              )
        }else{
            let PassCheck = bcryptjs.compareSync(req.body.password, resultado[0].dataValues.password);
            if(PassCheck == true){
                let loggedUser = resultado[0].dataValues;
                delete loggedUser.Pass;
                req.session.loggedUser = loggedUser;

                if(req.body.recordar){
                    res.cookie("email", req.body.email, {maxAge: (1000*60)*2});
                    };
                if(loggedUser.role_id == 2){
                    return res.redirect("/user/perfil")
                }else{
                    return res.redirect("/user/admin")
                }
                
            }else{
                return res.render("login", {errors:{Pass: {msg: "La contraseña no es correcta"}}});
                    };
            };
        }
    )
    .catch(function(error){
        console.log(error)
    })
    res.render('home');
  },
  edit: (req, res) => {
    db.Books.findByPk(req.params.id)
      .then((product) => {
        res.render('editBook', {id: req.params.id})
      })
      .catch(function(error){
        console.log(error)});
  },
  processEdit: (req, res) => {
    db.Books.update(
      {
          ...req.body,
          image: req.file.filename
      },             
      {
          where: {id: req.params.id}
      },
  )
  .then(() => {
      res.redirect("/")
  })
    .catch(function(error){
      console.log(error)});
    res.render('home');
  }
};

module.exports = mainController;
