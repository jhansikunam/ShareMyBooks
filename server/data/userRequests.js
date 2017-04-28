const mongoCollections = require("../config/mongoCollections");
const userRequests = mongoCollections.userRequests;
const uuid = require('node-uuid');
const time = require('time');

const redis = require('redis');
const client = redis.createClient();


let exportedMethods = {
    addUserRequest(request) {
        return userRequests().then((userRequestsCollection) => {
            let newRequest = {
                _id: uuid.v4(),
                requestFrom: request.requestFrom,
                requestTo: request.requestTo,
                status: -1,
                message: request.message
            };
            return userRequestsCollection.insertOne(newRequest).then((result) => {
                return result.insertedId;
                // return result;
            }).then((newId) => {
                this.getRequestById(newId).then(async (user) => {
                    // cache
                    let p = await client.hmsetAsync(newId, flat(user));
                });
                
                return this.getRequestById(newId);
            });


        });
    },
    getAllRequests() {
        return userRequests().then((userRequestsCollection) => {
            return userRequestsCollection.find({}).toArray();
        });
    },
    async getRequestById(id) {
        let p = await client.hgetallAsync(id);
        return userRequests().then((userRequestsCollection) => {
            return userRequestsCollection.findOne({ _id: id }).then((userRequest) => {
                if (!userRequest) throw "user request not found";
                return userRequest;
            });
        });
    },
    deleteRequestById(id) {
        return userRequests().then((userRequestsCollection) => {
            this.getRequestById(id).then(async (userRequest)=> {
                let p = await client.delAsync(userRequest);
            });
            return userRequestsCollection.deleteOne({ _id: id }).then((deletionInfo) => {
                if (deletionInfo.deletedCount === 0) {
                    throw `Could not delete request with id of ${id}`
                }
                else {
                    return id;
                }
            }).catch((e) => {
                console.log("Error while removing request:", e);
            });
        });
    },
    viewRequestByFromUserId(id) {
        return userRequests().then((userRequestsCollection) => {
            return userRequestsCollection.find({ requestFrom: id }).toArray();
        });
    },
    viewRequestByToUserId(id) {
        return userRequests().then((userRequestsCollection) => {
            return userRequestsCollection.find({ requestTo: id }).toArray();
        });
    },
    acceptUserRequest(id) {
        return userRequests().then((userRequestsCollection) => {
            return userRequestsCollection.findOne({ _id: id }).then((userRequest) => {
                if (!userRequest) throw "request not foound";
                let updateData = {
                    status: 1,
                }
                let updateCommand = {
                    $set: updateData
                }
                return userRequestsCollection.updateOne({ _id: id }, updateCommand).then(() => {
                    return this.getRequestById(id);
                });
            })
        });
    },
    rejectUserRequest(id) {
        return userRequests().then((userRequestsCollection) => {
            return userRequestsCollection.findOne({ _id: id }).then((userRequest) => {
                if (!userRequest) throw "request not foound";
                let updateData = {
                    status: 0,
                }
                let updateCommand = {
                    $set: updateData
                }
                return userRequestsCollection.updateOne({ _id: id }, updateCommand).then(() => {
                    return this.getRequestById(id);
                });
            })
        });
    }

}

module.exports = exportedMethods;