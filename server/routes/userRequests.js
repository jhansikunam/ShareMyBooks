const data = require("../data");
const express = require('express');
const router = express.Router();
const userRequestsData = data.userRequests;
const userData = data.user;


// only for debugging
router.get("/", (req, res) => {
    userRequestsData.getAllRequests().then((requestList) => {
        res.status(200).json(requestList);
    });
});

router.get("/viewRequestByFromUserId/:id", (req, res) => {
    userRequestsData.viewRequestByFromUserId(req.params.id).then(async (userRequest) => {
        var result = []
        for (var ur in userRequest) {
            let fromUserInfo = await userData.getUserById(userRequest[ur].requestFrom);
            let toUserInfo = await userData.getUserById(userRequest[ur].requestTo);
            result.push({ requestResult:userRequest[ur], "fromUserInfo": fromUserInfo, "toUserInfo": toUserInfo })
        } res.status(200).json({
            success: true,
            message: result
        });
    });
});


router.get("/viewRequestByToUserId/:id", (req, res) => {
    userRequestsData.viewRequestByToUserId(req.params.id).then(async (userRequest) => {
         var result = []
        for (var ur in userRequest) {
            let fromUserInfo = await userData.getUserById(userRequest[ur].requestFrom);
            let toUserInfo = await userData.getUserById(userRequest[ur].requestTo);
            result.push({ requestResult:userRequest[ur], "fromUserInfo": fromUserInfo, "toUserInfo": toUserInfo })
        } res.status(200).json({
            success: true,
            message: result
        });
    });
});


router.get("/:id", (req, res) => {
    let requestId = req.params.id;
    userRequestsData.getRequestById(requestId).then(async (requestResult) => {
        let fromUserInfo = await userData.getUserById(requestResult.requestFrom);
        let toUserInfo = await userData.getUserById(requestResult.requestTo);
        res.status(200).json({
            success: true,
            message: { requestResult, "fromUserInfo": fromUserInfo, "toUserInfo": toUserInfo }
        });
    }).catch((e) => {
        res.sendStatus(500);
    });
});

router.post("/", (req, res) => {
    userRequestsData.addUserRequest(req.body).then((userRequest) => {
        if (!userRequest) {
            res.status(200).json({
                success: false,
                message: "Error while adding a user request!"
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: userRequest
            });
        }
    });
});

router.delete("/:id", (req, res) => {
    userRequestsData.deleteRequestById(req.params.id).then((userRequestId) => {
        if (!userRequestId) {
            res.status(200).json({
                success: false,
                message: "Error while deleting a user request!"
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: userRequestId
            });
        }
    });
});

//  accept as status=1, 
// reject as status=0, 
// initial status of -1.
router.put("/acceptUserRequest/:id", (req, res) => {
    userRequestsData.acceptUserRequest(req.params.id).then((userRequest) => {
        if (!userRequest) {
            res.status(200).json({
                success: false,
                message: "Error while updating a user request!"
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: userRequest
            });
        }
    });
});

router.put("/rejectUserRequest/:id", (req, res) => {
    userRequestsData.rejectUserRequest(req.params.id).then((userRequest) => {
        if (!userRequest) {
            res.status(200).json({
                success: false,
                message: "Error while updating a user request!"
            });
        }
        else {
            res.status(200).json({
                success: true,
                message: userRequest
            });
        }
    });
});



module.exports = router;
