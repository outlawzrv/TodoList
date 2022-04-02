const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash')

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/tododb");

const dataSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [dataSchema],
});

const Data = mongoose.model("todo", dataSchema);
const List = mongoose.model("list", listSchema);

let item1 = new Data({
  name: "Welcome to your todolist!",
});
let item2 = new Data({
  name: "Hit the + button to add a new item.",
});
let item3 = new Data({
  name: "<== Hit this to delete an item",
});
let defaultItem = [item1, item2, item3];

// Hosting and functions of sites--------------------------------------------------------------------------------------

app.get("/", function (req, res) {
  Data.find((err, result) => {
    if (result.length === 0) {
      Data.insertMany(defaultItem);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});

app.get("/:newList", function (req, res) {
  const newList = _.capitalize(req.params.newList);
  List.findOne({ name: newList }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: newList,
          items: defaultItem,
        });
        list.save();
        res.redirect("/" + newList);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

// all Post methods-------------------------------------------------------------------------------------------

app.post("/", function (req, res) {
  const itemName = _.capitalize(req.body.newItem);
  const listName = req.body.list;
  let newItem = new Data({
    name: itemName,
  });
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (req, result) {
      result.items.push(newItem);
      result.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  let deleteId = req.body.change;
  let listName = req.body.listName
  if (listName=== "Today"){
    Data.findByIdAndRemove(deleteId, function (err) {});
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteId}}}, function(err, result){})
    res.redirect("/"+listName)
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
