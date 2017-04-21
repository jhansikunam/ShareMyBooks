const mongoCollections = require("../config/mongoCollections");
const users = mongoCollections.users;
const uuid = require('node-uuid');
const bcrypt = require("bcrypt-nodejs");


let exportedMethods = {
    getAllUsers() {
        return users().then((usersCollection) => {
            return usersCollection.find({}).toArray();
        });
    },
    addUser(user) {

        return users().then((usersCollection) => {
            let newUser = {
                _id: uuid.v4(),
                firstName: user.firstName,
                lastName: user.lastName,
                userID: user.userID,
                passwordHash: bcrypt.hashSync(user.passwordHash),
                address: user.address,
                email: user.email,
                phoneNumber: user.phoneNumber,
                userPhotoID: user.userPhotoID,
                userTotalPoints: user.userTotalPoints
            };
            return usersCollection.findOne({ email: user.email }).then((user) => {
                if (user) throw "Email already exists.";
                else {
                    return usersCollection.insertOne(newUser).then((result) => {
                        return result.insertedId;
                        // return result;
                    }).then((newId) => {
                        this.getUserById(newId).then((user) => {
                            console.log(user);
                        });

                        return this.getUserById(newId);
                    });
                }
            });
        });

    },
    getUserByUserId(id) {
        return users().then((userCollection) => {
            return userCollection.findOne({ userID: id }).then((user) => {
                if (!user) throw "User not found";
                return user;
            });
        });

    },
    //This method is used in the passport authentication deserializing. cb - callback
    getUserByIDPassport(id, cb) {
        return users().then((usersCollection) => {
            return usersCollection.findOne({ _id: id }).then((user) => {
                if (!user) cb(new Error('User ' + id + ' does not exist'));
                return cb(null, user);
            });
        });
    },


    // This method is used in the passport authentication strategy. cb - callback
    getUserByEmailPassport(email, cb) {
        return users().then((usersCollection) => {
            return usersCollection.findOne({ email: email }).then((user) => {
                if (!user) return cb(null, null);;
                return cb(null, user);;
            });
        });
    },

    getUserById(id) {
        return users().then((usersCollection) => {
            return usersCollection.findOne({ _id: id }).then((user) => {
                if (!user) {
                    console.log('User ' + id + ' does not exist');
                }
                return user;
            });
        });
    },
    updateUser(id, updateUser) {
        if (!id || !updateUser || id == undefined || updateUser == undefined) {
            return Promise.reject("Please valid input for user.\n");
        }
        return users().then((usersCollection) => {
            let updatedUserData = {};
            if (updateUser.firstName) {
                updatedUserData.firstName = updateUser.firstName;
            }

            if (updateUser.lastName) {
                updatedUserData.lastName = updateUser.lastName
            }

            if (updateUser.userID) {
                updatedUserData.userID = updateUser.userID;
            }

            if (updateUser.address) {
                updatedUserData.address = updateUser.address;
            }

            if (updateUser.email) {
                updatedUserData.email = updateUser.email;
            }

            if (updateUser.phoneNumber) {
                updatedUserData.phoneNumber = updateUser.phoneNumber;
            }

            if (updateUser.userPhotoID) {
                updatedUserData.userPhotoID = updateUser.userPhotoID;
            }

            if (updateUser.userTotalPoints) {
                updatedUserData.userTotalPoints = updateUser.userTotalPoints;
            }

            if (updateUser.passwordHash) {
                updatedUserData.passwordHash = bcrypt.hashSync(updateUser.passwordHash);
            }



            let updateCommand = {
                $set: updatedUserData
            };
            return booksCollection.updateOne({ _id: id }, updateCommand).then(() => {
                return this.getBookById(id);
            }).catch((err) => {
                console.log("Error while updating book:", err);
            });

        });

    },
    deleteUserById(id){
        return books().then((booksCollection)=>{
            return booksCollection.deleteOne({_id:id}).then((deletionInfo)=>{
                if (deletionInfo.deletedCount === 0) {
                    throw `Could not delete user with id of ${id}`
                }
                else {
                    return id;
                }
            }).catch((e) => {
                console.log("Error while removing user:", e);
            });
        });
        
    },


    updateUserPic(requestBody) {
        return users().then((usersCollection) => {
            let updateUser = {
                imagePath: requestBody.image
            }
            let updateCommand = {
                $set: updateUser
            };
            return usersCollection.updateOne({ _id: requestBody.userid }, updateCommand).then(() => {
                return this.getUserByID(requestBody.userid);
            });
        });
    }
}

module.exports = exportedMethods;