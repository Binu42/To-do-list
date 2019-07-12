//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');


const aboutContent = "This Blog post is Created by Binu kumar. He is currently a second year Computer Science undergraduate. I created this website with the user's perspective in mind.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-Binu:' + process.env.password + '@cluster0-9npsv.mongodb.net/todolistDB', {
  useNewUrlParser: true
});
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
const Item = new mongoose.model('Item', itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = new mongoose.model('List', listSchema);

const item1 = new Item({
  name: "Welcome to our todolist"
});
const item2 = new Item({
  name: "Hit the + icon to add new item to list"
});
const item3 = new Item({
  name: "<<-- Hit this to delete item from list"
});
const defaultItem = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find(function (error, items) {
    if (!error) {
      if (items.length === 0) {
        Item.insertMany(defaultItem, function (error) {
          if (error) {
            console.log(error);
          } else {
            console.log("3 item inserted successfully");
          }
        });
        res.redirect('/');
      } else {
        res.render("list", {
          listTitle: 'Today',
          newListItems: items
        });
      }
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const ListName = req.body.list;
  console.log(itemName, List);
  const item = new Item({
    name: itemName
  });
  if (ListName === "Today") {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({
      name: ListName
    }, function (error, foundlist) {
      if (!error) {
        foundlist.items.push(item);
        foundlist.save();
        res.redirect('/' + ListName);
      }
    });
  }
});

app.post('/remove', function (req, res) {
  // console.log(req.body.checkbox, req.body.nameList);
  const checkbox = req.body.checkbox;
  const nameList = req.body.nameList;
  if (nameList === 'Today') {
    Item.deleteOne({
      _id: req.body.checkbox
    }, function (error) {
      if (!error) {
        console.log("successully Removed");
      }
    });
    res.redirect('/');
  } else {
    List.findOneAndUpdate({
      name: nameList
    }, {
      $pull: {
        items: {
          _id: checkbox
        }
      }
    }, (err, doc) => {
      if (!err) {
        res.redirect('/' + nameList);
      }
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});

app.get("/:customListName", function (req, res) {
  var customListName = _.lowerCase(req.params.customListName);
  customListName = _.capitalize(customListName);
  List.findOne({
    name: customListName
  }, function (error, foundlist) {
    if (!error) {
      if (!foundlist) {
        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        res.render('list', {
          listTitle: foundlist.name,
          newListItems: foundlist.items
        });
      }
    }
  });
});

app.listen(process.env.PORT || 4000, function () {
  console.log("Server started on port 3000");
});