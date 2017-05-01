const mongoCollections = require("../config/mongoCollections");
const es = require("../elastic");
const elasticsearch = es.book;
const books = mongoCollections.books;
const users = mongoCollections.users;
const uuid = require('node-uuid');
const time = require('time');
const data = require("../data");
const userData = data.user;
var xss = require('node-xss').clean;


let exportedMethods = {
    getAllBooks() {
        return books().then((booksCollection) => {
            return booksCollection.find({}).toArray();
        });
    },
    calculateBooksPointsValue(book) {
        let currentPoints = 0;
        var date = new Date();
        var currentYear = date.getFullYear();
        //if 2009 + 5 = 2014 < 2017
        if (book.Year + 5 < currentYear) {
            currentPoints = 3;
        }
        else if (book.Year + 10 < currentYear) {
            currentPoints = 2;
        }
        else {
            currentPoints = 1;
        }
        if (book.Condition == "great") {
            currentPoints += 3;
        }
        else if (book.Condition == "good") {
            currentPoints += 2;
        }
        else {
            //condition is poor
            currentPoints += 1;
        }
        return currentPoints;
    },
    addBook(book) {
        return books().then((booksCollection) => {
            let id = uuid.v4();
            let bookPointsValueCalculation = this.calculateBooksPointsValue(book);
            let newBook = {
                _id: id,
                uploadedBy: xss(book.uploadedBy),
                Title: xss(book.Title),
                Author: xss(book.Author),
                bookPhotoID1: id,
                bookPhotoID2: xss(book.bookPhotoID2),
                bookPhotoID3: xss(book.bookPhotoID3),
                Year: xss(book.Year),
                Category: xss(book.Category),
                Condition: xss(book.Condition),
                Location: xss(book.Location),
                Description: xss(book.Description),
                bookPointsValue: bookPointsValueCalculation,
                timestampOfUpload: new time.Date(),
                numberOfRequests: 0,
                visibleBoolean: xss(book.visibleBoolean)
            };

            return booksCollection.findOne({ Title: book.Title }).then((book) => {
                if (book) {
                    throw "Book already exists.";
                    // return book;
                }
                else {
                    return booksCollection.insertOne(newBook).then((newBookInfo) => {
                        return newBookInfo.insertedId;
                    }).then((newId) => {
                        this.getBookById(newId).then((book) => {
                            book.bookUUID = book["_id"];
                            delete book["_id"];
                            elasticsearch.addBook(book);
                        }).catch((e)=>{
                            throw "Error while adding book to elastic search";
                        });
                        return this.getBookById(newId);
                    }).then((book)=>{
                        this.updateUserPoints(book._id,book.uploadedBy,book.bookPointsValue).then((book)=>{
                            return this.getBookById(book._id);
                        });
                        return this.getBookById(book._id);
                    });
                    
                }
            });

        }).catch((e) => {
            console.log("Error while adding book:", e);
        });
    },
    updateUserPoints(bookid,userid,points){
        //return userData.updateUserTotalPoints(userid,points).then((user)=>{
          //  return user;
        //})
        return users().then((usersCollection) => {
            return usersCollection.findOne({ userID: userid }).then((requestedUser) => {
                if (!requestedUser) throw "user not foound";
                let updateData = {
                    userTotalPoints: requestedUser.userTotalPoints + points
                }
                let updateCommand = {
                    $set: updateData
                }
                return usersCollection.updateOne({ userID: userid }, updateCommand).then((updatedUser) => {
                    return this.getBookById(bookid);
                });
            })
        });
    
    },
    getBookById(id) {
        return books().then((booksCollection) => {
            return booksCollection.findOne({ _id: id }).then((book) => {
                if (!book) throw "Book not found";
                return book;
            });
        });
    },
    getBookByUserId(userid) {
        return books().then((booksCollection) => {
            return booksCollection.findOne({ _id: id }).then((book) => {
                if (!book) throw "Book not found";
                return book;
            });
        });
    },
    deleteBookById(id) {
        return books().then((booksCollection) => {
            return booksCollection.removeOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw `Could not delete book with id of ${id}`
                }
                else {
                    return id;
                }
            }).catch((e) => {
                console.log("Error while removing book:", e);
            });
        });
    },
    addNumberOfRequestsOfId(id) {
        return books().then((booksCollection) => {
            return booksCollection.findOne({ _id: id }).then((book) => {
                if (!book) throw "Book not found";
                let updateData = {
                    numberOfRequests: book.numberOfRequests + 1,
                }
                let updateCommand = {
                    $set: updateData
                }
                return booksCollection.updateOne({ _id: id }, updateCommand).then(() => {
                    return this.getBookById(id);
                });
            });
        });
    },
    updateBookInfo(id, updateBook) {
        if (!id || !updateBook || id == undefined || updateBook == undefined) {
            return Promise.reject("Please valid input for your book.\n");
        }

        return books().then((booksCollection) => {
            let updatedBookData = {};

            if (updateBook.Title) {
                updatedBookData.title = xss(updateBook.title);
            }

            if (updateBook.Author) {
                updatedBookData.Author = xss(updateBook.Author);
            }

            if (updateBook.bookPhotoID1) {
                updatedBookData.bookPhotoID1 = xss(updateBook.bookPhotoID1);
            }

            if (updateBook.bookPhotoID2) {
                updatedBookData.bookPhotoID2 = xss(updateBook.bookPhotoID2);
            }

            if (updateBook.bookPhotoID3) {
                updatedBookData.bookPhotoID3 = xss(updateBook.bookPhotoID3);
            }

            if (updateBook.Year) {
                updatedBookData.Year = xss(updateBook.Year);
            }

            if (updateBook.Category) {
                updatedBookData.Category = xss(updateBook.Category);
            }

            if (updateBook.Condition) {
                updatedBookData.Condition = xss(updateBook.Condition);
            }

            if (updateBook.Location) {
                updatedBookData.Location = xss(updateBook.Location);
            }

            if (updateBook.Description) {
                updatedBookData.Description = xss(updateBook.Description);
            }

            if (updateBook.bookPointsValue) {
                updatedBookData.bookPointsValue = xss(updateBook.bookPointsValue);
            }

            if (updateBook.visibleBoolean === false) {
                updatedBookData.visibleBoolean = false;
            }
            else if (updateBook.visibleBoolean === true) {
                updatedBookData.visibleBoolean = true;
            }

            let updateCommand = {
                $set: updatedBookData
            };
            return booksCollection.updateOne({ _id: id }, updateCommand).then(() => {
                return this.getBookById(id);
            }).catch((err) => {
                console.log("Error while updating book:", err);
            });

        });
    },
    searchForBook(searchText) {
        return elasticsearch.searchForBook(searchText).then((bookList)=>{
            result = []
            bookList.forEach(function(book) {
                book["_source"]._id = book["_source"]["bookUUID"];
                delete book["_source"]["bookUUID"];
                result.push(book["_source"]);
            }, this);
           return result;
        });
    },
    getAllBookCategories(){
        let categoryList=[];
        return books().then((booksCollection) => {
            return booksCollection.find({}).toArray().then((books)=>{
                books.forEach(function(book) {
                if (categoryList.indexOf(book.Category) == -1) {
                    //Not in the array!
                    categoryList.push(book.Category);
                }
            });
            return categoryList;
        });
    });
    },
    viewBooksByCategory(category) {
        return books().then((booksCollection) => {
            return booksCollection.find({Category:category}).toArray();
        })
    }
}

module.exports = exportedMethods;